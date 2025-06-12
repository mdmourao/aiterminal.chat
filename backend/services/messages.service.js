import chatsRepository from "../repositories/chats.repository.js";
import messageRepository from "../repositories/messages.repository.js";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import logger from "../utils/logger.js";

class MessageService {
  async createMessage(req, res, createMessageDTO) {
    console.log("Creating message with DTO:", createMessageDTO);
    try {
      let chat;
      if (
        createMessageDTO.chatId === undefined ||
        createMessageDTO.chatId === ""
      ) {
        logger.info("No Chat ID, creating new chat");
        chat = await chatsRepository.create(req.user.id);
      } else {
        logger.info(`Using ChatID: ${createMessageDTO.chatId}`);
        chat = await chatsRepository.getById(
          createMessageDTO.chatId,
          req.user.id
        );
      }

      if (!chat) {
        throw new Error("Chat not found.");
      }

      // save message
      const message = await messageRepository.create({
        chatId: chat.id,
        role: "user",
        model: createMessageDTO.model,
        content: createMessageDTO.content,
        streamedComplete: true,
      });

      logger.info("Message Created: OK");

      // add to array
      if (!chat.messages) {
        chat.messages = [message];
      } else {
        chat.messages = [...chat.messages, message];
      }

      // Start Streaming
      res.write(`event: chatDetails\n`);

      res.write(
        `data: ${JSON.stringify({
          chatId: chat.id,
        })}\n\n`
      );

      const messages = chat.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      console.log("Messages for AI:", messages);

      // Request AI
      let fullResponseContent = "";
      const result = streamText({
        model: openai(createMessageDTO.model),
        messages: messages,
      });

      for await (const delta of result.fullStream) {
        if (delta.type === "text-delta") {
          fullResponseContent += delta.textDelta;
          res.write(`event: textDelta\n`);
          res.write(
            `data: ${JSON.stringify({
              messageId: message.id,
              content: delta.textDelta,
            })}\n\n`
          );
        }
      }

      // End: Save all
      await messageRepository.create({
        chatId: chat.id,
        role: "assistant",
        model: createMessageDTO.model,
        content: fullResponseContent,
        streamedComplete: true,
      });

      res.write(`event: streamComplete\n`);
      res.write(
        `data: ${JSON.stringify({
          messageId: message.id,
          finalContent: fullResponseContent,
        })}\n\n`
      );

      logger.info("All done: streamComplete");
    } catch (error) {
      logger.error(error, "Error in service");
      if (!res.writableEnded) {
        res.write(`event: error\n`);
        res.write(
          `data: ${JSON.stringify({
            error: error.message || "Unknown error",
          })}\n\n`
        );
      }

      // TODO: error: update complete and add message error?
    }
  }
}

export default new MessageService();

import chatsRepository from "../repositories/chats.repository.js";
import messageRepository from "../repositories/messages.repository.js";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { xai } from "@ai-sdk/xai";
import { anthropic } from "@ai-sdk/anthropic";
import { deepseek } from "@ai-sdk/deepseek";

import logger from "../utils/logger.js";
import subscriptionsRepository from "../repositories/subscriptions.repository.js";
import modelsRepository from "../repositories/models.repository.js";

class MessageService {
  async createMessage(req, res, createMessageDTO) {
    console.log("Creating message with DTO:", createMessageDTO);
    try {
      const model = await modelsRepository.getByValue(createMessageDTO.model);

      if (!model) {
        logger.error(
          `Model ${createMessageDTO.model} not found in the database.`
        );
        throw new Error(`Model ${createMessageDTO.model} not found.`);
      }

      let creditsDecremented;
      if (model.premium) {
        creditsDecremented =
          await subscriptionsRepository.decrementPremiumCreditsIfAvailable(
            req.user.id
          );
      } else {
        creditsDecremented =
          await subscriptionsRepository.decrementFreeCreditsIfAvailable(
            req.user.id
          );
      }

      // we should probably do this afte some checks, but I prefer to use a more close approach for now
      if (!creditsDecremented.success) {
        logger.warn("No credits available", req.user.id);
        throw new Error("No credits available");
      }

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

      let languageModelToUse;

      switch (model.value) {
        case "o4-mini":
        case "gpt-4.1-nano":
        case "o3-mini":
        case "gpt-3.5-turbo":
          languageModelToUse = openai(createMessageDTO.model);
          break;
        case "gemini-2.5-pro-preview-05-06":
        case "gemini-2.5-flash-preview-04-17":
          languageModelToUse = google(createMessageDTO.model);
          break;
        case "grok-3":
        case "grok-3-mini":
          languageModelToUse = xai(createMessageDTO.model);
          break;
        case "claude-4-sonnet-20250514":
        case "claude-4-opus-20250514":
          languageModelToUse = anthropic(createMessageDTO.model);
          break;
        case "deepseek-chat":
        case "deepseek-reasoner":
          languageModelToUse = deepseek(createMessageDTO.model);
          break;
        default:
          throw new Error(`Model ${createMessageDTO.model} is not supported.`);
      }

      logger.info(
        `Using model: ${JSON.stringify(languageModelToUse)} for chat ID: ${
          chat.id
        }`
      );

      // Request AI
      let fullResponseContent = "";
      const result = streamText({
        model: languageModelToUse,
        messages: messages,
      });

      for await (const delta of result.fullStream) {
        logger.info("new data");
        if (delta.type === "text-delta") {
          fullResponseContent += delta.textDelta;
          logger.info("stream data sendind");
          res.write(`event: textDelta\n`);
          res.write(
            `data: ${JSON.stringify({
              messageId: message.id,
              content: delta.textDelta,
            })}\n\n`
          );
        }
      }

      if (fullResponseContent.length === 0) {
        throw new Error("No content received from AI model");
      }

      logger.info("streamComplete");
      res.write(`event: streamComplete\n`);
      res.write(
        `data: ${JSON.stringify({
          messageId: message.id,
          finalContent: fullResponseContent,
        })}\n\n`
      );

      await messageRepository.create({
        chatId: chat.id,
        role: "assistant",
        model: createMessageDTO.model,
        content: fullResponseContent,
        streamedComplete: true,
      });

      logger.info(
        `Message streaming completed successfully: ${fullResponseContent}`
      );
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

      throw error;
    }
  }
}

export default new MessageService();

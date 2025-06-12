import chatsRepository from "../repositories/chats.repository.js";
import { BadRequestError } from "../utils/error.js";
import utils from "./utils.js";

class ChatsController {
  async get(req, res, next) {
    try {
      const { limit, offset } = utils.getLimitOffset(req);
      const userId = req.user.id;
      const chats = await chatsRepository.get(userId, limit, offset);
      const count = await chatsRepository.getCount(userId);
      res.status(200).json({
        count: count,
        data: chats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const chatId = req.params.id;
      if (!chatId) {
        throw new BadRequestError("Chat ID is required");
      }
      const userId = req.user.id;
      const chat = await chatsRepository.getById(chatId, userId);
      if (!chat) {
        throw new BadRequestError("Chat not found");
      }
      res.status(200).json(chat);
    } catch (error) {
      next(error);
    }
  }
}

export default new ChatsController();

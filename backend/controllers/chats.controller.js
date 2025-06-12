import chatsRepository from "../repositories/chats.repository.js";
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
}

export default new ChatsController();

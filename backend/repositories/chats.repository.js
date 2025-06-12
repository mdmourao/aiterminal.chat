import { chatQueries } from "../database/queries/chats.queries.js";
import { pool } from "../database/connection.js";

class ChatRepository {
  async create(userId) {
    const result = await pool.query(chatQueries.create, [userId]);
    return result.rows[0];
  }

  async getById(id, userId) {
    const result = await pool.query(chatQueries.getById, [id, userId]);
    return result.rows[0];
  }

  async get(userId, limit, offset) {
    const result = await pool.query(chatQueries.get, [userId, limit, offset]);
    return result.rows;
  }

  async getCount(userId) {
    const result = await pool.query(chatQueries.getCount, [userId]);
    return parseInt(result.rows[0].count, 10);
  }
}

export default new ChatRepository();

import { chatQueries } from "../database/queries/chats.queries.js";
import { pool } from "../database/connection.js";

class ChatRepository {
  async create() {
    const result = await pool.query(chatQueries.create, []);
    return result.rows[0];
  }

  async getById(id) {
    const result = await pool.query(chatQueries.getById, [id]);
    return result.rows[0];
  }
}

export default new ChatRepository();

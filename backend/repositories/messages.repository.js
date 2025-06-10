import { messagesQueries } from "../database/queries/messages.queries.js";
import { pool } from "../database/connection.js";

class MessageRepository {
  async create(messageData) {
    const { chatId, role, model, content, streamedComplete } = messageData;
    const result = await pool.query(messagesQueries.create, [
      chatId,
      role,
      model,
      content,
      streamedComplete,
    ]);
    return result.rows[0];
  }

  async update(messageData) {
    const { messageId, streamedComplete } = messageData;
    const result = await pool.query(messagesQueries.update, [
      messageId,
      streamedComplete,
    ]);
    return result.rows[0];
  }
}

export default new MessageRepository();

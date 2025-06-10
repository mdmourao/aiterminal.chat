import { userQueries } from "../database/queries/users.queries.js";
import { pool } from "../database/connection.js";

class UserRepository {
  async create(userData) {
    const { name, email, password_hash } = userData;
    const result = await pool.query(userQueries.create, [
      name,
      email,
      password_hash,
    ]);
    return result.rows[0];
  }

  async getByEmail(email) {
    const result = await pool.query(userQueries.getByEmail, [email]);
    return result.rows[0];
  }

  async getAll() {
    const result = await pool.query(userQueries.getAll);
    return result.rows;
  }
}

export default new UserRepository();

import { modelsQueries } from "../database/queries/models.queries.js";
import { pool } from "../database/connection.js";

class ModelsRepository {
  async get(limit, offset) {
    const result = await pool.query(modelsQueries.get, [limit, offset]);
    return result.rows;
  }
}

export default new ModelsRepository();

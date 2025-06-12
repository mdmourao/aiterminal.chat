import { modelsQueries } from "../database/queries/models.queries.js";
import { pool } from "../database/connection.js";

class ModelsRepository {
  async get() {
    const result = await pool.query(modelsQueries.get);
    return result.rows;
  }
}

export default new ModelsRepository();

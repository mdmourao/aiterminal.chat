import { modelsQueries } from "../database/queries/models.queries.js";
import { pool } from "../database/connection.js";

class ModelsRepository {
  async get() {
    const result = await pool.query(modelsQueries.get);
    return result.rows;
  }

  async getByValue(modelValue) {
    const result = await pool.query(modelsQueries.getByValue, [modelValue]);
    return result.rows[0];
  }
}

export default new ModelsRepository();

import logger from "../utils/logger.js";
import modelsRepository from "../repositories/models.repository.js";

class ModelsService {
  async getModels() {
    try {
      const models = await modelsRepository.get();
      return models;
    } catch (error) {
      logger.info(error, "Error in service");
      throw error;
    }
  }
}

export default new ModelsService();

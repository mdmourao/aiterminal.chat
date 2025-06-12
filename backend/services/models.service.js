import customLogger from "../utils/logger.js";
import modelsRepository from "../repositories/models.repository.js";

class ModelsService {
  async getModels(limit, offset) {
    try {
      const models = await modelsRepository.get(limit, offset);
      return models;
    } catch (error) {
      customLogger.info("Error in service: ", error);
      throw error;
    }
  }
}

export default new ModelsService();

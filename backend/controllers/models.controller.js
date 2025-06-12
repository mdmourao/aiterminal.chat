import modelsService from "../services/models.service.js";
import { ModelResponseDTO } from "../dto/models.dto.js";

class ModelsController {
  async getModels(req, res, next) {
    try {
      const models = await modelsService.getModels();

      const modelsResponseDTO = models.map(
        (model) => new ModelResponseDTO(model)
      );

      res.status(200).json({
        count: models.length,
        data: modelsResponseDTO,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ModelsController();

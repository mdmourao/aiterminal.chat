import { validateCreateMessage } from "../validators/messages.validator.js";
import { CreateMessageDTO } from "../dto/messages.dto.js";
import { BadRequestError } from "../utils/error.js";
import messagesService from "../services/messages.service.js";
import logger from "../utils/logger.js";
export const createMessage = async (req, res, next) => {
  try {
    const { error } = validateCreateMessage(req.body);
    if (error) {
      throw new BadRequestError(error.message);
    }

    logger.info("Creating message with body:" + JSON.stringify(req.body));

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const createMessageDTO = new CreateMessageDTO(req.body);
    await messagesService.createMessage(req, res, createMessageDTO);
  } catch (error) {
    logger.error(error, "Controller Error");

    if (!res.headersSent) {
      res.status(error.statusCode || 500).json({
        error: error.message || "Internal server error",
      });
    }

    next(error);
  }
};

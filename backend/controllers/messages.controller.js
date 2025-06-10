import { validateCreateMessage } from "../validators/messages.validator.js";
import { CreateMessageDTO } from "../dto/messages.dto.js";
import { BadRequestError } from "../utils/error.js";
import messagesService from "../services/messages.service.js";
import logger from "../utils/logger.js";

export const createMessage = async (req, res, next) => {
  // set connection to stream
  res.writeHead(200, {
    "Content-Type": "text/event-stream", // Server-Sent Events (SSE)
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    const { error } = validateCreateMessage(req.body);
    if (error) {
      return next(new BadRequestError(error.message));
    }

    const createMessageDTO = new CreateMessageDTO(req.body);
    await messagesService.createMessage(createMessageDTO, res);
  } catch (error) {
    logger.error("Controller Error:", error);
    if (!res.writableEnded) {
      res.write(`event: error\n`);
      res.write(
        `data: ${JSON.stringify({
          error: "Internal server error",
        })}\n\n`
      );
    }
    next(error);
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
  }
};

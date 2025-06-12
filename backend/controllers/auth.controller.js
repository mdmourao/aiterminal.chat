import { UserResponseDTO } from "../dto/users.dto.js";
import authService from "../services/auth.service.js";

export const getUserInfo = async (req, res, next) => {
  try {
    const info = authService.getUserInfo(req);
    const userResponseDTO = new UserResponseDTO(info);

    res.status(200).json({
      data: userResponseDTO,
    });
  } catch (error) {
    next(error);
  }
};

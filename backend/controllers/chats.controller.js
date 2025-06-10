import { UserResponseDTO } from "../dto/users.dto.js";
import { getUsers as getUsersService } from "../services/users.service.js";

export const getAllChats = async (req, res, next) => {
  try {
    const users = await getUsersService();

    const usersResponseDTO = users.map((user) => new UserResponseDTO(user));

    res.status(200).json({
      count: users.length,
      data: usersResponseDTO,
    });
  } catch (error) {
    next(error);
  }
};

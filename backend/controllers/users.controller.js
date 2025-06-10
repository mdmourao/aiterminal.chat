import { validateCreateUser } from "../validators/users.validator.js";
import { CreateUserDTO, UserResponseDTO } from "../dto/users.dto.js";
import {
  createUser as createUserService,
  getUsers as getUsersService,
} from "../services/users.service.js";
import { BadRequestError } from "../utils/error.js";

export const createUser = async (req, res, next) => {
  try {
    const { error } = validateCreateUser(req.body);
    if (error) {
      return next(new BadRequestError(error.message));
    }

    const createUserDTO = new CreateUserDTO(req.body);
    const user = await createUserService(createUserDTO);
    const userResponseDTO = new UserResponseDTO(user);

    res.status(201).json({
      data: userResponseDTO,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
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

import userRepository from "../repositories/users.repository.js";
import bcrypt from "bcrypt";
import { UserAlreadyExistsError } from "../utils/error.js";

export const createUser = async (createUserDTO) => {
  const existingUser = await userRepository.getByEmail(createUserDTO.email);
  if (existingUser) {
    throw new UserAlreadyExistsError();
  }

  const hashedPassword = await bcrypt.hash(createUserDTO.password, 10);

  const userData = {
    name: createUserDTO.name,
    email: createUserDTO.email,
    password_hash: hashedPassword,
  };

  const user = await userRepository.create(userData);
  return user;
};

export const getUsers = async () => {
  return await userRepository.getAll();
};

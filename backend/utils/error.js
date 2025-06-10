export class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor() {
    super("User already exists", 409, "USER_ALREADY_EXISTS");
  }
}

export class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400, "BAD_REQUEST");
  }
}

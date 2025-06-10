export const errorHandler = (error, req, res) => {
  if (error.statusCode || error.status) {
    return res.status(error.statusCode || error.status).json({
      message: error.message,
    });
  }

  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  });
};

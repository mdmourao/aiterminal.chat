logger.info("Starting aiterminal.chat API");

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import apiRoutes from "./routes/api.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import { pingDb } from "./database/connection.js";
import { limiter } from "./middlewares/limiter.js";
import logger from "./utils/logger.js";
await pingDb();

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import { authMiddleware } from "./middlewares/auth.js";

const app = express();

app.use(helmet());

app.get("/", (req, res) => {
  res.send("ok");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use(limiter);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.use(authMiddleware());

app.use("/api/v1", apiRoutes);

app.all(/(.*)/, (req, res) => {
  res.status(404).json({
    status: "not found",
    detail: req.url + " not found on this server",
  });
});

app.use(errorHandler);

app.use(
  cors({
    origin: process.env.TRUSTED_ORIGINS?.split(",") || [],
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});

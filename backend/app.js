logger.info("Starting aiterminal.chat API");

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import apiRoutes from "./routes/api.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { pingDb } from "./database/connection.js";
import { limiter } from "./middlewares/limiter.js";
import logger from "./utils/logger.js";
import { auth } from "./lib/auth.js";
import { authMiddleware } from "./middlewares/auth.js";
import paymentsController from "./controllers/payments.controller.js";

await pingDb();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.TRUSTED_ORIGINS?.split(",") || [],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("ok");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.all("/api/auth/*splat", toNodeHandler(auth));
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentsController.webhook
);

app.use(express.json());
app.use(limiter);

app.use("/api/v1", authMiddleware(), apiRoutes);

app.all(/(.*)/, (req, res) => {
  res.status(404).json({
    status: "not found",
    detail: req.url + " not found on this server",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});

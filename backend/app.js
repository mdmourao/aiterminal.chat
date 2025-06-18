logger.info("Starting aiterminal.chat API");

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import apiRoutes from "./routes/api.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { pingDb } from "./database/connection.js";
import logger from "./utils/logger.js";
import { auth } from "./lib/auth.js";
import { authMiddleware } from "./middlewares/auth.js";
import subscriptionsController from "./controllers/subscriptions.controller.js";
import session from "express-session";
import cookieParser from "cookie-parser";

await pingDb();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_BASE_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "a very secret key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain:
        process.env.NODE_ENV === "production" ? ".aiterminal.chat" : undefined,
    },
  })
);

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
  "/api/v1/subscriptions/webhook",
  express.raw({ type: "application/json" }),
  subscriptionsController.webhook
);

app.use(express.json());

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

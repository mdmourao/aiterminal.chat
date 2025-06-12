import express from "express";
import authRoutes from "./auth.routes.js";
import chatRoutes from "./chats.routes.js";
import messagesRoutes from "./messages.routes.js";

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/chats", chatRoutes);
router.use("/messages", messagesRoutes);

export default router;

import express from "express";
import userRoutes from "./users.routes.js";
import chatRoutes from "./chats.routes.js";
import messagesRoutes from "./messages.routes.js";

const router = express.Router();
router.use("/users", userRoutes);
router.use("/chats", chatRoutes);
router.use("/messages", messagesRoutes);

export default router;

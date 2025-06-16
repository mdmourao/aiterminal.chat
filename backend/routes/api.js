import express from "express";
import authRoutes from "./auth.routes.js";
import chatRoutes from "./chats.routes.js";
import messagesRoutes from "./messages.routes.js";
import modelsRoutes from "./models.routes.js";
import subscriptionsRoutes from "./subscriptions.routes.js";

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/chats", chatRoutes);
router.use("/messages", messagesRoutes);
router.use("/models", modelsRoutes);
router.use("/subscriptions", subscriptionsRoutes);

export default router;

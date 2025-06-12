import express from "express";
import chatsController from "../controllers/chats.controller.js";

const router = express.Router();
router.get("/", chatsController.get);

export default router;

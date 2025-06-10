import express from "express";
import { createMessage } from "../controllers/messages.controller.js";

const router = express.Router();
router.post("/", createMessage);

export default router;

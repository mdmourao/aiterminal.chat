import express from "express";
import { getAllChats } from "../controllers/chats.controller.js";

const router = express.Router();
router.get("/", getAllChats);

export default router;

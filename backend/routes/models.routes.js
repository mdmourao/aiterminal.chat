import express from "express";
import modelsController from "../controllers/models.controller.js";

const router = express.Router();
router.get("/", modelsController.getModels);

export default router;

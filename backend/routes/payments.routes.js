import express from "express";
import paymentsController from "../controllers/payments.controller.js";

const router = express.Router();
router.post(
  "/create-checkout-session",
  paymentsController.createCheckoutSession
);
router.post("/create-portal-session", paymentsController.createPortalSession);

export default router;

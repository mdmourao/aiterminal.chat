import express from "express";
import subscriptionsController from "../controllers/subscriptions.controller.js";

const router = express.Router();
router.post(
  "/create-checkout-session",
  subscriptionsController.createCheckoutSession
);
router.post(
  "/create-portal-session",
  subscriptionsController.createPortalSession
);

export default router;

import paymentsService from "../services/payments.service.js";
import { BadRequestError } from "../utils/error.js";
import customLogger from "../utils/logger.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentsController {
  async createCheckoutSession(req, res, next) {
    customLogger.info("createCheckoutSession");
    try {
      const session = await paymentsService.createCheckoutSession(req);
      res.redirect(303, session.url);
    } catch (error) {
      next(error);
    }
  }

  async createPortalSession(req, res, next) {
    customLogger.info("createPortalSession");
    try {
      const { session_id } = req.body;
      const portalSession = await paymentsService.createCheckoutSession(
        session_id
      );
      res.redirect(303, portalSession.url);
    } catch (error) {
      next(error);
    }
  }

  async webhook(req, res, next) {
    customLogger.info("webhook");
    try {
      let event = req.body;
      const endpointSecret = "whsec_12345";
      // Only verify the event if you have an endpoint secret defined.
      // Otherwise use the basic event deserialized with JSON.parse
      if (endpointSecret && process.env.NODE_ENV === "production") {
        const signature = req.headers["stripe-signature"];
        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            endpointSecret
          );
        } catch (err) {
          customLogger.error(err, "Webhook signature verification failed.");
          throw new BadRequestError("Webhook signature verification failed.");
        }
      } else {
        event = JSON.parse(req.body);
      }
      await paymentsService.webhook(event);
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentsController();

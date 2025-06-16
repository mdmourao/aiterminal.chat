import config from "../config/index.js";
import subscriptionsRepository from "../repositories/subscriptions.repository.js";
import logger from "../utils/logger.js";
import Stripe from "stripe";

const stripe = new Stripe(config.stripe.secretKey);

class SubscriptionsService {
  async createCheckoutSession(req) {
    try {
      const subscription = await this.getUserSubscription(req.user.id);
      if (!subscription) {
        throw new Error(
          `No subscription found for user ID: ${req.user.id}. Please create a subscription first.`
        );
      }

      if (subscription.source === "stripe" && subscription.plan === "premium") {
        throw new Error(
          "User already has a Stripe subscription. Cannot create another checkout session."
        );
      }

      const { lookup_key } = req.body;
      if (!lookup_key) {
        throw new Error(
          "Missing 'lookup_key' in request body for createCheckoutSession."
        );
      }

      const prices = await stripe.prices.list({
        lookup_keys: [lookup_key],
        expand: ["data.product"],
      });

      if (!prices.data || prices.data.length === 0) {
        throw new Error(`No price found for lookup_key: ${lookup_key}`);
      }

      const session = await stripe.checkout.sessions.create({
        billing_address_collection: "auto",
        line_items: [
          {
            price: prices.data[0].id,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${config.app.frontendBaseUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.app.frontendBaseUrl}?canceled=true`,
        customer_email: req.user?.email || undefined,
        client_reference_id: req.user?.id || undefined,
        automatic_tax: { enabled: true },
        subscription_data: {
          metadata: {
            userId: req.user?.id,
          },
        },
      });
      logger.info(`Stripe Checkout Session created: ${session.id}`);
      return session;
    } catch (error) {
      logger.error(`Error creating checkout session: ${error.message}`, error);
      throw error;
    }
  }

  async createPortalSession(req) {
    try {
      const subscription = await subscriptionsRepository.getUserSubscription(
        req.user.id
      );
      if (!subscription) {
        throw new Error("Subcription not found");
      }

      const returnUrl = config.app.frontendBaseUrl;

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: returnUrl,
      });

      return portalSession;
    } catch (error) {
      logger.error(`Error creating portal session: ${error.message}`, error);
      throw error;
    }
  }

  async webhook(event) {
    try {
      switch (event.type) {
        case "customer.subscription.created":
          await handleSubscriptionCreated(event.data.object);
          break;

        case "invoice.payment_succeeded":
          await handleInvoicePaymentSucceeded(event.data.object);
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event.data.object);
          break;

        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event.data.object);
          break;

        case "invoice.payment_failed":
          await handleSubscriptionFailed(event.data.object);
          break;

        default:
          logger.warn(`Unhandled Stripe webhook event type: ${event.type}`);
      }
    } catch (error) {
      logger.error(
        `Error processing webhook event ${event.type}: ${error.message}`,
        error
      );

      throw error;
    }
  }

  async getUserSubscription(userId) {
    try {
      let subscription;
      subscription = await subscriptionsRepository.getUserSubscription(userId);
      if (!subscription) {
        const periodStart = new Date();
        const periodEnd = new Date(
          periodStart.getTime() +
            parseInt(config.plans.durationDays, 10) * 24 * 60 * 60 * 1000
        );

        subscription = await subscriptionsRepository.create({
          userId,
          status: "created",
          plan: "free",
          source: "system",
          premiumCredits: parseInt(config.plans.free.premiumCredits, 10),
          credits: parseInt(config.plans.free.credits, 10),
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        });
      }

      subscription = {
        ...subscription,
        // lowercase quota fields for consistency
        premium_credits_quota: parseInt(
          subscription.plan === "premium"
            ? config.plans.premium.premiumCredits
            : config.plans.free.premiumCredits,
          10
        ),
        credits_quota: parseInt(
          subscription.plan === "premium"
            ? config.plans.premium.credits
            : config.plans.free.credits,
          10
        ),
      };

      return subscription;
    } catch (error) {
      logger.error(
        `Error retrieving subscription for user ${userId}: ${error.message}`,
        error
      );
      throw error;
    }
  }
}

export default new SubscriptionsService();

async function handleSubscriptionDeleted(subscription) {
  return await downgradeToFreePlan(subscription);
}

async function handleSubscriptionFailed(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) {
      throw new Error(
        "No subscription ID found in invoice. Cannot handle subscription failure."
      );
    }

    const canceledSubscription = await stripe.subscriptions.cancel(
      subscriptionId
    );
    logger.info(
      `Subscription ${subscriptionId} canceled in Stripe due to payment failure.`
    );

    await downgradeToFreePlan(canceledSubscription);
  } catch (error) {
    logger.error(`Error handling subscription failed: ${error.message}`, error);
    throw error;
  }
}

async function downgradeToFreePlan(subscription) {
  try {
    logger.info(`Handling subscription deleted: ${subscription.id}`);

    const userId = subscription.metadata.userId;

    if (!userId) {
      throw new Error(
        "User ID not found in invoice metadata. Cannot activate subscription."
      );
    }

    // check if we already deleted, so that we dont add extra free plan credits
    const existingSubscription =
      await subscriptionsRepository.getUserSubscription(userId);

    if (!existingSubscription) {
      throw new Error(
        `No existing subscription found for user: ${userId}. Cannot delete subscription.`
      );
    }

    if (
      existingSubscription.source === "system" ||
      existingSubscription.plan === "free"
    ) {
      logger.info(
        `Subscription for user ${userId} is already canceled. No action needed.`
      );
      return;
    }

    const periodStart = new Date();
    const periodEnd = new Date(
      periodStart.getTime() +
        parseInt(config.plans.durationDays, 10) * 24 * 60 * 60 * 1000
    );

    const response = await subscriptionsRepository.activateSubscription({
      userId,
      status: "active",
      source: "system",
      plan: "free",
      premiumCredits: config.plans.free.premiumCredits,
      credits: config.plans.free.credits,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    });

    if (!response) {
      throw new Error(
        `Failed to activate subscription for user: ${userId}. No response from repository.`
      );
    }
    logger.info(
      `Subscription deleted in database for user: ${subscription.metadata.userId}`
    );
  } catch (error) {
    logger.error(
      error,
      `Error handling subscription deleted: ${error.message}`
    );
    throw error;
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    logger.info(`Handling subscription created: ${subscription.id}`);
    await subscriptionsRepository.createSubscription({
      userId: subscription.metadata.userId,
      status: "created",
      source: "stripe",
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
    });
    logger.info(
      `Subscription created in database for user: ${subscription.metadata.userId}`
    );
  } catch (error) {
    logger.error(
      `Error handling subscription created: ${error.message}`,
      error
    );
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription) {
  switch (subscription.status) {
    case "active":
      break;
    case "past_due":
      break;
    case "canceled":
      break;
    case "unpaid":
      break;
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  try {
    const subscriptionId = invoice.parent.subscription_details.subscription;
    if (!subscriptionId) {
      throw new Error(
        "No subscription ID found in invoice. Cannot activate subscription."
      );
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!subscription) {
      throw new Error(
        `No subscription found for ID: ${subscriptionId}. Cannot activate subscription.`
      );
    }

    const userId = subscription.metadata.userId;

    if (!userId) {
      throw new Error(
        "User ID not found in invoice metadata. Cannot activate subscription."
      );
    }

    const response = await subscriptionsRepository.activateSubscription({
      userId,
      status: "active",
      source: "stripe",
      plan: "premium",
      premiumCredits: config.plans.premium.premiumCredits,
      credits: config.plans.premium.credits,
      currentPeriodStart: new Date(invoice.lines.data[0].period.start * 1000),
      currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000),
    });
    if (!response) {
      throw new Error(
        `Failed to activate subscription for user: ${userId}. No response from repository.`
      );
    }

    logger.info(`Subscription details: ${JSON.stringify(response)}`);
  } catch (error) {
    logger.error(
      error,
      `Error handling invoice payment succeeded: ${error.message}`
    );
    throw error;
  }
}

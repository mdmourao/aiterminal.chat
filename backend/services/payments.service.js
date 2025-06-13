import logger from "../utils/logger.js";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

if (!STRIPE_SECRET_KEY) {
  logger.error("STRIPE_SECRET_KEY is not defined in environment variables.");
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

class PaymentsService {
  async createCheckoutSession(req) {
    try {
      if (!FRONTEND_BASE_URL) {
        throw new Error(
          "FRONTEND_BASE_URL is not defined in environment variables."
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
        success_url: `${FRONTEND_BASE_URL}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_BASE_URL}?canceled=true`,
        customer_email: req.user?.email || undefined,
        client_reference_id: req.user?.id || undefined,
        automatic_tax: { enabled: true },
      });
      logger.info(`Stripe Checkout Session created: ${session.id}`);
      return session;
    } catch (error) {
      logger.error(`Error creating checkout session: ${error.message}`, error);
      throw error;
    }
  }

  async createPortalSession(session_id) {
    try {
      if (!FRONTEND_BASE_URL) {
        throw new Error(
          "FRONTEND_BASE_URL is not defined in environment variables."
        );
      }
      if (!session_id) {
        throw new Error("Missing 'session_id' for createPortalSession.");
      }

      const checkoutSession = await stripe.checkout.sessions.retrieve(
        session_id
      );

      if (!checkoutSession.customer) {
        throw new Error(
          `No customer found for checkout session ID: ${session_id}`
        );
      }

      const returnUrl = FRONTEND_BASE_URL;

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: checkoutSession.customer,
        return_url: returnUrl,
      });
      logger.info(
        `Stripe Billing Portal Session created for customer: ${checkoutSession.customer}`
      );
      return portalSession;
    } catch (error) {
      logger.error(`Error creating portal session: ${error.message}`, error);
      throw error;
    }
  }

  async webhook(event) {
    try {
      logger.info(`Received Stripe webhook event: ${event.type}`);

      switch (event.type) {
        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event.data.object);
          break;

        case "customer.subscription.created":
          await handleSubscriptionCreated(event.data.object);
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event.data.object);
          break;

        case "customer.subscription.trial_will_end":
          await handleTrialWillEnd(event.data.object);
          break;

        case "invoice.payment_succeeded":
          await handleInvoicePaymentSucceeded(event.data.object);
          break;

        case "invoice.payment_failed":
          await handleInvoicePaymentFailed(event.data.object);
          break;

        case "entitlements.active_entitlement_summary.updated":
          await handleEntitlementUpdated(event.data.object);
          break;

        case "customer.created":
          await handleCustomerCreated(event.data.object);
          break;

        case "customer.updated":
          await handleCustomerUpdated(event.data.object);
          break;

        case "customer.source.expiring_soon":
        case "payment_method.card_automatically_updated":
          await handlePaymentMethodExpiring(event.data.object);
          break;

        // case "charge.succeeded":
        // case "charge.failed":

        default:
          logger.warn(`Unhandled Stripe webhook event type: ${event.type}`);
      }
      logger.info(`Successfully processed webhook event: ${event.type}`);
    } catch (error) {
      logger.error(
        `Error processing webhook event ${event.type}: ${error.message}`,
        error
      );
      // Stripe expects a 200 OK after receiving the event
    }
  }
}

export default new PaymentsService();

// --- Helper Functions for Webhook Events ---

/**
 * Handles the logic when a customer's subscription is deleted.
 * E.g., revoke access, update user roles, send cancellation confirmation.
 * @param {object} subscription - The Stripe subscription object.
 */
async function handleSubscriptionDeleted(subscription) {
  logger.info(`Handling subscription deleted: ${subscription.id}`);
  // Example: Mark user as inactive or downgrade their plan in your DB
  // const userId = subscription.metadata.userId; // If you attach user ID as metadata
  // await userService.updateUserStatus(userId, 'inactive');
  // Send email confirmation
}

/**
 * Handles the logic when a new customer subscription is created.
 * E.g., grant initial access, set user's subscription ID in your DB.
 * @param {object} subscription - The Stripe subscription object.
 */
async function handleSubscriptionCreated(subscription) {
  logger.info(`Handling subscription created: ${subscription.id}`);
  // Example: Grant access to paid features
  // const userId = subscription.metadata.userId;
  // await userService.grantAccess(userId, subscription.plan.id);
  // Send welcome email
}

/**
 * Handles the logic when an existing customer subscription is updated.
 * This is a versatile event covering upgrades, downgrades, status changes (e.g., to past_due, canceled).
 * Your logic here should often check `subscription.status` and `subscription.current_period_end`.
 * @param {object} subscription - The Stripe subscription object.
 */
async function handleSubscriptionUpdated(subscription) {
  logger.info(
    `Handling subscription updated: ${subscription.id}, status: ${subscription.status}`
  );
  // Example:
  switch (subscription.status) {
    case "active":
      // User is active, ensure full access. This could be after a trial, or after fixing a payment.
      // await userService.ensureActiveAccess(subscription.customer);
      break;
    case "past_due":
      // Payment failed, subscription is in a grace period. Notify user.
      // await userService.notifyPastDue(subscription.customer);
      break;
    case "canceled":
      // Subscription was explicitly canceled. Revoke access immediately or at end of period.
      // await userService.revokeAccessAtPeriodEnd(subscription.customer);
      break;
    case "unpaid":
      // After dunning, subscription is unpaid. Fully revoke access.
      // await userService.fullyRevokeAccess(subscription.customer);
      break;
    // Add other statuses as needed
  }
}

/**
 * Handles the logic when a customer's trial period is about to end.
 * E.g., send reminder emails to add payment info.
 * @param {object} subscription - The Stripe subscription object.
 */
async function handleTrialWillEnd(subscription) {
  logger.info(`Handling trial will end for subscription: ${subscription.id}`);
  // Example: Send a reminder email to the customer
  // await emailService.sendTrialEndingReminder(subscription.customer);
}

/**
 * Handles the logic when an invoice payment succeeds.
 * This confirms money has been received for a subscription or one-time charge.
 * @param {object} invoice - The Stripe Invoice object.
 */
async function handleInvoicePaymentSucceeded(invoice) {
  logger.info(
    `Handling invoice payment succeeded for customer: ${invoice.customer}, amount: ${invoice.amount_due}`
  );
  // Example: Confirm active service, update billing cycle records, generate invoice PDFs.
  // const userId = invoice.customer; // Or retrieve from metadata
  // await userService.updateBillingCycle(userId, invoice.period_end);
}

/**
 * Handles the logic when an invoice payment fails.
 * E.g., initiate dunning process, notify user, update user status to "past_due".
 * @param {object} invoice - The Stripe Invoice object.
 */
async function handleInvoicePaymentFailed(invoice) {
  logger.warn(
    `Handling invoice payment failed for customer: ${
      invoice.customer
    }, amount: ${invoice.amount_due}, reason: ${
      invoice.charge?.failure_code || "N/A"
    }`
  );
  // Example: Notify user, trigger dunning.
  // await emailService.sendPaymentFailedNotification(invoice.customer);
  // await dunningService.startDunningProcess(invoice.customer);
}

/**
 * Handles the logic when the active entitlement summary for a customer is updated.
 * This is crucial for syncing user access to features in your application based on their subscriptions.
 * @param {object} entitlementSummary - The Stripe EntitlementSummary object.
 */
async function handleEntitlementUpdated(entitlementSummary) {
  logger.info(
    `Handling active entitlement summary updated for customer: ${entitlementSummary.customer}`
  );
  // Example: Update user permissions/feature flags in your application
  // Retrieve the customer from your DB
  // const user = await userService.getUserByStripeCustomerId(entitlementSummary.customer);
  // Loop through entitlementSummary.active_entitlements to update user features
  // for (const entitlement of entitlementSummary.active_entitlements) {
  //   await userService.updateUserFeature(user.id, entitlement.feature, entitlement.value || true);
  // }
}

/**
 * Handles the logic when a new customer is created in Stripe.
 * E.g., sync basic customer information to your own user database.
 * @param {object} customer - The Stripe Customer object.
 */
async function handleCustomerCreated(customer) {
  logger.info(
    `Handling customer created: ${customer.id}, email: ${customer.email}`
  );
  // Example: Create a new user record in your DB or link to an existing one.
  // await userService.createOrUpdateUser(customer.id, customer.email, customer.name);
}

/**
 * Handles the logic when an existing customer's information is updated in Stripe.
 * E.g., sync changes to email address or metadata.
 * @param {object} customer - The Stripe Customer object.
 */
async function handleCustomerUpdated(customer) {
  logger.info(
    `Handling customer updated: ${customer.id}, email: ${customer.email}`
  );
  // Example: Update user details in your DB.
  // await userService.updateCustomerDetails(customer.id, { email: customer.email, name: customer.name });
}

/**
 * Handles the logic when a customer's payment method is expiring soon.
 * E.g., send a notification to the customer to update their card.
 * @param {object} paymentMethod - The Stripe PaymentMethod object.
 */
async function handlePaymentMethodExpiring(paymentMethod) {
  logger.info(
    `Handling payment method expiring soon for customer: ${paymentMethod.customer}, card: **** **** **** ${paymentMethod.card.last4}`
  );
  // Example: Send an email reminder.
  // await emailService.sendCardExpiringReminder(paymentMethod.customer);
}

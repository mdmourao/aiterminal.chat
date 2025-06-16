import { subscriptionsQueries } from "../database/queries/subscriptions.queries.js";
import { pool } from "../database/connection.js";

class SubscriptionsRepository {
  async create({
    userId,
    status,
    plan,
    source,
    premiumCredits,
    credits,
    currentPeriodStart,
    currentPeriodEnd,
  }) {
    const result = await pool.query(subscriptionsQueries.create, [
      userId,
      status,
      plan,
      source,
      premiumCredits,
      credits,
      currentPeriodStart,
      currentPeriodEnd,
    ]);
    return result.rows[0];
  }

  async createSubscription({
    userId,
    status,
    source,
    stripeCustomerId,
    stripeSubscriptionId,
    stripePriceId,
  }) {
    const result = await pool.query(
      subscriptionsQueries.createSubscriptionStripe,
      [
        userId,
        status,
        source,
        stripeCustomerId,
        stripeSubscriptionId,
        stripePriceId,
      ]
    );
    return result.rows;
  }

  async activateSubscription({
    userId,
    status,
    source,
    plan,
    premiumCredits,
    credits,
    currentPeriodStart,
    currentPeriodEnd,
  }) {
    const result = await pool.query(
      subscriptionsQueries.activatePremiumSubscription,
      [
        userId,
        status,
        source,
        plan,
        premiumCredits,
        credits,
        currentPeriodStart,
        currentPeriodEnd,
      ]
    );
    return result.rows[0];
  }

  async getUserSubscription(userId) {
    const result = await pool.query(subscriptionsQueries.getUserSubscription, [
      userId,
    ]);
    return result.rows[0];
  }
}

export default new SubscriptionsRepository();

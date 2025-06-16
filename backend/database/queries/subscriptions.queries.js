export const subscriptionsQueries = {
  create: `
    INSERT INTO subscriptions (user_id, status, plan, source, premium_credits, credits, current_period_start, current_period_end)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `,

  createSubscriptionStripe: `
    UPDATE subscriptions
    SET status = $2,
      source = $3,
      stripe_customer_id = $4,
      stripe_subscription_id = $5,
      stripe_price_id = $6
    WHERE user_id = $1;
  `,

  getUserSubscription: `
    SELECT * FROM subscriptions
    WHERE user_id = $1;
  `,

  activatePremiumSubscription: `
    UPDATE subscriptions
    SET status = $2,
      source = $3,
      plan = $4,
      premium_credits = $5,
      credits = $6,
      current_period_start = $7,
      current_period_end = $8
    WHERE user_id = $1
    RETURNING *;
  `,
};

export class UserResponseDTO {
  constructor(user, subscription) {
    this.email = user.email;
    this.name = user.name;
    this.image = user.image;
    this.subscription = subscription;
  }
}

export class SubscriptionResponseDTO {
  constructor(subscription) {
    this.status = subscription.status;
    this.plan = subscription.plan;
    this.premiumCredits = subscription.premium_credits;
    this.credits = subscription.credits;
    this.currentPeriodStart = subscription.current_period_start;
    this.currentPeriodEnd = subscription.current_period_end;
    this.premiumCreditsQuota = subscription.premium_credits_quota;
    this.creditsQuota = subscription.credits_quota;
  }
}

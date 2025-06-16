export interface User {
  email: string;
  name: string;
  image: string;
  subscription: Subscription;
}

export interface Subscription {
  status: string;
  plan: string;
  premiumCredits: number;
  credits: number;
  currentPeriodEnd: string;
  currentPeriodStart: string;
}

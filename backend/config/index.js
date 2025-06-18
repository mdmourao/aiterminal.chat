function getRequiredNumberEnv(key) {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new Error(
      `Environment variable "${key}" must be a valid integer. Received: "${value}"`
    );
  }
  return parsedValue;
}

function getRequiredStringEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const config = {
  stripe: {
    secretKey: getRequiredStringEnv("STRIPE_SECRET_KEY"),
  },
  app: {
    frontendBaseUrl: getRequiredStringEnv("FRONTEND_BASE_URL"),
    apiBaseUrl: getRequiredStringEnv("BASE_URL"),
  },
  plans: {
    durationDays: getRequiredNumberEnv("SUBSCRIPTION_DURATION_DAYS"),
    free: {
      premiumCredits: getRequiredNumberEnv("FREE_PLAN_PREMIUM_CREDITS"),
      credits: getRequiredNumberEnv("FREE_PLAN_CREDITS"),
    },
    premium: {
      premiumCredits: getRequiredNumberEnv("PREMIUM_PLAN_PREMIUM_CREDITS"),
      credits: getRequiredNumberEnv("PREMIUM_PLAN_CREDITS"),
    },
  },
};

export default config;

export const modelsQueries = {
  get: `
    SELECT value, provider, label, premium
    FROM models
    ORDER BY created_at DESC
  `,
};

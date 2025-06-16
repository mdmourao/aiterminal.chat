export const modelsQueries = {
  get: `
    SELECT value, provider, label, premium
    FROM models
    ORDER BY created_at DESC
  `,

  getByValue: `
    SELECT value, provider, label, premium
    FROM models
    WHERE value = $1
  `,
};

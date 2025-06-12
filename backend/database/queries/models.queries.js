export const modelsQueries = {
  get: `
    SELECT value, provider, label, premium
    FROM models
    LIMIT $1
    OFFSET $2
  `,
};

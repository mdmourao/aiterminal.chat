export const userQueries = {
  create: `
    INSERT INTO users (name, email, password_hash) 
    VALUES ($1, $2, $3) 
    RETURNING id, name, email, created_at, updated_at
  `,

  getByEmail: `
    SELECT *
    FROM users
    WHERE email = $1
  `,

  getAll: `
    SELECT *
    FROM users
  `,
};

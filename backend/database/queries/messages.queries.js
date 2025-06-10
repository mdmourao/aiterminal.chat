export const messagesQueries = {
  create: `
    INSERT INTO messages (chat_id, role, model, content, streamed_complete) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING id, chat_id, role, model, content, streamed_complete, created_at, updated_at
  `,

  update: `
    UPDATE messages
    SET content = $2, streamed_complete = $3
    WHERE id = $1;
  `,
};

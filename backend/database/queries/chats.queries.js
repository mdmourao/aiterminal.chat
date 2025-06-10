export const chatQueries = {
  create: `
    INSERT INTO chats DEFAULT VALUES
    RETURNING id, title, created_at, updated_at
  `,

  getById: `
    SELECT
        c.id,
        c.title,
        c.created_at,
        c.updated_at,
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', m.id,
                    'chatId', m.chat_id,
                    'sender', m.sender,
                    'content', m.content,
                    'createdAt', m.created_at,
                    'updatedAt', m.updated_at
                ) ORDER BY m.created_at ASC
            ) FILTER (WHERE m.id IS NOT NULL),
            '[]'
        ) AS messages
    FROM
        chats c
    LEFT JOIN
        messages m ON c.id = m.chat_id
    WHERE
        c.id = $1
    GROUP BY
        c.id, c.title, c.created_at, c.updated_at
  `,
};

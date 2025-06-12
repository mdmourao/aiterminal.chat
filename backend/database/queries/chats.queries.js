export const chatQueries = {
  create: `
    INSERT INTO chats (user_id)
    VALUES ($1)
    RETURNING id, title, created_at, updated_at;
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
                    'role', m.role,
                    'model', m.model,
                    'streamedComplete', m.streamed_complete,
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
        c.id = $1 AND c.user_id = $2
    GROUP BY
        c.id, c.title, c.created_at, c.updated_at
  `,

  get: `
    SELECT
        c.id,
        c.title,
        c.created_at,
        c.updated_at,
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', m.id,
                    'role', m.role,
                    'model', m.model,
                    'content', m.content
                ) ORDER BY m.created_at ASC
            ) FILTER (WHERE m.id IS NOT NULL),
            '[]'
        ) AS messages
    FROM
        chats c
    LEFT JOIN
        messages m ON c.id = m.chat_id
    WHERE
        c.user_id = $1
    GROUP BY
        c.id, c.title, c.created_at, c.updated_at
    ORDER BY
        c.updated_at DESC
    LIMIT $2 OFFSET $3;
  `,
  getCount: `
    SELECT COUNT(*) AS count
    FROM chats
    WHERE user_id = $1;
  `,
};

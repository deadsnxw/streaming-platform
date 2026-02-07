import { pool } from "./db.js";

export const findChatBetweenUsers = async (user1Id, user2Id) => {
    const user1 = Math.min(user1Id, user2Id);
    const user2 = Math.max(user1Id, user2Id);

    const { rows } = await pool.query(
        `
        SELECT *
        FROM chats
        WHERE user1_id = $1 AND user2_id = $2
        `,
        [user1, user2]
    );

    return rows[0] || null;
};

export const createChat = async (user1Id, user2Id) => {
    const user1 = Math.min(user1Id, user2Id);
    const user2 = Math.max(user1Id, user2Id);

    const { rows } = await pool.query(
        `
        INSERT INTO chats (user1_id, user2_id)
        VALUES ($1, $2)
        RETURNING *
        `,
        [user1, user2]
    );

    return rows[0];
};

export const findUserChatsWithLastMessage = async userId => {
    const { rows } = await pool.query(
        `
        SELECT
            c.chat_id,
            u.user_id,
            u.nickname,
            u.avatar_url,
            m.text AS last_message,
            m.created_at AS last_message_at
        FROM chats c
        JOIN users u
          ON u.user_id = CASE
              WHEN c.user1_id = $1 THEN c.user2_id
              ELSE c.user1_id
          END
        JOIN LATERAL (
            SELECT text, created_at
            FROM messages
            WHERE chat_id = c.chat_id
            ORDER BY created_at DESC
            LIMIT 1
        ) m ON true
        WHERE c.user1_id = $1 OR c.user2_id = $1
        ORDER BY m.created_at DESC
        `,
        [userId]
    );

    return rows;
};
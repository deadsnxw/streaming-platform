import { pool } from './db.js';

export const findUserByEmailOrNickname = async (login) => {
    const { rows } = await pool.query(
        `SELECT * FROM users 
         WHERE email = $1 OR nickname = $1
         LIMIT 1`,
        [login]
    );
    return rows[0];
};

export const findUserByEmail = async (email) => {
    const { rows } = await pool.query(
        `SELECT * FROM users 
         WHERE email = $1
         LIMIT 1`,
        [email]
    );
    return rows[0];
};

export const findUserByNickname = async (nickname) => {
    const { rows } = await pool.query(
        `SELECT * FROM users 
         WHERE nickname = $1
         LIMIT 1`,
        [nickname]
    );
    return rows[0];
};

export const getAllUsers = async () => {
    const { rows } = await pool.query(
        `SELECT 
            u.user_id, 
            u.email, 
            u.nickname, 
            u.avatar_url, 
            u.is_streamer,
            COALESCE(COUNT(s.subscription_id), 0) as subscriber_count
         FROM users u
         LEFT JOIN subscriptions s ON u.user_id = s.channel_id
         WHERE u.is_active = true
         GROUP BY u.user_id`
    );
    return rows;
};

export const getUserById = async (id) => {
    const { rows } = await pool.query(
        `SELECT 
            u.user_id, 
            u.email, 
            u.nickname, 
            u.avatar_url, 
            u.bio, 
            u.birth_date,
            COALESCE(COUNT(s.subscription_id), 0) as subscriber_count
         FROM users u
         LEFT JOIN subscriptions s ON u.user_id = s.channel_id
         WHERE u.user_id = $1 AND u.is_active = true
         GROUP BY u.user_id`,
        [id]
    );
    return rows[0];
};

export const updateUser = async (id, data) => {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const key in data) {
        fields.push(`${key} = $${idx++}`);
        values.push(data[key]);
    }

    const query = `
        UPDATE users
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE user_id = $${idx}
        RETURNING user_id, email, nickname, avatar_url, bio
    `;

    values.push(id);

    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const createUser = async ({
                                     email,
                                     nickname,
                                     passwordHash,
                                     birthDate
                                 }) => {
    const { rows } = await pool.query(
        `INSERT INTO users (
            email,
            nickname,
            password_hash,
            birth_date,
            is_active,
            created_at,
            updated_at
        ) VALUES ($1, $2, $3, $4, true, NOW(), NOW())
        RETURNING user_id, email, nickname, birth_date`,
        [email, nickname, passwordHash, birthDate]
    );

    return rows[0];
};
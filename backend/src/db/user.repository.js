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

export const getAllUsers = async () => {
    const { rows } = await pool.query(
        `SELECT user_id, email, nickname, avatar_url, is_streamer
         FROM users
         WHERE is_active = true`
    );
    return rows;
};

export const getUserById = async (id) => {
    const { rows } = await pool.query(
        `SELECT user_id, email, nickname, avatar_url, bio, birth_date
         FROM users
         WHERE user_id = $1 AND is_active = true`,
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

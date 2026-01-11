import { pool } from './db.js';

export const createVideo = async ({
    userId,
    title,
    description,
    videoUrl,
    thumbnailUrl,
    duration,
    fileSize,
    mimeType,
    isPublic = true
}) => {
    const { rows } = await pool.query(
        `INSERT INTO videos (
            user_id,
            title,
            description,
            video_url,
            thumbnail_url,
            duration,
            file_size,
            mime_type,
            is_public,
            status,
            created_at,
            updated_at
        ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,'ready',NOW(),NOW()
        )
        RETURNING
            video_id,
            user_id,
            title,
            description,
            video_url,
            thumbnail_url,
            duration,
            views_count,
            is_public,
            created_at`,
        [
            userId,
            title,
            description,
            videoUrl,
            thumbnailUrl,
            duration,
            fileSize,
            mimeType,
            isPublic
        ]
    );

    return rows[0];
};

export const getVideoById = async (videoId) => {
    const { rows } = await pool.query(
        `SELECT 
            v.video_id,
            v.user_id,
            v.title,
            v.description,
            v.video_url,
            v.thumbnail_url,
            v.duration,
            v.mime_type,
            v.views_count,
            v.is_public,
            v.created_at,
            u.nickname,
            u.avatar_url
         FROM videos v
         JOIN users u ON v.user_id = u.user_id
         WHERE v.video_id = $1
           AND v.is_active = true`,
        [videoId]
    );

    return rows[0];
};

export const getUserVideos = async (userId, includePrivate = false) => {
    let query = `
        SELECT 
            video_id, title, description, video_url, 
            thumbnail_url, duration, views_count, 
            is_public, created_at
        FROM videos
        WHERE user_id = $1 AND is_active = true
    `;

    if (!includePrivate) {
        query += ' AND is_public = true';
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, [userId]);
    return rows;
};

export const getAllPublicVideos = async (limit = 20, offset = 0) => {
    const { rows } = await pool.query(
        `SELECT 
            v.video_id, v.title, v.description, 
            v.thumbnail_url, v.duration, v.views_count, v.created_at,
            u.nickname, u.avatar_url
         FROM videos v
         JOIN users u ON v.user_id = u.user_id
         WHERE v.is_public = true AND v.is_active = true
         ORDER BY v.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    return rows;
};

export const incrementViewCount = async (videoId) => {
    const { rows } = await pool.query(
        `UPDATE videos 
         SET views_count = views_count + 1 
         WHERE video_id = $1 
         RETURNING views_count`,
        [videoId]
    );

    return rows[0];
};

export const updateVideo = async (videoId, userId, data) => {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowedFields = ['title', 'description', 'thumbnail_url', 'is_public'];

    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            fields.push(`${key} = $${idx++}`);
            values.push(data[key]);
        }
    }

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    values.push(videoId, userId);

    const query = `
        UPDATE videos
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE video_id = $${idx} AND user_id = $${idx + 1}
        RETURNING video_id, title, description, thumbnail_url, is_public
    `;

    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const deleteVideo = async (videoId, userId) => {
    const { rows } = await pool.query(
        `UPDATE videos 
         SET is_active = false 
         WHERE video_id = $1 AND user_id = $2
         RETURNING video_id`,
        [videoId, userId]
    );

    return rows[0];
};

export const recordVideoView = async (videoId, userId = null, ipAddress = null, watchDuration = 0) => {
    const { rows } = await pool.query(
        `INSERT INTO video_views (video_id, user_id, ip_address, watch_duration, viewed_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING view_id`,
        [videoId, userId, ipAddress, watchDuration]
    );

    return rows[0];
};
import fs from 'fs';
import path from 'path';
import {
    createVideo,
    getVideoById,
    getUserVideos,
    getAllPublicVideos,
    incrementViewCount,
    updateVideo,
    deleteVideo,
    recordVideoView
} from '../db/video.repository.js';

export const watchVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await getVideoById(id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (!video.is_public && (!req.user || req.user.id !== video.user_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const filePath = path.join('uploads', 'videos', path.basename(video.video_url));
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;

        const range = req.headers.range;
        if (!range) {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': video.mime_type || 'video/mp4'
            });
            fs.createReadStream(filePath).pipe(res);
        } else {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (start >= fileSize || end >= fileSize) {
                res.status(416).send('Requested range not satisfiable');
                return;
            }

            const chunkSize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': video.mime_type || 'video/mp4'
            });

            file.pipe(res);
        }

    } catch (error) {
        console.error('Watch video error:', error);
        res.status(500).json({ message: 'Failed to stream video', error: error.message });
    }
};

export const uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        const { title, description, isPublic } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const videoUrl = `/uploads/videos/${req.file.filename}`;

        const video = await createVideo({
            userId: req.user.id,
            title,
            description: description || '',
            videoUrl,
            thumbnailUrl: null,
            duration: null,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        });

        res.status(201).json({
            message: 'Video uploaded successfully',
            video
        });
    } catch (error) {
        console.error('Upload video error:', error);
        res.status(500).json({ message: 'Failed to upload video', error: error.message });
    }
};

export const getVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await getVideoById(id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        if (!video.is_public && (!req.user || req.user.id !== video.user_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await incrementViewCount(id);

        const ipAddress = req.ip || req.connection.remoteAddress;
        await recordVideoView(id, req.user?.id, ipAddress);

        res.json(video);
    } catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({ message: 'Failed to get video', error: error.message });
    }
};

export const getPublicVideos = async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;

        const videos = await getAllPublicVideos(parseInt(limit), parseInt(offset));

        res.json({
            videos,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Get public videos error:', error);
        res.status(500).json({ message: 'Failed to get videos', error: error.message });
    }
};

export const getMyVideos = async (req, res) => {
    try {
        const videos = await getUserVideos(req.user.id, true); // Включаючи приватні

        res.json({ videos });
    } catch (error) {
        console.error('Get my videos error:', error);
        res.status(500).json({ message: 'Failed to get videos', error: error.message });
    }
};

export const getUserVideosList = async (req, res) => {
    try {
        const { userId } = req.params;

        const includePrivate = req.user && req.user.id === parseInt(userId);
        const videos = await getUserVideos(userId, includePrivate);

        res.json({ videos });
    } catch (error) {
        console.error('Get user videos error:', error);
        res.status(500).json({ message: 'Failed to get videos', error: error.message });
    }
};

export const updateVideoDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, isPublic } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (isPublic !== undefined) updateData.is_public = isPublic === 'true' || isPublic === true;

        const video = await updateVideo(id, req.user.id, updateData);

        if (!video) {
            return res.status(404).json({ message: 'Video not found or access denied' });
        }

        res.json({
            message: 'Video updated successfully',
            video
        });
    } catch (error) {
        console.error('Update video error:', error);
        res.status(500).json({ message: 'Failed to update video', error: error.message });
    }
};

export const deleteVideoById = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await deleteVideo(id, req.user.id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found or access denied' });
        }

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({ message: 'Failed to delete video', error: error.message });
    }
};
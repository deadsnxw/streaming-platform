import { Router } from 'express';
import {
    uploadVideo,
    getVideo,
    getPublicVideos,
    getMyVideos,
    getUserVideosList,
    updateVideoDetails,
    deleteVideoById,
    watchVideo
} from '../controllers/VideoController.js';

import { uploadVideo as uploadMiddleware } from '../config/upload.config.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post(
    '/upload',
    authenticateToken,
    uploadMiddleware.single('video'),
    uploadVideo
);

router.get('/public', getPublicVideos);

router.get('/me', authenticateToken, getMyVideos);

router.get('/user/:userId', getUserVideosList);

router.get('/:id', getVideo);

router.get('/:id/watch', authenticateToken, watchVideo)

router.put('/:id', authenticateToken, updateVideoDetails);

router.delete('/:id', authenticateToken, deleteVideoById);

export default router;
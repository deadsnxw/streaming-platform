import express from 'express';
import {
    getMe,
    getUser,
    getUsers,
    updateMe,
    uploadMyAvatar,
    getRecommendedUsers
} from '../controllers/UserController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { uploadAvatar } from '../config/avatarUpload.config.js';

const router = express.Router();

router.get('/me', authenticateToken, getMe);
router.get('/recommended', authenticateToken, getRecommendedUsers);
router.get('/', getUsers);
router.post('/me/avatar', authenticateToken, uploadAvatar.single('avatar'), uploadMyAvatar);
router.get('/:id', getUser);
router.patch('/me', authenticateToken, updateMe);

export default router;

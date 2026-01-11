import express from 'express';
import {
    getMe,
    getUser,
    getUsers,
    updateMe
} from '../controllers/UserController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', authenticateToken, getMe);
router.get('/', getUsers);
router.get('/:id', getUser);
router.patch('/me', authenticateToken, updateMe);

export default router;

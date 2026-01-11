import express from 'express';
import { register, login } from '../controllers/AuthController.js';
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

export default router;
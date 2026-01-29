import express from 'express';
import { register, login } from '../controllers/AuthController.js';
import { authenticateToken } from "../middleware/auth.middleware.js";
import {requestPasswordResetController, verifyCodeController, resetPasswordController, resendCodeController} from "../controllers/PasswordResetController.js"

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

router.post('/password-reset/request', requestPasswordResetController);
router.post('/password-reset/verify', verifyCodeController);
router.post('/password-reset/reset', resetPasswordController);
router.post('/password-reset/resend', resendCodeController);

export default router;
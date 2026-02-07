import express from "express";
import {
    startChat,
    getMyChats,
    getChatMessagesById
} from "../controllers/ChatController.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/start", authenticateToken, startChat);
router.get("/my", authenticateToken, getMyChats);
router.get("/:chatId/messages", authenticateToken, getChatMessagesById);

export default router;
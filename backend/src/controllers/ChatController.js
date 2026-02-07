import { pool } from "../db/db.js";
import {
    findChatBetweenUsers,
    createChat,
    findUserChatsWithLastMessage
} from "../db/chat.repository.js";
import { getChatMessages } from "../db/message.repository.js";

export const startChat = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;
        const { targetUserId } = req.body;

        console.log("startChat called:", { currentUserId, targetUserId, body: req.body });

        if (!targetUserId) {
            return res.status(400).json({ message: "targetUserId is required" });
        }

        const validTargetUserId = Number(targetUserId);
        
        if (isNaN(validTargetUserId) || validTargetUserId <= 0) {
            return res.status(400).json({ message: "Invalid targetUserId" });
        }

        if (validTargetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot chat with yourself" });
        }

        let chat = await findChatBetweenUsers(currentUserId, validTargetUserId);

        if (!chat) {
            chat = await createChat(currentUserId, validTargetUserId);
        }

        res.json(chat);
    } catch (error) {
        console.error("Error in startChat:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getMyChats = async (req, res) => {
    const userId = req.user.user_id;

    const chats = await findUserChatsWithLastMessage(userId);

    res.json(chats);
};

export const getChatMessagesById = async (req, res) => {
    const userId = req.user.user_id;
    const { chatId } = req.params;

    const { rows } = await pool.query(
        `
        SELECT 1
        FROM chats
        WHERE chat_id = $1
          AND ($2 = user1_id OR $2 = user2_id)
        `,
        [chatId, userId]
    );

    if (rows.length === 0) {
        return res.status(403).json({ message: "Access denied" });
    }

    const messages = await getChatMessages(chatId);
    res.json(messages);
};
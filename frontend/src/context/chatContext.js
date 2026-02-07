import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { fetchAPI } from "../services/api";
import { authService } from "../services/authService";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) return;

    const s = io("http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [currentUser?.user_id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.chat_id === currentChatId) {
        setMessages((prev) => [...prev, msg]);
      }
      
      setChats((prev) =>
        prev.map((c) =>
          c.chat_id === msg.chat_id
            ? { ...c, last_message: msg.text, last_message_at: msg.created_at }
            : c
        )
      );
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, currentChatId]);

  const loadChats = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await fetchAPI("/chats/my");
      setChats(data);
    } catch (err) {
      console.error("Failed to load chats", err);
    }
  }, [currentUser?.user_id]);

  const openChat = useCallback(async (chatId) => {
    try {
      setCurrentChatId(chatId);
      const data = await fetchAPI(`/chats/${chatId}/messages`);
      setMessages(data);

      if (socket) {
        socket.emit("join_chat", chatId);
      }
    } catch (err) {
      console.error("Failed to open chat", err);
    }
  }, [socket]);

  // ДОДАНО: функція закриття чату
  const closeChat = useCallback(() => {
    setCurrentChatId(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback((chatId, text) => {
    if (!socket || !currentUser) return;
    socket.emit("send_message", {
      chatId,
      senderId: currentUser.user_id,
      text,
    });
  }, [socket, currentUser?.user_id]);

  const startNewChat = useCallback(async (targetUserId) => {
    if (!currentUser) return;
    
    const validTargetUserId = Number(targetUserId);
    
    if (!validTargetUserId || isNaN(validTargetUserId)) {
        console.error("Invalid targetUserId:", targetUserId);
        throw new Error("Invalid user ID");
    }

    console.log("Starting chat with user:", validTargetUserId);
    
    try {
      const chat = await fetchAPI("/chats/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: validTargetUserId }),
      });
      
      console.log("Chat created:", chat);
      
      await loadChats();
      await openChat(chat.chat_id);
      
      return chat;
    } catch (err) {
      console.error("Failed to start chat", err);
      throw err;
    }
  }, [currentUser?.user_id, loadChats, openChat]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        loadChats,
        currentChatId,
        openChat,
        closeChat, // ДОДАНО
        messages,
        sendMessage,
        startNewChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../context/chatContext";
import { authService } from "../../services/authService";
import { getUploadsBaseUrl } from "../../services/api";

const PANEL_WIDTH = 400;
const PANEL_MAX_WIDTH = "95vw";

const FloatingChatButton = () => {
    const { chats, loadChats, openChat, closeChat, currentChatId, messages, sendMessage } = useChat();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null);
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    useEffect(() => {
        const openPanel = () => setOpen(true);
        window.addEventListener("openChatPanel", openPanel);
        return () => window.removeEventListener("openChatPanel", openPanel);
    }, []);

    // Якщо чат відкрили ззовні (наприклад з профілю) — показати оверлей
    useEffect(() => {
        if (currentChatId && !open) setOpen(true);
    }, [currentChatId, open]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const currentChat = currentChatId ? chats.find((c) => c.chat_id === currentChatId) : null;
    const showConversation = open && currentChatId && currentChat;

    const handleBack = () => {
        closeChat();
        setText("");
    };

    const handleSend = () => {
        if (!text.trim() || !currentChatId) return;
        sendMessage(currentChatId, text);
        setText("");
    };

    const handleSelectChat = (chatId) => {
        openChat(chatId);
    };

    if (!open) return null;

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.35)",
                    zIndex: 1100,
                }}
                onClick={() => {
                    setOpen(false);
                    if (showConversation) handleBack();
                }}
            />

            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    height: "100vh",
                    width: PANEL_WIDTH,
                    maxWidth: PANEL_MAX_WIDTH,
                    background: "#fff",
                    boxShadow: "-4px 0 18px rgba(0,0,0,0.18)",
                    zIndex: 1101,
                    display: "flex",
                    flexDirection: "column",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {showConversation ? (
                    /* ─── Перегляд розмови (як на скріншоті) ─── */
                    <>
                        {/* Шапка: назад, аватар + нік, меню */}
                        <div
                            style={{
                                flexShrink: 0,
                                padding: "12px 16px",
                                borderBottom: "1px solid #eee",
                                background: "#FAFAFA",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleBack}
                                style={{
                                    background: "none",
                                    border: "none",
                                    padding: 8,
                                    cursor: "pointer",
                                    fontSize: 22,
                                    color: "#1f1f23",
                                    lineHeight: 1,
                                }}
                                aria-label="Назад"
                            >
                                ‹
                            </button>
                            <div
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    minWidth: 0,
                                }}
                            >
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        background: "#e5e5e5",
                                        flexShrink: 0,
                                    }}
                                >
                                    {currentChat.avatar_url ? (
                                        <img
                                            src={getUploadsBaseUrl() + currentChat.avatar_url}
                                            alt=""
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <span
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 18,
                                                fontWeight: "bold",
                                                color: "#6441A5",
                                            }}
                                        >
                                            {currentChat.nickname?.charAt(0).toUpperCase() || "?"}
                                        </span>
                                    )}
                                </div>
                                <span
                                    style={{
                                        marginTop: 4,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "#1f1f23",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: "100%",
                                    }}
                                >
                                    {currentChat.nickname}
                                </span>
                            </div>
                            <button
                                type="button"
                                style={{
                                    background: "none",
                                    border: "none",
                                    padding: 8,
                                    cursor: "pointer",
                                    fontSize: 18,
                                    color: "#53535f",
                                    lineHeight: 1,
                                }}
                                aria-label="Меню"
                            >
                                ⋮
                            </button>
                        </div>

                        {/* Повідомлення */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                padding: "12px 16px",
                                background: "#f5f5f5",
                            }}
                        >
                            {messages.length === 0 ? (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: "#999",
                                        marginTop: 40,
                                        fontSize: 14,
                                    }}
                                >
                                    Поки що немає повідомлень
                                </p>
                            ) : (
                                messages.map((m) => {
                                    const isOwn = m.sender_id === currentUser?.user_id;
                                    return (
                                        <div
                                            key={m.message_id}
                                            style={{
                                                display: "flex",
                                                justifyContent: isOwn ? "flex-end" : "flex-start",
                                                marginBottom: 10,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    maxWidth: "78%",
                                                    background: isOwn ? "#6441A5" : "#e8e8e8",
                                                    color: isOwn ? "#fff" : "#1f1f23",
                                                    padding: "10px 14px",
                                                    borderRadius: isOwn
                                                        ? "16px 16px 4px 16px"
                                                        : "16px 16px 16px 4px",
                                                    wordWrap: "break-word",
                                                    fontSize: 14,
                                                }}
                                            >
                                                <div>{m.text}</div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        opacity: 0.85,
                                                        marginTop: 4,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "flex-end",
                                                        gap: 4,
                                                    }}
                                                >
                                                    {new Date(m.created_at).toLocaleTimeString("uk-UA", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Поле вводу внизу */}
                        <div
                            style={{
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "12px 16px",
                                borderTop: "1px solid #eee",
                                background: "#fff",
                            }}
                        >
                            <button
                                type="button"
                                style={{
                                    background: "none",
                                    border: "none",
                                    padding: 8,
                                    cursor: "pointer",
                                    color: "#6b6b76",
                                    fontSize: 18,
                                }}
                                aria-label="Вкладення"
                            >
                                📎
                            </button>
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Написати"
                                style={{
                                    flex: 1,
                                    padding: "10px 16px",
                                    borderRadius: 24,
                                    border: "1px solid #e0e0e0",
                                    outline: "none",
                                    fontSize: 14,
                                    background: "#f5f5f5",
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!text.trim()}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    border: "none",
                                    background: text.trim() ? "#6441A5" : "#ccc",
                                    color: "#fff",
                                    cursor: text.trim() ? "pointer" : "default",
                                    fontSize: 16,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                aria-label="Надіслати"
                            >
                                ➤
                            </button>
                        </div>
                    </>
                ) : (
                    /* ─── Список чатів ─── */
                    <>
                        <div
                            style={{
                                padding: "14px 18px",
                                borderBottom: "1px solid #eee",
                                backgroundColor: "#6441A5",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontWeight: "bold",
                            }}
                        >
                            <span>Мої чати</span>
                            <button
                                onClick={() => setOpen(false)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#fff",
                                    fontSize: 20,
                                    cursor: "pointer",
                                    padding: 4,
                                    lineHeight: 1,
                                }}
                                title="Закрити"
                            >
                                ✕
                            </button>
                        </div>

                        <div
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                padding: "8px 0",
                            }}
                        >
                            {chats && chats.length > 0 ? (
                                chats.map((c) => (
                                    <div
                                        key={c.chat_id}
                                        role="button"
                                        tabIndex={0}
                                        style={{
                                            padding: "12px 16px",
                                            borderBottom: "1px solid #f1f1f1",
                                            cursor: "pointer",
                                            transition: "background 0.15s",
                                        }}
                                        onClick={() => handleSelectChat(c.chat_id)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                handleSelectChat(c.chat_id);
                                            }
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: "50%",
                                                    overflow: "hidden",
                                                    backgroundColor: "#e5e5e5",
                                                    flexShrink: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {c.avatar_url ? (
                                                    <img
                                                        src={getUploadsBaseUrl() + c.avatar_url}
                                                        alt=""
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        style={{
                                                            fontSize: 18,
                                                            fontWeight: "bold",
                                                            color: "#6441A5",
                                                        }}
                                                    >
                                                        {c.nickname?.charAt(0).toUpperCase() || "?"}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <strong style={{ display: "block", fontSize: 14 }}>
                                                    {c.nickname}
                                                </strong>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontSize: 12,
                                                        color: "#666",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {c.last_message || "Почніть розмову"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: 30, textAlign: "center", color: "#999" }}>
                                    У вас поки немає чатів
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default FloatingChatButton;

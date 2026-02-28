import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../context/chatContext";
import { authService } from "../../services/authService";
import { getUploadsBaseUrl } from "../../services/api";
import "../../styles/FloatingChatButton.css";

const NAVBAR_HEIGHT = 56;

const TAB_CHATS = "chats";
const TAB_REQUESTS = "requests";

const FloatingChatButton = () => {
    const { chats, requests, loadChats, loadRequests, openChat, closeChat, currentChatId, messages, sendMessage, acceptRequest, ignoreRequest, deleteChat } = useChat();
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(TAB_CHATS);
    const [chatSearchQuery, setChatSearchQuery] = useState("");
    const [text, setText] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const menuRef = useRef(null);

    const currentUser = authService.getCurrentUser();

    const filteredChats = chatSearchQuery.trim()
        ? chats.filter((c) => c.nickname && c.nickname.toLowerCase().includes(chatSearchQuery.trim().toLowerCase()))
        : chats;

    useEffect(() => {
        loadChats();
        loadRequests();
    }, [loadChats, loadRequests]);

    useEffect(() => {
        const togglePanel = () => setOpen((prev) => !prev);
        window.addEventListener("openChatPanel", togglePanel);
        return () => window.removeEventListener("openChatPanel", togglePanel);
    }, []);

    useEffect(() => {
        if (currentChatId && !open) setOpen(true);
    }, [currentChatId, open]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const currentChat = currentChatId
        ? chats.find((c) => c.chat_id === currentChatId) || requests.find((r) => r.chat_id === currentChatId)
        : null;
    const isRequestView = currentChatId && requests.some((r) => r.chat_id === currentChatId);
    const showConversation = open && currentChatId && currentChat;

    const handleBack = () => {
        setMenuOpen(false);
        closeChat();
        setText("");
    };

    const handleSend = () => {
        if (!text.trim() || !currentChatId) return;
        sendMessage(currentChatId, text);
        setText("");
    };

    const handleSelectChat = (chatId) => openChat(chatId);
    const handleSelectRequest = (chatId) => openChat(chatId);

    const handleAcceptRequest = async () => {
        if (!currentChatId) return;
        try {
            await acceptRequest(currentChatId);
            setActiveTab(TAB_CHATS);
            setText("");
        } catch (err) {
            console.error(err);
        }
    };

    const handleIgnoreRequest = async () => {
        if (!currentChatId) return;
        try {
            await ignoreRequest(currentChatId);
            closeChat();
            setText("");
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteChat = async () => {
        if (!currentChatId) return;
        try {
            await deleteChat(currentChatId);
            closeChat();
            setText("");
            setMenuOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!menuOpen) return;
        const closeMenu = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, [menuOpen]);

    return (
        <div
            className={`chat-panel-wrapper ${open ? "open" : "closed"}`}
            style={{ top: NAVBAR_HEIGHT, height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}
        >
            {showConversation ? (
                /* ─── Перегляд розмови ─── */
                <>
                    {/* Шапка */}
                    <div className="chat-conv-header">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="chat-back-btn"
                            aria-label="Назад"
                        >
                            ‹
                        </button>

                        <div className="chat-conv-header-center">
                            <div className="chat-avatar">
                                {currentChat.avatar_url ? (
                                    <img src={getUploadsBaseUrl() + currentChat.avatar_url} alt="" />
                                ) : (
                                    <span className="chat-avatar-placeholder">
                                        {currentChat.nickname?.charAt(0).toUpperCase() || "?"}
                                    </span>
                                )}
                            </div>
                            <span className="chat-conv-nickname">{currentChat.nickname}</span>
                        </div>

                        <div className="chat-menu-wrapper" ref={menuRef}>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                                className="chat-menu-btn"
                                aria-label="Меню"
                            >
                                ⋮
                            </button>
                            {menuOpen && !isRequestView && (
                                <div className="chat-menu-dropdown">
                                    <button
                                        type="button"
                                        onClick={handleDeleteChat}
                                        className="chat-menu-delete-btn"
                                    >
                                        Видалити чат
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Повідомлення */}
                    <div className="chat-messages-area">
                        {messages.length === 0 ? (
                            <p className="chat-messages-empty">Поки що немає повідомлень</p>
                        ) : (
                            messages.map((m) => {
                                const isOwn = m.sender_id === currentUser?.user_id;
                                return (
                                    <div
                                        key={m.message_id}
                                        className={`chat-message-row ${isOwn ? "own" : "other"}`}
                                    >
                                        <div className={`chat-message-bubble ${isOwn ? "own" : "other"}`}>
                                            <div>{m.text}</div>
                                            <div className="chat-message-time">
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

                    {/* Футер */}
                    {isRequestView ? (
                        <div className="chat-request-actions">
                            <button type="button" onClick={handleAcceptRequest} className="chat-accept-btn">
                                Прийняти
                            </button>
                            <button type="button" onClick={handleIgnoreRequest} className="chat-ignore-btn">
                                Ігнорувати
                            </button>
                        </div>
                    ) : (
                        <div className="chat-input-area">
                            <button type="button" className="chat-attach-btn" aria-label="Вкладення">
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
                                className="chat-text-input"
                            />
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!text.trim()}
                                className={`chat-send-btn ${text.trim() ? "active" : "disabled"}`}
                                aria-label="Надіслати"
                            >
                                ➤
                            </button>
                        </div>
                    )}
                </>
            ) : (
                /* ─── Список чатів або запитів ─── */
                <>
                    {/* Tabs */}
                    <div className="chat-list-tabs">
                        <button
                            type="button"
                            onClick={() => setActiveTab(TAB_CHATS)}
                            className={`chat-tab-btn ${activeTab === TAB_CHATS ? "active" : "inactive"}`}
                        >
                            Чати
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab(TAB_REQUESTS)}
                            className={`chat-tab-btn ${activeTab === TAB_REQUESTS ? "active" : "inactive"}`}
                        >
                            Запити
                        </button>
                    </div>

                    {/* Пошук */}
                    {activeTab === TAB_CHATS && (
                        <div className="chat-search-wrapper">
                            <input
                                type="text"
                                value={chatSearchQuery}
                                onChange={(e) => setChatSearchQuery(e.target.value)}
                                placeholder="Пошук чату..."
                                className="chat-search-input"
                            />
                        </div>
                    )}

                    {/* Список */}
                    <div className="chat-list-scroll">
                        {activeTab === TAB_CHATS && (
                            chatSearchQuery.trim() && filteredChats.length === 0 ? (
                                <div className="chat-list-empty">Чат не знайдено</div>
                            ) : filteredChats && filteredChats.length > 0 ? (
                                filteredChats.map((c) => (
                                    <div
                                        key={c.chat_id}
                                        role="button"
                                        tabIndex={0}
                                        className="chat-list-item"
                                        onClick={() => handleSelectChat(c.chat_id)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                handleSelectChat(c.chat_id);
                                            }
                                        }}
                                    >
                                        <div className="chat-list-item-inner">
                                            <div className="chat-list-avatar">
                                                {c.avatar_url ? (
                                                    <img src={getUploadsBaseUrl() + c.avatar_url} alt="" />
                                                ) : (
                                                    <span className="chat-list-avatar-placeholder">
                                                        {c.nickname?.charAt(0).toUpperCase() || "?"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="chat-list-info">
                                                <strong className="chat-list-name">{c.nickname}</strong>
                                                <p className="chat-list-last-msg">
                                                    {c.last_message || "Почніть розмову"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="chat-list-empty">У вас поки немає чатів</div>
                            )
                        )}

                        {activeTab === TAB_REQUESTS && (
                            requests && requests.length > 0 ? (
                                requests.map((r) => (
                                    <div
                                        key={r.chat_id}
                                        role="button"
                                        tabIndex={0}
                                        className="chat-list-item"
                                        onClick={() => handleSelectRequest(r.chat_id)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                handleSelectRequest(r.chat_id);
                                            }
                                        }}
                                    >
                                        <div className="chat-list-item-inner">
                                            <div className="chat-list-avatar">
                                                {r.avatar_url ? (
                                                    <img src={getUploadsBaseUrl() + r.avatar_url} alt="" />
                                                ) : (
                                                    <span className="chat-list-avatar-placeholder">
                                                        {r.nickname?.charAt(0).toUpperCase() || "?"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="chat-list-info">
                                                <strong className="chat-list-name">{r.nickname}</strong>
                                                <p className="chat-list-last-msg">
                                                    {r.last_message || "Нове повідомлення"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="chat-list-empty">Немає запитів на чат</div>
                            )
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default FloatingChatButton;
import React, { useState, useEffect } from "react";
import { useChat } from "../../context/chatContext";

const FloatingChatButton = () => {
    const { chats, loadChats, openChat, currentChatId } = useChat();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        loadChats();
    }, []);

    useEffect(() => {
        const openPanel = () => setOpen(true);
        window.addEventListener("openChatPanel", openPanel);
        return () => window.removeEventListener("openChatPanel", openPanel);
    }, []);

    // Якщо чат відкритий, не показувати кнопку
    if (currentChatId) return null;

    return (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "#6441A5",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "24px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
                💬
            </button>

            {open && (
                <>
                    {/* Overlay для закриття при кліку поза меню */}
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999,
                        }}
                        onClick={() => setOpen(false)}
                    />
                    
                    <div
                        style={{
                            position: "absolute",
                            bottom: 70,
                            right: 0,
                            width: 280,
                            maxHeight: 400,
                            overflowY: "auto",
                            background: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "10px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            zIndex: 1000,
                        }}
                    >
                        <div
                            style={{
                                padding: "12px 15px",
                                borderBottom: "1px solid #eee",
                                backgroundColor: "#6441A5",
                                color: "#fff",
                                borderRadius: "10px 10px 0 0",
                                fontWeight: "bold",
                            }}
                        >
                            Мої чати
                        </div>

                        {chats && chats.length > 0 ? (
                            chats.map((c) => (
                                <div
                                    key={c.chat_id}
                                    style={{
                                        padding: "12px 15px",
                                        borderBottom: "1px solid #eee",
                                        cursor: "pointer",
                                        transition: "background 0.2s",
                                    }}
                                    onClick={() => {
                                        openChat(c.chat_id);
                                        setOpen(false);
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                backgroundColor: "#6441A5",
                                                color: "#fff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 18,
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {c.nickname?.charAt(0).toUpperCase() || "?"}
                                        </div>
                                        <div style={{ flex: 1, overflow: "hidden" }}>
                                            <strong style={{ display: "block" }}>{c.nickname}</strong>
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
    );
};

export default FloatingChatButton;
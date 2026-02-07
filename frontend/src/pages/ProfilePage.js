import React, { useEffect, useState } from "react";
import { fetchAPI } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { authService } from "../services/authService";
import { useChat } from "../context/chatContext";
import VideoCard from "../features/components/VideoCard";
import VideoModal from "../features/components/VideoModal";
import VideoEditModal from "../features/components/VideoEditModal";

const ProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { startNewChat } = useChat();

    // Отримуємо currentUser один раз
    const [currentUser] = useState(() => authService.getCurrentUser());

    console.log("ProfilePage userId:", userId, "type:", typeof userId);
    console.log("Current user:", currentUser);

    // ВИПРАВЛЕНО: правильна перевірка
    const isOwnProfile = !userId || 
        (currentUser && String(currentUser.user_id) === String(userId));

    const [videos, setVideos] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const [editingVideo, setEditingVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                if (isOwnProfile) {
                    // Завантаження власних відео
                    const data = await fetchAPI("/videos/me", { method: "GET" });
                    console.log("My videos response:", data);
                    
                    if (Array.isArray(data)) {
                        setVideos(data);
                    } else if (data.videos && Array.isArray(data.videos)) {
                        setVideos(data.videos);
                    } else {
                        setVideos([]);
                    }

                    // Використовуємо дані поточного користувача
                    if (currentUser) {
                        setUserInfo(currentUser);
                    }
                } else {
                    // Завантаження відео іншого користувача
                    const data = await fetchAPI(`/videos/user/${userId}`, { method: "GET" });
                    console.log("User videos response:", data);
                    
                    if (Array.isArray(data)) {
                        setVideos(data);
                    } else if (data.videos && Array.isArray(data.videos)) {
                        setVideos(data.videos);
                    } else {
                        setVideos([]);
                    }

                    // Завантаження інформації про користувача
                    const userData = await fetchAPI(`/users/${userId}`, { method: "GET" });
                    console.log("User info response:", userData);
                    setUserInfo(userData);

                    // Перевірка статусу підписки
                    if (currentUser) {
                        try {
                            const status = await fetchAPI(
                                `/subscriptions/status?channelId=${userId}`,
                                { method: "GET" }
                            );
                            setIsSubscribed(status.subscribed || false);
                        } catch (err) {
                            console.error("Failed to check subscription status", err);
                            setIsSubscribed(false);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
                setVideos([]);
                if (isOwnProfile && currentUser) {
                    setUserInfo(currentUser);
                }
            } finally {
                setLoading(false);
            }
        };

        if (!currentUser) {
            navigate("/login");
            return;
        }

        loadData();
    }, [userId, isOwnProfile, currentUser, navigate]);

    const handleToggleSubscribe = async () => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

        setSubscribing(true);
        try {
            if (isSubscribed) {
                await fetchAPI("/subscriptions/unsubscribe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ channelId: userId }),
                });
                setIsSubscribed(false);
            } else {
                await fetchAPI("/subscriptions/subscribe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ channelId: userId }),
                });
                setIsSubscribed(true);
            }
        } catch (err) {
            console.error("Failed to update subscription", err);
        } finally {
            setSubscribing(false);
        }
    };

    const handleStartChat = async () => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

        if (!userId) {
            console.error("No userId provided");
            alert("Не вдалося визначити ID користувача");
            return;
        }

        const targetId = Number(userId);

        if (isNaN(targetId)) {
            console.error("Invalid userId:", userId);
            alert("Невалідний ID користувача");
            return;
        }

        console.log("Opening chat with user:", targetId);
        
        try {
            await startNewChat(targetId);
        } catch (err) {
            console.error("Failed to start chat", err);
            alert("Не вдалося почати чат");
        }
    };

    const handleVideoDelete = (video_id) => {
        setVideos((prev) => prev.filter((v) => v.video_id !== video_id));
        if (selectedVideoId === video_id) {
            setSelectedVideoId(null);
        }
    };

    if (loading) {
        return <p style={{ padding: "20px" }}>Завантаження...</p>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1>
                        {isOwnProfile
                            ? "Мій профіль"
                            : userInfo?.nickname || "Профіль користувача"}
                    </h1>
                    {userInfo?.bio && (
                        <p style={{ color: "#666", marginTop: 5 }}>{userInfo.bio}</p>
                    )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    {isOwnProfile && (
                        <button
                            onClick={() => navigate("/upload")}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#6441A5",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Завантажити відео
                        </button>
                    )}

                    {!isOwnProfile && currentUser && (
                        <>
                            <button
                                onClick={handleToggleSubscribe}
                                disabled={subscribing}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: isSubscribed ? "#ccc" : "#e60073",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: subscribing ? "default" : "pointer",
                                }}
                            >
                                {subscribing
                                    ? "..."
                                    : isSubscribed
                                    ? "Відписатися"
                                    : "Підписатися"}
                            </button>

                            <button
                                onClick={handleStartChat}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#6441A5",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                }}
                            >
                                💬 Написати
                            </button>
                        </>
                    )}
                </div>
            </div>

            <h2 style={{ marginTop: 30, marginBottom: 15 }}>
                Відео {videos.length > 0 && `(${videos.length})`}
            </h2>

            {videos.length === 0 ? (
                <p style={{ color: "#999", textAlign: "center", padding: "40px 0" }}>
                    {isOwnProfile
                        ? "У вас ще немає завантажених відео"
                        : "Користувач ще не завантажив жодного відео"}
                </p>
            ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                    {videos.map((v) => (
                        <VideoCard
                            key={v.video_id}
                            video={v}
                            isOwner={isOwnProfile}
                            onClick={setSelectedVideoId}
                            onEdit={setEditingVideo}
                            onDelete={handleVideoDelete}
                        />
                    ))}
                </div>
            )}

            {selectedVideoId && (
                <VideoModal
                    video_id={selectedVideoId}
                    onClose={() => setSelectedVideoId(null)}
                    onVideoDelete={handleVideoDelete}
                />
            )}

            {editingVideo && (
                <VideoEditModal
                    video_id={editingVideo.video_id}
                    video={editingVideo}
                    onClose={() => setEditingVideo(null)}
                    onDelete={handleVideoDelete}
                    onUpdate={(updated) => {
                        setVideos((prev) =>
                            prev.map((v) =>
                                v.video_id === updated.video_id ? updated : v
                            )
                        );
                        setEditingVideo(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProfilePage;
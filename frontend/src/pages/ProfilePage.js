import React, { useEffect, useState } from "react";
import { fetchAPI, getUploadsBaseUrl } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { authService } from "../services/authService";
import { useChat } from "../context/chatContext";
import VideoCard from "../features/components/VideoCard";
import VideoModal from "../features/components/VideoModal";
import VideoEditModal from "../features/components/VideoEditModal";
import "../styles/ProfilePage.css";

const BIO_TRUNCATE_LENGTH = 150;
const TABS = [
    { id: "home", label: "Головна" },
    { id: "about", label: "Опис" },
    { id: "video", label: "Відео" },
    { id: "clips", label: "Кліпи" },
];

const ProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { startNewChat } = useChat();

    const [currentUser] = useState(() => authService.getCurrentUser());
    const isOwnProfile = !userId ||
        (currentUser && String(currentUser.user_id) === String(userId));

    const [videos, setVideos] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const [editingVideo, setEditingVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("home");

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [bioExpanded, setBioExpanded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                if (isOwnProfile) {
                    const [videosRes, meRes] = await Promise.all([
                        fetchAPI("/videos/me", { method: "GET" }),
                        fetchAPI("/users/me", { method: "GET" }),
                    ]);
                    if (Array.isArray(videosRes)) {
                        setVideos(videosRes);
                    } else if (videosRes?.videos) {
                        setVideos(videosRes.videos);
                    } else {
                        setVideos([]);
                    }
                    if (meRes) setUserInfo(meRes);
                } else {
                    const data = await fetchAPI(`/videos/user/${userId}`, { method: "GET" });
                    if (Array.isArray(data)) {
                        setVideos(data);
                    } else if (data.videos && Array.isArray(data.videos)) {
                        setVideos(data.videos);
                    } else {
                        setVideos([]);
                    }

                    const userData = await fetchAPI(`/users/${userId}`, { method: "GET" });
                    setUserInfo(userData);

                    if (currentUser) {
                        try {
                            const status = await fetchAPI(
                                `/subscriptions/status?channelId=${userId}`,
                                { method: "GET" }
                            );
                            setIsSubscribed(status.subscribed || false);
                        } catch (err) {
                            setIsSubscribed(false);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
                setVideos([]);
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
        if (!currentUser) { navigate("/login"); return; }
        setSubscribing(true);
        try {
            if (isSubscribed) {
                await fetchAPI("/subscriptions/unsubscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ channelId: userId }),
                });
                setIsSubscribed(false);
            } else {
                await fetchAPI("/subscriptions/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
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
        if (!currentUser) { navigate("/login"); return; }
        if (!userId) return;
        const targetId = Number(userId);
        if (isNaN(targetId)) return;
        try {
            await startNewChat(targetId);
        } catch (err) {
            console.error("Failed to start chat", err);
            alert("Не вдалося почати чат");
        }
    };

    const handleVideoDelete = (video_id) => {
        setVideos((prev) => prev.filter((v) => v.video_id !== video_id));
        if (selectedVideoId === video_id) setSelectedVideoId(null);
    };

    if (loading) {
        return <p className="profile-loading">Завантаження...</p>;
    }

    const bio = userInfo?.bio || "";
    const showBioExpand = bio.length > BIO_TRUNCATE_LENGTH;
    const bioDisplay = showBioExpand && !bioExpanded
        ? bio.slice(0, BIO_TRUNCATE_LENGTH) + "…"
        : bio;
    const avatarSrc = userInfo?.avatar_url
        ? getUploadsBaseUrl() + userInfo.avatar_url
        : null;
    const bannerSrc = userInfo?.banner_url
        ? getUploadsBaseUrl() + userInfo.banner_url
        : null;
    const subscriberCount = userInfo?.subscriber_count != null
        ? Number(userInfo.subscriber_count).toLocaleString("uk-UA")
        : "0";

    return (
        <div className="profile-page">
            {/* Banner */}
            <div className="profile-banner-wrap">
                <div
                    className="profile-banner-bg"
                    style={bannerSrc ? { backgroundImage: `url(${bannerSrc})` } : {}}
                />
                <div className="profile-banner-overlay">

                    {/* Інфо-картка зліва */}
                    <div className="profile-info-card">
                        <div className="profile-avatar-wrap">
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="" className="profile-avatar" />
                            ) : (
                                <div className="profile-avatar-placeholder">?</div>
                            )}
                        </div>
                        <div className="profile-title-block">
                            <h1 className="profile-name">
                                {isOwnProfile ? "Мій профіль" : userInfo?.nickname || "Профіль"}
                            </h1>
                            {bio && (
                                <>
                                    <p className="profile-bio">{bioDisplay}</p>
                                    {showBioExpand && (
                                        <button
                                            type="button"
                                            className="profile-bio-expand"
                                            onClick={() => setBioExpanded((e) => !e)}
                                        >
                                            {bioExpanded ? "Згорнути" : "Більше"}
                                        </button>
                                    )}
                                </>
                            )}
                            <p className="profile-followers">{subscriberCount} фолловерів</p>
                        </div>
                    </div>

                    {/* Кнопки дій — окремо від картки, справа внизу */}
                    <div className="profile-actions">
                        {isOwnProfile && (
                            <>
                                <button
                                    type="button"
                                    className="profile-btn profile-btn-follow"
                                    onClick={() => navigate("/settings")}
                                >
                                    Налаштування
                                </button>
                                <button
                                    type="button"
                                    className="profile-btn profile-btn-subscribe-alt"
                                    onClick={() => navigate("/upload")}
                                >
                                    Завантажити відео
                                </button>
                            </>
                        )}
                        {!isOwnProfile && currentUser && (
                            <>
                                <button
                                    type="button"
                                    className="profile-btn profile-btn-follow"
                                    onClick={handleToggleSubscribe}
                                    disabled={subscribing}
                                >
                                    {subscribing ? "…" : isSubscribed ? "Відстежується" : "Відстежувати"}
                                </button>
                                <button
                                    type="button"
                                    className="profile-btn profile-btn-subscribe-alt"
                                    onClick={handleToggleSubscribe}
                                    disabled={subscribing}
                                >
                                    {subscribing ? "…" : isSubscribed ? "Відписатися" : "Підписатися"}
                                </button>
                                <button
                                    type="button"
                                    className="profile-btn profile-btn-primary"
                                    onClick={handleStartChat}
                                >
                                    Написати
                                </button>
                            </>
                        )}
                    </div>

                </div>
            </div>

            {/* Tabs */}
            <nav className="profile-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`profile-tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Tab content */}
            <div className="profile-content">
                {activeTab === "home" && (
                    <section className="profile-home-section">
                        {videos.length > 0 && (
                            <h2 className="profile-section-title">Останні трансляції</h2>
                        )}
                        {videos.length === 0 ? (
                            <p className="profile-videos-empty">
                                {isOwnProfile
                                    ? "У вас ще немає завантажених відео"
                                    : "Користувач ще не завантажив жодного відео"}
                            </p>
                        ) : (
                            <div className="profile-videos-grid">
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
                    </section>
                )}
                {activeTab === "about" && (
                    <section className="profile-about-section">
                        <h2 className="profile-section-title">Опис</h2>
                        <p className="profile-about-bio">{bio || "Немає опису."}</p>
                    </section>
                )}
                {activeTab === "video" && (
                    <section className="profile-video-section">
                        <h2 className="profile-section-title">Відео {videos.length > 0 && `(${videos.length})`}</h2>
                        {videos.length === 0 ? (
                            <p className="profile-videos-empty">Немає відео.</p>
                        ) : (
                            <div className="profile-videos-grid">
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
                    </section>
                )}
                {activeTab === "clips" && (
                    <section className="profile-clips-section">
                        <h2 className="profile-section-title">Кліпи</h2>
                        <p className="profile-videos-empty">Кліпи поки недоступні.</p>
                    </section>
                )}
            </div>

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
                            prev.map((v) => (v.video_id === updated.video_id ? updated : v))
                        );
                        setEditingVideo(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProfilePage;
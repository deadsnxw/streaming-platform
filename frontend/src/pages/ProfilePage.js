import React, { useEffect, useState } from "react";
import { fetchAPI } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { authService } from "../services/authService";
import VideoCard from "../features/components/VideoCard";
import VideoModal from "../features/components/VideoModal";
import VideoEditModal from "../features/components/VideoEditModal";

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const isOwnProfile =
    !userId ||
    (currentUser && Number(currentUser.user_id) === Number(userId));

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
          const data = await fetchAPI("/videos/me", { method: "GET" });
          setVideos(data.videos || []);

          const userData = await fetchAPI("/users/me", { method: "GET" });
          setUserInfo(userData);
        } else {
          const data = await fetchAPI(`/videos/user/${userId}`, { method: "GET" });
          setVideos(data.videos || []);

          const userData = await fetchAPI(`/users/${userId}`, { method: "GET" });
          setUserInfo(userData);

          const status = await fetchAPI(
            `/subscriptions/status?channelId=${userId}`,
            { method: "GET" }
          );
          setIsSubscribed(status.subscribed);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, isOwnProfile]);

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
          body: { channelId: userId },
        });
        setIsSubscribed(false);
      } else {
        await fetchAPI("/subscriptions/subscribe", {
          method: "POST",
          body: { channelId: userId },
        });
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error("Failed to update subscription", err);
    } finally {
      setSubscribing(false);
    }
  };

  const handleVideoDelete = (videoId) => {
    setVideos((prev) => prev.filter((v) => v.video_id !== videoId));
    if (selectedVideoId === videoId) {
      setSelectedVideoId(null);
    }
  };

  if (loading) {
    return <p style={{ padding: "20px" }}>Завантаження...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>
          {isOwnProfile
            ? "Мій профіль"
            : userInfo?.nickname || "Профіль користувача"}
        </h1>

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
              }}
            >
              Завантажити відео
            </button>
          )}

          {!isOwnProfile && (
            <button
              onClick={handleToggleSubscribe}
              disabled={subscribing}
              style={{
                padding: "10px 20px",
                backgroundColor: isSubscribed ? "#ccc" : "#e60073",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
              }}
            >
              {subscribing
                ? "..."
                : isSubscribed
                ? "Відписатися"
                : "Підписатися"}
            </button>
          )}
        </div>
      </div>

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

      {selectedVideoId && (
        <VideoModal
          videoId={selectedVideoId}
          onClose={() => setSelectedVideoId(null)}
          onVideoDelete={handleVideoDelete}
        />
      )}

      {editingVideo && (
        <VideoEditModal
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
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
    (currentUser &&
      Number(currentUser.user_id) === Number(userId));

  const [videos, setVideos] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [loading, setLoading] = useState(true);

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
          const data = await fetchAPI(`/videos/user/${userId}`, {
            method: "GET",
          });
          setVideos(data.videos || []);

          const userData = await fetchAPI(`/users/${userId}`, {
            method: "GET",
          });
          setUserInfo(userData);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, isOwnProfile]);

  const handleVideoClick = (videoId) => {
    setSelectedVideoId(videoId);
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
      <h1>
        {isOwnProfile
          ? "Мій профіль"
          : userInfo?.nickname || "Профіль користувача"}
      </h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {videos.map((v) => (
          <VideoCard
            key={v.video_id}
            video={v}
            isOwner={isOwnProfile}
            onClick={handleVideoClick}
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
          videoId={editingVideo.video_id}
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onDelete={handleVideoDelete}
          onUpdate={(updatedVideo) => {
            setVideos((prev) =>
              prev.map((v) =>
                v.video_id === updatedVideo.video_id
                  ? { ...v, ...updatedVideo }
                  : v
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
import React, { useEffect, useState } from "react";
import { fetchAPI } from "../services/api";
import VideoCard from "../features/components/VideoCard";
import VideoModal from "../features/components/VideoModal";
import "../styles/HomePage.css";

export default function HomePage({ user }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [feedType, setFeedType] = useState("all"); // 'all' | 'subscriptions'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const loadVideos = async (type = "all") => {
    try {
      setLoading(true);
      let data;

      if (type === "subscriptions") {
        data = await fetchAPI("/subscriptions/feed", { method: "GET" });
      } else {
        data = await fetchAPI("/videos/public", { method: "GET" });
      }

      setVideos(data.videos || []);
      setIsSearching(false);
    } catch (err) {
      console.error("Failed to fetch videos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadVideos(feedType);
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const data = await fetchAPI(
        `/videos/search?q=${encodeURIComponent(searchQuery.trim())}`,
        { method: "GET" }
      );
      setVideos(data.videos || []);
    } catch (err) {
      console.error("Failed to search videos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    loadVideos(feedType);
  };

  useEffect(() => {
    // Clear search when feed type changes
    if (isSearching) {
      setIsSearching(false);
      setSearchQuery("");
    }
    loadVideos(feedType);
  }, [feedType]);

  const handleVideoClick = (video_id) => {
    setSelectedVideoId(video_id);
  };

  const handleCloseModal = () => {
    setSelectedVideoId(null);
  };

  return (
    <div className="home-container">
      <div className="home-header-row">
        <h1 className="home-header-title">
          {isSearching
            ? `Результати пошуку: "${searchQuery}"`
            : feedType === "subscriptions"
            ? "Підписки"
            : "Рекомендації"}
        </h1>

        <div className="home-header-buttons">
          {user && !isSearching && (
            <>
              <button
                type="button"
                onClick={() => setFeedType("all")}
                className={`home-toggle-btn ${feedType === "all" ? "active" : ""}`}
              >
                Всі відео
              </button>
              <button
                type="button"
                onClick={() => setFeedType("subscriptions")}
                className={`home-toggle-btn ${feedType === "subscriptions" ? "active" : ""}`}
              >
                Підписки
              </button>
            </>
          )}
          {isSearching && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="home-clear-search-btn"
            >
              Очистити пошук
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className="home-search-form">
        <input
          type="text"
          placeholder="Пошук відео за назвою або тегами..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="home-search-input"
        />
        <button type="submit" className="home-search-button">
          Пошук
        </button>
      </form>

      {loading && <p>Завантаження...</p>}

      {!loading && videos.length === 0 && (
        <p>
          {isSearching
            ? "Нічого не знайдено за вашим запитом."
            : feedType === "subscriptions"
            ? "Немає відео з каналів, на які ви підписані."
            : "Немає доступних відео."}
        </p>
      )}

      <div className="home-videos-grid">
        {videos.map((v) => (
          <VideoCard key={v.video_id} video={v} onClick={handleVideoClick} />
        ))}
      </div>

      {selectedVideoId && (
        <VideoModal
          video_id={selectedVideoId}
          onClose={handleCloseModal}
          onVideoUpdate={() => loadVideos(feedType)}
          onVideoDelete={() => {
            setVideos((prev) =>
              prev.filter((v) => v.video_id !== selectedVideoId),
            );
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}
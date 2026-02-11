import React, { useEffect, useState } from "react";
import { fetchAPI } from "../services/api";
import VideoCard from "../features/components/VideoCard";
import VideoModal from "../features/components/VideoModal";
import {
  homeContainer,
  homeHeaderRow,
  homeHeaderTitle,
  homeHeaderButtons,
  homeSearchForm,
  homeSearchInput,
  homeSearchButton,
  homeVideosGrid,
  homeToggleButtonBase,
  homeClearSearchButton,
} from "../styles/HomePageStyles";

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
    <div style={homeContainer}>
      <div style={homeHeaderRow}>
        <h1 style={homeHeaderTitle}>
          {isSearching
            ? `Результати пошуку: "${searchQuery}"`
            : feedType === "subscriptions"
            ? "Підписки"
            : "Рекомендації"}
        </h1>

        <div style={homeHeaderButtons}>
          {user && !isSearching && (
            <>
              <button
                onClick={() => setFeedType("all")}
                style={{
                  ...homeToggleButtonBase,
                  backgroundColor: feedType === "all" ? "#6441A5" : "#eee",
                  color: feedType === "all" ? "#fff" : "#333",
                  fontWeight: feedType === "all" ? "600" : "400",
                }}
              >
                Всі відео
              </button>
              <button
                onClick={() => setFeedType("subscriptions")}
                style={{
                  ...homeToggleButtonBase,
                  backgroundColor:
                    feedType === "subscriptions" ? "#6441A5" : "#eee",
                  color: feedType === "subscriptions" ? "#fff" : "#333",
                  fontWeight: feedType === "subscriptions" ? "600" : "400",
                }}
              >
                Підписки
              </button>
            </>
          )}
          {isSearching && (
            <button
              onClick={handleClearSearch}
              style={homeClearSearchButton}
            >
              Очистити пошук
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={homeSearchForm}>
        <input
          type="text"
          placeholder="Пошук відео за назвою або тегами..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={homeSearchInput}
        />
        <button
          type="submit"
          style={homeSearchButton}
        >
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

      <div style={homeVideosGrid}>
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
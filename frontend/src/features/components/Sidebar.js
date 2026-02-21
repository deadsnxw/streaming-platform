import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchAPI, getUploadsBaseUrl } from "../../services/api";
import "../../styles/Sidebar.css";

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 56;

export default function Sidebar({ open, onToggle }) {
    const [followedChannels, setFollowedChannels] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tagsLoading, setTagsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const data = await fetchAPI("/subscriptions/me", { method: "GET" });
                if (!cancelled && data?.subscriptions) {
                    setFollowedChannels(data.subscriptions);
                }
            } catch (err) {
                if (!cancelled) setFollowedChannels([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        const load = async () => {
            try {
                const data = await fetchAPI("/videos/tags/popular?limit=10", { method: "GET" });
                if (!cancelled && data?.tags) {
                    setPopularTags(data.tags);
                }
            } catch (err) {
                if (!cancelled) setPopularTags([]);
            } finally {
                if (!cancelled) setTagsLoading(false);
            }
        };
        setTagsLoading(true);
        load();
        return () => { cancelled = true; };
    }, [open]);

    return (
        <aside
            className={`sidebar ${open ? "sidebar-open" : "sidebar-collapsed"}`}
            style={{
                width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
            }}
        >
            <button
                type="button"
                className="sidebar-toggle"
                onClick={onToggle}
                aria-label={open ? "Згорнути" : "Розгорнути"}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: open ? "rotate(0deg)" : "rotate(180deg)" }}
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            {open && (
                <div className="sidebar-content">
                    <section className="sidebar-section">
                        <h3 className="sidebar-section-title">Відстежувані канали</h3>
                        {loading ? (
                            <p className="sidebar-placeholder">Завантаження...</p>
                        ) : followedChannels.length === 0 ? (
                            <p className="sidebar-placeholder">Немає каналів</p>
                        ) : (
                            <ul className="sidebar-channel-list">
                                {followedChannels.slice(0, 10).map((ch) => (
                                    <li key={ch.channel_id}>
                                        <Link
                                            to={`/profile/${ch.channel_id}`}
                                            className="sidebar-channel-item"
                                        >
                                            <span className="sidebar-channel-avatar">
                                                {ch.avatar_url ? (
                                                    <img
                                                        src={getUploadsBaseUrl() + ch.avatar_url}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <span>?</span>
                                                )}
                                            </span>
                                            <span className="sidebar-channel-name">{ch.nickname}</span>
                                            <span className="sidebar-channel-meta">• —</span>
                                        </Link>
                                    </li>
                                ))}
                                {followedChannels.length > 10 && (
                                    <li>
                                        <button type="button" className="sidebar-show-more">
                                            Показати ще
                                        </button>
                                    </li>
                                )}
                            </ul>
                        )}
                    </section>

                    <section className="sidebar-section">
                        <h3 className="sidebar-section-title">Активні канали</h3>
                        <p className="sidebar-placeholder">Поки що немає стримів</p>
                    </section>

                    <section className="sidebar-section">
                        <h3 className="sidebar-section-title">Популярні теги</h3>
                        {tagsLoading ? (
                            <p className="sidebar-placeholder">Завантаження...</p>
                        ) : popularTags.length === 0 ? (
                            <p className="sidebar-placeholder">Немає тегів</p>
                        ) : (
                            <ul className="sidebar-category-list">
                                {popularTags.map((tag) => (
                                    <li key={tag.tag_id}>
                                        <Link
                                            to={`/?q=${encodeURIComponent(tag.name)}`}
                                            className="sidebar-category-item"
                                        >
                                            <span className="sidebar-category-thumb" />
                                            <span className="sidebar-category-name">{tag.name}</span>
                                            <span className="sidebar-category-viewers">
                                                • {tag.video_count} відео
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </aside>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../../services/authService';
import { fetchAPI } from '../../services/api';
import VideoEditModal from './VideoEditModal';

const VideoModal = ({ videoId, onClose, onVideoUpdate, onVideoDelete }) => {
    const [videoBlobUrl, setVideoBlobUrl] = useState(null);
    const [videoInfo, setVideoInfo] = useState(null);
    const [error, setError] = useState(null);
    const [editingVideo, setEditingVideo] = useState(null);
    const videoRef = useRef(null);
    const watchStartTime = useRef(null);
    const totalWatchTime = useRef(0);
    const lastTimeUpdate = useRef(0);
    const hasRecordedWatch = useRef(false);
    const currentUser = authService.getCurrentUser();
    const isOwner = currentUser && videoInfo && currentUser.user_id === videoInfo.user_id;

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                // Fetch video info first
                const videoData = await fetchAPI(`/videos/${videoId}`, { method: 'GET' });
                setVideoInfo(videoData);

                // Then fetch video blob
                const token = authService.getToken();
                const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${apiBaseUrl}/videos/${videoId}/watch`, {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch video');
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setVideoBlobUrl(url);
            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити відео');
            }
        };

        fetchVideo();

        return () => {
            if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
        };
    }, [videoId]);

    const recordWatchTime = async (watchDuration) => {
        if (hasRecordedWatch.current) return;
        hasRecordedWatch.current = true;

        try {
            await fetchAPI(`/videos/${videoId}/watch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ watchDuration }),
            });
        } catch (err) {
            console.error('Failed to record watch time:', err);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => {
            watchStartTime.current = Date.now();
            lastTimeUpdate.current = video.currentTime;
        };

        const handlePause = () => {
            if (watchStartTime.current) {
                const pausedTime = video.currentTime;
                const timeWatched = pausedTime - lastTimeUpdate.current;
                if (timeWatched > 0) {
                    totalWatchTime.current += timeWatched;
                }
                lastTimeUpdate.current = pausedTime;
            }
        };

        const handleTimeUpdate = () => {
            if (watchStartTime.current) {
                const currentTime = video.currentTime;
                const timeWatched = currentTime - lastTimeUpdate.current;
                if (timeWatched > 0.5) { // Update every 0.5 seconds
                    totalWatchTime.current += timeWatched;
                    lastTimeUpdate.current = currentTime;
                }
            }
        };

        const handleEnded = () => {
            if (watchStartTime.current) {
                const finalTime = video.currentTime;
                const timeWatched = finalTime - lastTimeUpdate.current;
                if (timeWatched > 0) {
                    totalWatchTime.current += timeWatched;
                }
                recordWatchTime(totalWatchTime.current);
            }
        };

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);

            // Record watch time when component unmounts (user closes modal)
            if (watchStartTime.current && !hasRecordedWatch.current) {
                const finalTime = video.currentTime || 0;
                const timeWatched = finalTime - lastTimeUpdate.current;
                if (timeWatched > 0) {
                    totalWatchTime.current += timeWatched;
                }
                recordWatchTime(totalWatchTime.current);
            }
        };
    }, [videoBlobUrl, videoId]);

    if (!videoId) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div style={{ position: 'relative', width: '80%', maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ position: 'absolute', top: '-50px', right: 0, display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {isOwner && videoInfo && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingVideo(videoInfo);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#6441A5',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Редагувати
                            </button>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Ви впевнені, що хочете видалити це відео?')) {
                                        try {
                                            await fetchAPI(`/videos/${videoId}`, { method: 'DELETE' });
                                            if (onVideoDelete) {
                                                onVideoDelete(videoId);
                                            }
                                            onClose();
                                        } catch (err) {
                                            alert('Не вдалося видалити відео');
                                        }
                                    }
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#dc3545',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Видалити
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => {
                            // Record watch time before closing
                            if (videoRef.current && watchStartTime.current && !hasRecordedWatch.current) {
                                const finalTime = videoRef.current.currentTime || 0;
                                const timeWatched = finalTime - lastTimeUpdate.current;
                                if (timeWatched > 0) {
                                    totalWatchTime.current += timeWatched;
                                }
                                recordWatchTime(totalWatchTime.current);
                            }
                            onClose();
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            color: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        &times;
                    </button>
                </div>
                {videoInfo && (
                    <div style={{ marginBottom: '10px', color: '#fff' }}>
                        <h2 style={{ margin: 0, color: '#fff' }}>{videoInfo.title}</h2>
                        {videoInfo.description && (
                            <p style={{ margin: '5px 0', color: '#ccc' }}>{videoInfo.description}</p>
                        )}
                    </div>
                )}
                {error ? (
                    <p style={{ color: 'white' }}>{error}</p>
                ) : (
                    <video 
                        ref={videoRef}
                        src={videoBlobUrl} 
                        controls 
                        width="100%" 
                        autoPlay 
                        style={{ backgroundColor: '#000' }}
                    >
                        Ваш браузер не підтримує відео.
                    </video>
                )}
            </div>

            {editingVideo && (
                <VideoEditModal
                    videoId={editingVideo.video_id}
                    video={editingVideo}
                    onClose={() => {
                        setEditingVideo(null);
                        // Reload video info after edit
                        fetchAPI(`/videos/${videoId}`, { method: 'GET' }).then(setVideoInfo);
                    }}
                    onUpdate={(updatedVideo) => {
                        setVideoInfo(updatedVideo);
                        setEditingVideo(null);
                        if (onVideoUpdate) {
                            onVideoUpdate(updatedVideo);
                        }
                    }}
                    onDelete={(deletedVideoId) => {
                        if (onVideoDelete) {
                            onVideoDelete(deletedVideoId);
                        }
                        onClose();
                    }}
                />
            )}
        </div>
    );
};

export default VideoModal;
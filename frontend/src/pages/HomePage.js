import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../services/api';
import VideoCard from '../features/components/VideoCard';
import VideoModal from '../features/components/VideoModal';

export default function HomePage({ user }) {
    const [videos, setVideos] = useState([]);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const [feedType, setFeedType] = useState('all'); // 'all' | 'subscriptions'
    const [loading, setLoading] = useState(true);

    const loadVideos = async (type = 'all') => {
        try {
            setLoading(true);
            let data;

            if (type === 'subscriptions') {
                data = await fetchAPI('/subscriptions/feed', { method: 'GET' });
            } else {
                data = await fetchAPI('/videos/public', { method: 'GET' });
            }

            setVideos(data.videos || []);
        } catch (err) {
            console.error('Failed to fetch videos', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVideos(feedType);
    }, [feedType]);

    const handleVideoClick = (videoId) => {
        setSelectedVideoId(videoId);
    };

    const handleCloseModal = () => {
        setSelectedVideoId(null);
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>{feedType === 'subscriptions' ? 'Підписки' : 'Рекомендації'}</h1>

                {user && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setFeedType('all')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: feedType === 'all' ? '#6441A5' : '#eee',
                                color: feedType === 'all' ? '#fff' : '#333',
                                fontWeight: feedType === 'all' ? '600' : '400'
                            }}
                        >
                            Всі відео
                        </button>
                        <button
                            onClick={() => setFeedType('subscriptions')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: feedType === 'subscriptions' ? '#6441A5' : '#eee',
                                color: feedType === 'subscriptions' ? '#fff' : '#333',
                                fontWeight: feedType === 'subscriptions' ? '600' : '400'
                            }}
                        >
                            Підписки
                        </button>
                    </div>
                )}
            </div>

            {loading && (
                <p>Завантаження...</p>
            )}

            {!loading && videos.length === 0 && (
                <p>
                    {feedType === 'subscriptions'
                        ? 'Немає відео з каналів, на які ви підписані.'
                        : 'Немає доступних відео.'}
                </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {videos.map((v) => (
                    <VideoCard key={v.video_id} video={v} onClick={handleVideoClick} />
                ))}
            </div>

            {selectedVideoId && (
                <VideoModal 
                    videoId={selectedVideoId} 
                    onClose={handleCloseModal}
                    onVideoUpdate={() => {
                        // Reload videos if a video was updated
                        loadVideos(feedType);
                    }}
                    onVideoDelete={() => {
                        // Remove deleted video from list
                        setVideos(videos.filter(v => v.video_id !== selectedVideoId));
                        handleCloseModal();
                    }}
                />
            )}
        </div>
    );
}
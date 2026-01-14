import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../services/api';
import VideoCard from '../features/components/VideoCard';
import VideoModal from '../features/components/VideoModal';

export default function HomePage({ user }) {
    const [videos, setVideos] = useState([]);
    const [selectedVideoId, setSelectedVideoId] = useState(null);

    const loadVideos = async () => {
        try {
            const data = await fetchAPI('/videos/public', { method: 'GET' });
            setVideos(data.videos || []);
        } catch (err) {
            console.error('Failed to fetch videos', err);
        }
    };

    useEffect(() => {
        loadVideos();
    }, []);

    const handleVideoClick = (videoId) => {
        setSelectedVideoId(videoId);
    };

    const handleCloseModal = () => {
        setSelectedVideoId(null);
    };

    return (
        <div>
            <h1>Recommendations</h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {videos.map((v) => (
                    <VideoCard key={v.video_id} video={v} onClick={handleVideoClick} />
                ))}
            </div>

            {selectedVideoId && (
                <VideoModal videoId={selectedVideoId} onClose={handleCloseModal} />
            )}
        </div>
    );
}
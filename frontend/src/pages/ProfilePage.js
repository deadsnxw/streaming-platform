import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import VideoCard from '../features/components/VideoCard';
import VideoModal from '../features/components/VideoModal';

const ProfilePage = () => {
    const [videos, setVideos] = useState([]);
    const [selectedVideoId, setSelectedVideoId] = useState(null);

    const navigate = useNavigate();

    const loadVideos = async () => {
        try {
            const data = await fetchAPI('/videos/me', { method: 'GET' });
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

    const handleUploadClick = () => {
        navigate('/upload');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Мій профіль</h1>

            <button 
                onClick={handleUploadClick} 
                style={{
                    marginBottom: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#6441A5',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Завантажити відео
            </button>

            {videos.length === 0 && <p>У вас ще немає відео</p>}

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
};

export default ProfilePage;
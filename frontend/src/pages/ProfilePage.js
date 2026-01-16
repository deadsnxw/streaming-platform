import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import VideoCard from '../features/components/VideoCard';
import VideoModal from '../features/components/VideoModal';

const ProfilePage = () => {
    const { userId } = useParams();
    const [videos, setVideos] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const isOwnProfile = !userId || (currentUser && currentUser.user_id === parseInt(userId));

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                
                if (isOwnProfile) {
                    // Load current user's own videos
                    const data = await fetchAPI('/videos/me', { method: 'GET' });
                    setVideos(data.videos || []);
                    
                    // Load current user info
                    const userData = await fetchAPI('/users/me', { method: 'GET' });
                    setUserInfo(userData);
                } else {
                    // Load other user's videos
                    const data = await fetchAPI(`/videos/user/${userId}`, { method: 'GET' });
                    setVideos(data.videos || []);
                    
                    // Load other user info
                    const userData = await fetchAPI(`/users/${userId}`, { method: 'GET' });
                    setUserInfo(userData);
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId, isOwnProfile]);

    const handleVideoClick = (videoId) => {
        setSelectedVideoId(videoId);
    };

    const handleCloseModal = () => {
        setSelectedVideoId(null);
    };

    const handleUploadClick = () => {
        navigate('/upload');
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Завантаження...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>{isOwnProfile ? 'Мій профіль' : (userInfo?.nickname || 'Профіль користувача')}</h1>

            {isOwnProfile && (
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
            )}

            {videos.length === 0 && (
                <p>{isOwnProfile ? 'У вас ще немає відео' : 'У цього користувача ще немає відео'}</p>
            )}

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
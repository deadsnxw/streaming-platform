import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';

const VideoModal = ({ videoId, onClose }) => {
    const [videoBlobUrl, setVideoBlobUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const token = authService.getToken();
                const response = await fetch(`${process.env.REACT_APP_API_URL}/videos/${videoId}/watch`, {
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
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        right: 0,
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    &times;
                </button>
                {error ? (
                    <p style={{ color: 'white' }}>{error}</p>
                ) : (
                    <video src={videoBlobUrl} controls width="100%" autoPlay style={{ backgroundColor: '#000' }}>
                        Ваш браузер не підтримує відео.
                    </video>
                )}
            </div>
        </div>
    );
};

export default VideoModal;
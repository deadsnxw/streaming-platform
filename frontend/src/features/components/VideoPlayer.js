import React, { useRef, useEffect, useState } from 'react';
import { authService } from '../../services/authService';

const VideoPlayer = ({ videoId, title }) => {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);
    const [src, setSrc] = useState('');

    useEffect(() => {
        const token = authService.getToken();
        let videoUrl = `${process.env.REACT_APP_API_URL}/videos/${videoId}/watch`;

        if (token) {
            videoUrl += '';
        }

        setSrc(videoUrl);
    }, [videoId]);

    const handleError = (e) => {
        console.error('Video playback error', e);
        setError('Не вдалося відтворити відео');
    };

    return (
        <div className="video-player-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3>{title}</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <video
                ref={videoRef}
                src={src}
                controls
                width="100%"
                onError={handleError}
                style={{ backgroundColor: '#000' }}
            >
                Ваш браузер не підтримує відео.
            </video>
        </div>
    );
};

export default VideoPlayer;
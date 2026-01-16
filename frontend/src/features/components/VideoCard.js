import React from 'react';
import { useNavigate } from 'react-router-dom';

const VideoCard = ({ video, onClick }) => {
    const navigate = useNavigate();

    const handleUserClick = (e) => {
        e.stopPropagation();
        if (video.user_id) {
            navigate(`/profile/${video.user_id}`);
        }
    };

    return (
        <div
            className="video-card"
            style={{
                width: '250px',
                margin: '10px',
                cursor: 'pointer',
                display: 'inline-block',
                verticalAlign: 'top'
            }}
            onClick={() => onClick(video.video_id)}
        >
            <div style={{ position: 'relative', paddingBottom: '56.25%', backgroundColor: '#000' }}>
                {video.thumbnail_url ? (
                    <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff'
                        }}
                    >
                        No Thumbnail
                    </div>
                )}
            </div>
            <h4 style={{ margin: '5px 0' }}>{video.title}</h4>
            {video.nickname && (
                <p 
                    onClick={handleUserClick}
                    style={{ 
                        fontSize: '12px', 
                        color: '#6441A5', 
                        margin: '4px 0',
                        cursor: 'pointer',
                        textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                    {video.nickname}
                </p>
            )}
            <p style={{ fontSize: '12px', color: '#555' }}>{video.views_count} views</p>
        </div>
    );
};

export default VideoCard;
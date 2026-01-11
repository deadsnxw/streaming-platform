import React from 'react';

const VideoCard = ({ video, onClick }) => {
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
            <p style={{ fontSize: '12px', color: '#555' }}>{video.views_count} views</p>
        </div>
    );
};

export default VideoCard;
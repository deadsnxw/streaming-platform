import React, { useRef, useEffect, useState } from "react";
import Hls from "hls.js";

export default function LivePlayer({ url }) {
    const videoRef = useRef(null);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(-1); 
    const [isLive, setIsLive] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !url) return;

        video.muted = true;

        let hls;
        setStatus('loading');
        setError(null);
        setLevels([]);

        const attach = () => {
            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    liveSyncDurationCount: 2
                });

                video._hls = hls;

                hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                    hls.loadSource(url);
                });

                hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    console.log('Levels:', hls.levels);
                    setLevels(hls.levels || []);
                    setStatus('attached');
                    setIsLive(data.levels && data.levels.length > 0 && data.live);
                    video.play().catch(() => {});
                });

                hls.on(Hls.Events.LEVEL_SWITCHED, () => {
                    const level = hls.currentLevel;
                    setSelectedLevel(level);
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS error', event, data);
                    if (data && data.fatal) {
                        setError(`${data.type}: ${data.details}`);
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else {
                            hls.destroy();
                        }
                    }
                });

                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.addEventListener('loadedmetadata', () => setDuration(video.duration));
            }
        };

        attach();

        const timeUpdater = () => {
            if (!video) return;
            setCurrentTime(video.currentTime || 0);
            setDuration(video.duration || 0);
        };

        const iv = setInterval(timeUpdater, 500);

        return () => {
            clearInterval(iv);
            if (hls) hls.destroy();
            if (video) video._hls = null;
        };
    }, [url]);

    const selectQuality = (index) => {
        const video = videoRef.current;
        if (!video) return;
        const inst = video && video._hls;
        if (!inst) return;

        if (index === -1) {
            inst.currentLevel = -1; 
            setSelectedLevel(-1);
        } else {
            inst.currentLevel = index;
            setSelectedLevel(index);
        }
    };

    const jumpToLive = () => {
        const video = videoRef.current;
        if (!video) return;
        const inst = video._hls;
        if (inst && inst.liveSyncPosition) {
            video.currentTime = inst.liveSyncPosition;
        } else {
            video.currentTime = video.duration;
        }
        video.play().catch(() => {});
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {levels.length > 0 && (
                <select
                    value={selectedLevel}
                    onChange={(e) => selectQuality(parseInt(e.target.value))}
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 10,
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        border: 'none',
                        padding: '5px',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}
                >
                    <option value={-1}>Auto</option>
                    {levels.map((l, idx) => (
                        <option key={idx} value={idx}>
                            {l.height ? `${l.height}p` : l.name || `${Math.round((l.bitrate||0)/1000)}kbps`}
                        </option>
                    ))}
                </select>
            )}
            <div style={{ marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div><strong>Status:</strong> {status} {error && <span style={{ color: 'red' }}> — {error}</span>}</div>
                <div><strong>Time:</strong> {Math.floor(currentTime)} / {isFinite(duration) ? Math.floor(duration) : 'LIVE'}</div>
                {isLive && <button onClick={jumpToLive}>Jump to Live</button>}
            </div>
            <video ref={videoRef} crossOrigin="anonymous" controls autoPlay playsInline style={{ width: '100%', maxWidth: 800 }} />
        </div>
    );
}

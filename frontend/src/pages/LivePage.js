import React, { useState } from "react";
import LivePlayer from "../features/components/LivePlayer";

export default function LivePage() {
    const base = process.env.REACT_APP_STREAM_URL || "http://localhost:8081/hls";
    const defaultUrl = `${base}/stream/index.m3u8`;
    const [url, setUrl] = useState(defaultUrl);
    const [key, setKey] = useState(0); // to force re-render

    const reloadPlayer = () => setKey(k => k + 1);

    return (
        <div>
            <h1>Live</h1>
            <p>Stream URL: <code>{url}</code></p>
            <p>OBS RTMP URL: <code>rtmp://localhost:1935/stream</code> and Stream Key: <code>stream</code></p>
            <p>Note: Start streaming in OBS to see quality options.</p>
            <div style={{ margin: '1rem 0' }}>
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} style={{ width: 400 }} />
                <button onClick={reloadPlayer} style={{ marginLeft: 10 }}>Reload Player</button>
            </div>
            <LivePlayer key={key} url={url} />
        </div>
    );
}

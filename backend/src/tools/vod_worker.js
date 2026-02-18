import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import { createVideo } from '../db/video.repository.js';

const exec = promisify(_exec);

const recordingsDir = path.resolve('uploads', 'recordings');
const videosDir = path.resolve('uploads', 'videos');
const hlsRoot = path.resolve('uploads', 'hls');

const ensureDir = (p) => {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

ensureDir(recordingsDir);
ensureDir(videosDir);
ensureDir(hlsRoot);

const isRecordingFile = (name) => {
    const lower = name.toLowerCase();
    return lower.endsWith('.flv') || lower.endsWith('.mp4');
};

const processFile = async (file) => {
    const src = path.join(recordingsDir, file);
    const base = path.basename(file, path.extname(file));
    const processingFlag = `${src}.processing`;

    try {
        // mark processing
        fs.renameSync(src, processingFlag);
        const tmpInput = processingFlag;

        const outMp4 = path.join(videosDir, `${base}.mp4`);
        const outHlsDir = path.join(hlsRoot, base);
        ensureDir(outHlsDir);

        console.log(`Processing ${file} -> ${outMp4} and HLS at ${outHlsDir}`);

        // 1) transcode to mp4 (re-encode for compatibility)
        const cmdMp4 = `ffmpeg -y -i "${tmpInput}" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 128k "${outMp4}"`;
        console.log('Running:', cmdMp4);
        await exec(cmdMp4);

        // 2) generate HLS (single quality, VOD)
        const outMaster = path.join(outHlsDir, 'master.m3u8');
        const cmdHls = `ffmpeg -y -i "${outMp4}" -c:v copy -c:a copy -hls_time 6 -hls_playlist_type vod -hls_segment_filename "${path.join(outHlsDir, '%03d.ts')}" "${outMaster}"`;
        console.log('Running:', cmdHls);
        await exec(cmdHls);

        // write metadata file for later DB import
        const meta = {
            source: file,
            mp4: `/uploads/videos/${base}.mp4`,
            hls: `/uploads/hls/${base}/master.m3u8`,
            processed_at: new Date().toISOString()
        };
        fs.writeFileSync(path.join(videosDir, `${base}.json`), JSON.stringify(meta, null, 2));

        // Attempt to create DB record if stream metadata exists
        try {
            const streamsMetaPath = path.join(recordingsDir, '..', 'streams', `${base}.json`);
            if (fs.existsSync(streamsMetaPath)) {
                const streamMeta = JSON.parse(fs.readFileSync(streamsMetaPath, 'utf8'));

                const userId = streamMeta.user_id || streamMeta.params?.user_id || null;
                const title = streamMeta.params?.title || `VOD - ${base}`;
                const description = streamMeta.params?.description || '';

                if (userId) {
                    const stats = fs.statSync(outMp4);
                    const video = await createVideo({
                        userId: parseInt(userId, 10),
                        title,
                        description,
                        videoUrl: meta.mp4,
                        thumbnailUrl: null,
                        duration: null,
                        fileSize: stats.size,
                        mimeType: 'video/mp4'
                    });

                    console.log('Created video DB record:', video.video_id);
                } else {
                    console.log('No user_id in stream metadata, skipping DB create for', base);
                }
            } else {
                console.log('No stream metadata file found for', base);
            }
        } catch (err) {
            console.error('Failed to create DB record for', base, err);
        }

        // rename processing flag to done (remove .processing)
        const donePath = path.join(recordingsDir, `${base}.done`);
        fs.unlinkSync(processingFlag);
        fs.writeFileSync(donePath, JSON.stringify({ processed_at: new Date().toISOString() }));

        console.log('Processed', file);
    } catch (err) {
        console.error('Failed processing', file, err);
        // attempt to cleanup processing flag
        try { if (fs.existsSync(processingFlag)) fs.renameSync(processingFlag, src); } catch(e){}
    }
};

const scanAndProcess = async () => {
    try {
        const files = fs.readdirSync(recordingsDir);
        for (const f of files) {
            if (!isRecordingFile(f)) continue;
            // skip if .processing or .done exists
            const src = path.join(recordingsDir, f);
            const processingFlag = `${src}.processing`;
            const doneFlag = path.join(recordingsDir, `${path.basename(f, path.extname(f))}.done`);
            if (fs.existsSync(processingFlag) || fs.existsSync(doneFlag)) continue;
            // process
            // Use a detached worker to avoid blocking multiple files sequentially
            await processFile(f);
        }
    } catch (err) {
        console.error('scan error', err);
    }
};

const POLL_INTERVAL = parseInt(process.env.VOD_POLL_INTERVAL || '10000', 10);

console.log('VOD worker started. Watching', recordingsDir);
setInterval(scanAndProcess, POLL_INTERVAL);
// run immediately on start
scanAndProcess();

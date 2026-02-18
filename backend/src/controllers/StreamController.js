import fs from 'fs';
import path from 'path';

const streamsDir = path.resolve('uploads', 'streams');

const ensureStreamsDir = () => {
    if (!fs.existsSync(streamsDir)) {
        fs.mkdirSync(streamsDir, { recursive: true });
    }
};

const parseArgsString = (argsString) => {
    try {
        const params = {};
        const sp = new URLSearchParams(argsString.replace(/^\?/, ''));
        for (const [k, v] of sp.entries()) params[k] = v;
        return params;
    } catch (e) {
        return {};
    }
};

const extractFromName = (name) => {
    if (!name) return {};
    const m = name.match(/^([0-9]+)[:\-_].*$/);
    if (m) return { user_id: m[1] };
    const m2 = name.match(/^user(?:_)?([0-9]+)_?.*$/i);
    if (m2) return { user_id: m2[1] };
    return {};
};

export const onPublish = async (req, res) => {
    try {
        ensureStreamsDir();

        const payload = Object.assign({}, req.query || {}, req.body || {});
        if (payload.args && typeof payload.args === 'string') {
            const parsed = parseArgsString(payload.args);
            Object.assign(payload, parsed);
        }

        const name = payload.name || payload.stream || 'unknown';
        const fromName = extractFromName(name);
        const userId = payload.user_id || payload.arg_user_id || fromName.user_id || null;
        const title = payload.title || payload.stream_title || `Live - ${name}`;
        const description = payload.description || '';

        const filePath = path.join(streamsDir, `${name}.json`);
        const record = {
            name,
            user_id: userId ? String(userId) : null,
            title,
            description,
            started_at: new Date().toISOString(),
            params: payload
        };

        fs.writeFileSync(filePath, JSON.stringify(record, null, 2));

        console.log('Stream started:', name, 'user_id=', userId);
        res.status(200).send('OK');
    } catch (err) {
        console.error('onPublish error:', err);
        res.status(500).send('ERROR');
    }
};

export const onPublishDone = async (req, res) => {
    try {
        ensureStreamsDir();

        const payload = Object.assign({}, req.query || {}, req.body || {});
        if (payload.args && typeof payload.args === 'string') {
            const parsed = parseArgsString(payload.args);
            Object.assign(payload, parsed);
        }

        const name = payload.name || payload.stream || 'unknown';
        const filePath = path.join(streamsDir, `${name}.json`);

        let record = { name, params: payload, started_at: null };
        if (fs.existsSync(filePath)) {
            try {
                record = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (e) {
                
            }
        }

        record.ended_at = new Date().toISOString();

        fs.writeFileSync(filePath, JSON.stringify(record, null, 2));

        console.log('Stream ended:', name);
        res.status(200).send('OK');
    } catch (err) {
        console.error('onPublishDone error:', err);
        res.status(500).send('ERROR');
    }
};

export default { onPublish, onPublishDone };

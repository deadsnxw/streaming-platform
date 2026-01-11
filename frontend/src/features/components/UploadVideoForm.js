import React, { useState } from 'react';
import { fetchAPI } from '../../services/api';

const UploadVideoForm = ({ onUploadSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file || !title) {
            setError('Будь ласка, виберіть файл та введіть заголовок');
            return;
        }

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        formData.append('description', description);

        setLoading(true);
        setError(null);

        try {
            const data = await fetchAPI('/videos/upload', {
                method: 'POST',
                body: formData,
            });

            onUploadSuccess(data.video);
            setTitle('');
            setDescription('');
            setFile(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <h2>Завантажити відео</h2>
            <input
                type="text"
                placeholder="Заголовок"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ display: 'block', marginBottom: '10px', width: '300px' }}
                required
            />
            <textarea
                placeholder="Опис"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ display: 'block', marginBottom: '10px', width: '300px', height: '80px' }}
            />
            <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'block', marginBottom: '10px' }}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Завантаження...' : 'Завантажити'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};

export default UploadVideoForm;
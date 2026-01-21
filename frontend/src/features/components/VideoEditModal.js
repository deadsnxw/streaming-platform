import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../../services/api';

const VideoEditModal = ({ videoId, video, onClose, onUpdate, onDelete }) => {
    const [title, setTitle] = useState(video?.title || '');
    const [description, setDescription] = useState(video?.description || '');
    const [isPublic, setIsPublic] = useState(video?.is_public !== false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (video) {
            setTitle(video.title || '');
            setDescription(video.description || '');
            setIsPublic(video.is_public !== false);
        }
    }, [video]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const updated = await fetchAPI(`/videos/${videoId}`, {
                method: 'PUT',
                body: {
                    title,
                    description,
                    isPublic: isPublic
                }
            });

            if (onUpdate) {
                onUpdate(updated.video);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Не вдалося оновити відео');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Ви впевнені, що хочете видалити це відео? Цю дію неможливо скасувати.')) {
            return;
        }

        setLoading(true);
        try {
            await fetchAPI(`/videos/${videoId}`, {
                method: 'DELETE'
            });

            if (onDelete) {
                onDelete(videoId);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Не вдалося видалити відео');
            setLoading(false);
        }
    };

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
                zIndex: 2000,
            }}
            onClick={onClose}
        >
            <div 
                style={{ 
                    position: 'relative', 
                    width: '90%', 
                    maxWidth: '600px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '20px'
                }} 
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        color: '#666',
                        cursor: 'pointer',
                    }}
                >
                    &times;
                </button>

                <h2 style={{ marginTop: 0 }}>Редагувати відео</h2>

                {error && (
                    <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Заголовок:
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ 
                                width: '100%', 
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                            placeholder="Введіть заголовок відео"
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Опис:
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                minHeight: '100px',
                                fontSize: '14px',
                                resize: 'vertical'
                            }}
                            placeholder="Опишіть ваше відео (опціонально)"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            <span>Публічне відео</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Видалити
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#ccc',
                                color: '#000',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: loading ? '#ccc' : '#6441A5',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {loading ? 'Збереження...' : 'Зберегти'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VideoEditModal;

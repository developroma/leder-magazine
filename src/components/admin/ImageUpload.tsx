'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiLink } from 'react-icons/fi';
import styles from './ImageUpload.module.scss';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
}

export default function ImageUpload({ value, onChange, placeholder = 'Додати зображення' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }

            const { url } = await res.json();
            onChange(url);
        } catch (error) {
            console.error('Upload error:', error);
            alert(error instanceof Error ? error.message : 'Помилка завантаження');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            setShowUrlInput(false);
            setUrlInput('');
        }
    };

    const handleRemove = () => {
        onChange('');
    };

    if (value) {
        return (
            <div className={styles.preview}>
                <Image
                    src={value}
                    alt="Preview"
                    fill
                    style={{ objectFit: 'cover' }}
                />
                <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={handleRemove}
                >
                    <FiX size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className={styles.upload}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className={styles.fileInput}
                id="image-upload"
            />

            {showUrlInput ? (
                <div className={styles.urlInput}>
                    <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://..."
                        autoFocus
                    />
                    <button type="button" onClick={handleUrlSubmit}>OK</button>
                    <button type="button" onClick={() => setShowUrlInput(false)}>
                        <FiX size={16} />
                    </button>
                </div>
            ) : (
                <div className={styles.buttons}>
                    <label htmlFor="image-upload" className={styles.uploadBtn}>
                        {uploading ? (
                            <span className={styles.spinner} />
                        ) : (
                            <>
                                <FiUpload size={20} />
                                <span>{placeholder}</span>
                            </>
                        )}
                    </label>
                    <button
                        type="button"
                        className={styles.urlBtn}
                        onClick={() => setShowUrlInput(true)}
                    >
                        <FiLink size={16} />
                        <span>URL</span>
                    </button>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import styles from './page.module.scss';

interface SiteSettings {
    heroImage: string;
    heroImageAlt: string;
}

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=1920';

export default function HeroSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>({
        heroImage: DEFAULT_HERO,
        heroImageAlt: 'Leather craftsmanship',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Load current settings from localStorage (or could be API)
        const saved = localStorage.getItem('siteSettings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSettings(s => ({ ...s, ...parsed }));
            } catch (e) {
                console.error('Failed to parse settings');
            }
        }
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save to localStorage for now (could be API in production)
            localStorage.setItem('siteSettings', JSON.stringify(settings));
            toast.success('Налаштування збережено!');
        } catch (error) {
            toast.error('Помилка збереження');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setSettings({
            heroImage: DEFAULT_HERO,
            heroImageAlt: 'Leather craftsmanship',
        });
        localStorage.removeItem('siteSettings');
        toast.success('Скинуто до стандартних');
    };

    return (
        <div className={styles.settings}>
            <div className={styles.header}>
                <Link href="/admin" className={styles.backBtn}>
                    <FiArrowLeft size={20} />
                    Назад
                </Link>
                <h1>Hero зображення</h1>
            </div>

            <div className={styles.content}>
                <div className={styles.preview}>
                    <h3>Поточне зображення</h3>
                    <div className={styles.previewImage}>
                        <Image
                            src={settings.heroImage}
                            alt={settings.heroImageAlt}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                        <div className={styles.previewOverlay}>
                            <span>Головна сторінка</span>
                        </div>
                    </div>
                </div>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label>Завантажити нове зображення</label>
                        <ImageUpload
                            value={settings.heroImage}
                            onChange={(url) => setSettings(s => ({ ...s, heroImage: url }))}
                            placeholder="Завантажити hero"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Або вставте URL</label>
                        <input
                            type="url"
                            value={settings.heroImage}
                            onChange={(e) => setSettings(s => ({ ...s, heroImage: e.target.value }))}
                            placeholder="https://..."
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Alt текст (для SEO)</label>
                        <input
                            type="text"
                            value={settings.heroImageAlt}
                            onChange={(e) => setSettings(s => ({ ...s, heroImageAlt: e.target.value }))}
                            placeholder="Опис зображення"
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className={styles.saveBtn}
                        >
                            <FiSave size={18} />
                            {saving ? 'Збереження...' : 'Зберегти'}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className={styles.resetBtn}
                        >
                            Скинути до стандартних
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

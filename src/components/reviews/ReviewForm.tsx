'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslations } from '@/lib/store/language';
import StarRating from './StarRating';
import styles from './ReviewForm.module.scss';

interface ReviewFormProps {
    productId: string;
    onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
    const t = useTranslations();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error(t.reviews?.selectRating || 'Оберіть оцінку');
            return;
        }

        if (!comment.trim()) {
            toast.error(t.reviews?.writeComment || 'Напишіть коментар');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, rating, comment }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit review');
            }

            toast.success(t.reviews?.reviewSubmitted || 'Відгук додано!');
            setRating(0);
            setComment('');
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || 'Помилка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h4>{t.reviews?.writeReview || 'Написати відгук'}</h4>

            <div className={styles.ratingField}>
                <label>{t.reviews?.yourRating || 'Ваша оцінка'}</label>
                <StarRating
                    rating={rating}
                    interactive
                    onChange={setRating}
                    size={28}
                />
            </div>

            <div className={styles.commentField}>
                <label>{t.reviews?.yourComment || 'Ваш коментар'}</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t.reviews?.commentPlaceholder || 'Поділіться вашими враженнями...'}
                    rows={4}
                />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? '...' : t.reviews?.submit || 'Надіслати'}
            </button>
        </form>
    );
}

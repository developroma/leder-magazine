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
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            setSubmitted(true);
            setRating(0);
            setComment('');
            onSuccess?.();

            // Allow writing another review/question after 3 seconds
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error: any) {
            toast.error(error.message || 'Помилка');
        } finally {
            setLoading(false);
        }
    };

    const isQuestion = rating === 0;

    if (submitted) {
        return (
            <div className={`${styles.form} ${styles.submitted}`}>
                <div className={styles.successMessage}>
                    ✓ {isQuestion
                        ? (t.reviews?.questionSubmitted || 'Питання надіслано!')
                        : (t.reviews?.reviewSubmitted || 'Відгук додано!')}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h4>{t.reviews?.writeReview || 'Написати відгук'}</h4>

            <div className={styles.ratingField}>
                <label>
                    {t.reviews?.yourRating || 'Ваша оцінка'}
                    <span className={styles.optional}> ({t.reviews?.optional || 'необов\'язково'})</span>
                </label>
                <StarRating
                    rating={rating}
                    interactive
                    onChange={setRating}
                    size={28}
                    allowHalf
                />
                {rating > 0 && (
                    <button
                        type="button"
                        className={styles.clearRating}
                        onClick={() => setRating(0)}
                    >
                        ✕
                    </button>
                )}
                {isQuestion && comment && (
                    <span className={styles.questionHint}>
                        {t.reviews?.willBeQuestion || 'Без оцінки = Питання'}
                    </span>
                )}
            </div>

            <div className={styles.commentField}>
                <label>{isQuestion
                    ? (t.reviews?.yourQuestion || 'Ваше питання')
                    : (t.reviews?.yourComment || 'Ваш коментар')
                }</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isQuestion
                        ? (t.reviews?.questionPlaceholder || 'Задайте питання про товар...')
                        : (t.reviews?.commentPlaceholder || 'Поділіться вашими враженнями...')
                    }
                    rows={4}
                    maxLength={1000}
                />
                <span className={styles.charCount}>{comment.length}/1000</span>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? '...' : t.reviews?.submit || 'Надіслати'}
            </button>
        </form>
    );
}

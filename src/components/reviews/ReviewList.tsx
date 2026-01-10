'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useTranslations } from '@/lib/store/language';
import type { Review } from '@/types';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import StarRating from './StarRating';
import styles from './ReviewList.module.scss';

interface ReviewListProps {
    productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
    const { user } = useAuthStore();
    const t = useTranslations();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            const data = await res.json();
            setReviews(data.reviews || []);
            setAverageRating(data.averageRating || 0);
            setTotalReviews(data.totalReviews || 0);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Check if user already reviewed
    const userHasReviewed = reviews.some(r => r.userId === user?._id);

    return (
        <div className={styles.reviewList}>
            <div className={styles.header}>
                <h3>{t.reviews?.reviews || 'Відгуки'}</h3>
                <div className={styles.summary}>
                    <StarRating rating={averageRating} size={24} showValue />
                    <span className={styles.count}>
                        ({totalReviews} {t.reviews?.reviewsCount || 'відгуків'})
                    </span>
                </div>
            </div>

            {user && !userHasReviewed && (
                <ReviewForm productId={productId} onSuccess={fetchReviews} />
            )}

            {!user && (
                <p className={styles.loginPrompt}>
                    {t.reviews?.loginToReview || 'Увійдіть щоб залишити відгук'}
                </p>
            )}

            {loading ? (
                <p className={styles.loading}>{t.common?.loading || 'Завантаження...'}</p>
            ) : reviews.length === 0 ? (
                <p className={styles.empty}>{t.reviews?.noReviews || 'Відгуків поки немає. Будьте першим!'}</p>
            ) : (
                <div className={styles.list}>
                    {reviews.map((review) => (
                        <ReviewItem
                            key={review._id}
                            review={review}
                            onRefresh={fetchReviews}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import { useState } from 'react';
import { FiHeart, FiMessageCircle, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/auth';
import { useTranslations } from '@/lib/store/language';
import type { Review } from '@/types';
import StarRating from './StarRating';
import styles from './ReviewItem.module.scss';

interface ReviewItemProps {
    review: Review;
    onRefresh: () => void;
    isReply?: boolean;
}

export default function ReviewItem({ review, onRefresh, isReply = false }: ReviewItemProps) {
    const { user } = useAuthStore();
    const t = useTranslations();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);

    // Optimistic UI state for likes
    const [optimisticLikes, setOptimisticLikes] = useState<string[] | null>(null);
    const currentLikes = optimisticLikes ?? review.likes ?? [];

    const isOwner = user?._id === review.userId;
    const isAdmin = user?.role === 'admin';
    const hasLiked = currentLikes.includes(user?._id || '');

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleLike = async () => {
        if (!user) {
            toast.error(t.reviews?.loginToLike || 'Увійдіть щоб поставити лайк');
            return;
        }

        // Optimistic update - instant UI response
        const newLikes = hasLiked
            ? currentLikes.filter(id => id !== user._id)
            : [...currentLikes, user._id];
        setOptimisticLikes(newLikes);

        try {
            await fetch(`/api/reviews/${review._id}/like`, { method: 'POST' });
            // Background refresh without blocking UI
            setTimeout(() => onRefresh(), 500);
        } catch (error) {
            // Revert on error
            setOptimisticLikes(null);
            toast.error('Помилка');
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/reviews/${review._id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: replyText }),
            });

            if (!res.ok) throw new Error('Failed');

            toast.success(t.reviews?.replyAdded || 'Відповідь додано');
            setReplyText('');
            setShowReplyForm(false);
            onRefresh();
        } catch (error) {
            toast.error('Помилка');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(t.reviews?.confirmDelete || 'Видалити відгук?')) return;

        try {
            await fetch(`/api/reviews/${review._id}`, { method: 'DELETE' });
            toast.success(t.reviews?.deleted || 'Видалено');
            onRefresh();
        } catch (error) {
            toast.error('Помилка');
        }
    };

    return (
        <div className={`${styles.review} ${isReply ? styles.reply : ''}`}>
            <div className={styles.header}>
                <div className={styles.user}>
                    <div className={styles.avatar}>
                        {review.user?.firstName?.[0] || review.user?.lastName?.[0] || '?'}
                    </div>
                    <div className={styles.info}>
                        <span className={styles.name}>
                            {review.user?.firstName || ''} {review.user?.lastName || ''}
                        </span>
                        <span className={styles.date}>{formatDate(review.createdAt)}</span>
                    </div>
                </div>
                {!isReply && review.rating > 0 && (
                    <StarRating rating={review.rating} size={16} />
                )}
            </div>

            <p className={styles.comment}>{review.comment}</p>

            <div className={styles.actions}>
                <button
                    className={`${styles.actionBtn} ${hasLiked ? styles.liked : ''}`}
                    onClick={handleLike}
                >
                    <FiHeart size={16} />
                    <span>{currentLikes.length}</span>
                </button>

                {user && !isReply && (
                    <button
                        className={styles.actionBtn}
                        onClick={() => setShowReplyForm(!showReplyForm)}
                    >
                        <FiMessageCircle size={16} />
                        <span>{t.reviews?.reply || 'Відповісти'}</span>
                    </button>
                )}

                {(isOwner || isAdmin) && (
                    <button className={styles.deleteBtn} onClick={handleDelete}>
                        <FiTrash2 size={16} />
                    </button>
                )}
            </div>

            {showReplyForm && (
                <form onSubmit={handleReply} className={styles.replyForm}>
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={t.reviews?.replyPlaceholder || 'Ваша відповідь...'}
                        rows={2}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? '...' : t.reviews?.send || 'Надіслати'}
                    </button>
                </form>
            )}

            {review.replies && review.replies.length > 0 && (
                <div className={styles.replies}>
                    {review.replies.map((reply) => (
                        <ReviewItem
                            key={reply._id}
                            review={reply}
                            onRefresh={onRefresh}
                            isReply
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiTrash2, FiMessageCircle, FiCheck, FiEye } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useTranslations } from '@/lib/store/language';
import type { Review } from '@/types';
import styles from './page.module.scss';

export default function AdminReviewsPage() {
    const t = useTranslations();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            setReviews(data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (reviewId: string) => {
        try {
            await fetch(`/api/reviews/${reviewId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'read' }),
            });
            toast.success(t.reviews?.markAsRead || 'Marked as read');
            fetchReviews();
        } catch (error) {
            toast.error('Error');
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm(t.reviews?.confirmDelete || 'Delete review?')) return;

        try {
            await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
            toast.success(t.reviews?.deleted || 'Deleted');
            fetchReviews();
        } catch (error) {
            toast.error('Error');
        }
    };

    const handleReply = async (reviewId: string) => {
        if (!replyText.trim()) return;

        try {
            await fetch(`/api/reviews/${reviewId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: replyText }),
            });
            toast.success(t.reviews?.replyAdded || 'Reply added');
            setReplyingTo(null);
            setReplyText('');
            fetchReviews();
        } catch (error) {
            toast.error('Error');
        }
    };

    const filteredReviews = reviews.filter(r => {
        if (filter === 'all') return true;
        return r.status === filter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return <span className={`${styles.badge} ${styles.new}`}>{t.reviews?.new || 'New'}</span>;
            case 'read':
                return <span className={`${styles.badge} ${styles.read}`}>{t.reviews?.read || 'Read'}</span>;
            case 'replied':
                return <span className={`${styles.badge} ${styles.replied}`}>{t.reviews?.replied || 'Replied'}</span>;
            default:
                return null;
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>{t.reviews?.reviews || 'Відгуки'}</h1>
                <div className={styles.filters}>
                    <button
                        className={filter === 'all' ? styles.active : ''}
                        onClick={() => setFilter('all')}
                    >
                        Всі ({reviews.length})
                    </button>
                    <button
                        className={filter === 'new' ? styles.active : ''}
                        onClick={() => setFilter('new')}
                    >
                        {t.reviews?.new || 'Нові'} ({reviews.filter(r => r.status === 'new').length})
                    </button>
                    <button
                        className={filter === 'read' ? styles.active : ''}
                        onClick={() => setFilter('read')}
                    >
                        {t.reviews?.read || 'Прочитані'} ({reviews.filter(r => r.status === 'read').length})
                    </button>
                    <button
                        className={filter === 'replied' ? styles.active : ''}
                        onClick={() => setFilter('replied')}
                    >
                        {t.reviews?.replied || 'З відповіддю'} ({reviews.filter(r => r.status === 'replied').length})
                    </button>
                </div>
            </div>

            {loading ? (
                <p className={styles.loading}>{t.common?.loading || 'Завантаження...'}</p>
            ) : filteredReviews.length === 0 ? (
                <p className={styles.empty}>{t.reviews?.noReviews || 'Відгуків немає'}</p>
            ) : (
                <div className={styles.list}>
                    {filteredReviews.map((review) => (
                        <div key={review._id} className={`${styles.review} ${review.status === 'new' ? styles.unread : ''}`}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.reviewInfo}>
                                    <span className={styles.author}>
                                        {review.user?.firstName} {review.user?.lastName}
                                    </span>
                                    <span className={styles.date}>{formatDate(review.createdAt)}</span>
                                    {getStatusBadge(review.status)}
                                </div>
                                <div className={styles.rating}>
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <FiStar
                                            key={i}
                                            size={16}
                                            fill={i < review.rating ? '#FFB800' : 'none'}
                                            color={i < review.rating ? '#FFB800' : '#ccc'}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={styles.product}>
                                <strong>Товар:</strong> {review.product?.title || 'Unknown'}
                            </div>

                            <p className={styles.comment}>{review.comment}</p>

                            {review.replies && review.replies.length > 0 && (
                                <div className={styles.replies}>
                                    {review.replies.map((reply: any) => (
                                        <div key={reply._id} className={styles.reply}>
                                            <span className={styles.replyAuthor}>
                                                {reply.user?.firstName} {reply.user?.lastName}
                                                {reply.user?.role === 'admin' && ' (Admin)'}
                                            </span>
                                            <p>{reply.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={styles.actions}>
                                {review.status === 'new' && (
                                    <button onClick={() => handleMarkAsRead(review._id)}>
                                        <FiEye size={16} />
                                        {t.reviews?.markAsRead || 'Прочитано'}
                                    </button>
                                )}
                                <button onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}>
                                    <FiMessageCircle size={16} />
                                    {t.reviews?.reply || 'Відповісти'}
                                </button>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(review._id)}>
                                    <FiTrash2 size={16} />
                                </button>
                            </div>

                            {replyingTo === review._id && (
                                <div className={styles.replyForm}>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={t.reviews?.replyPlaceholder || 'Ваша відповідь...'}
                                        rows={3}
                                    />
                                    <button onClick={() => handleReply(review._id)}>
                                        {t.reviews?.send || 'Надіслати'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

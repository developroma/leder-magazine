'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiTrash2, FiMessageCircle, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useTranslations } from '@/lib/store/language';
import styles from './page.module.scss';

interface Ticket {
    _id: string;
    email: string;
    name: string;
    subject: string;
    message: string;
    status: 'open' | 'replied' | 'closed';
    adminReply?: string;
    repliedAt?: string;
    createdAt: string;
}

export default function AdminSupportPage() {
    const t = useTranslations();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'replied' | 'closed'>('all');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/support');
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (ticketId: string) => {
        if (!replyText.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`/api/support/${ticketId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyText }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.emailSent ? 'Відповідь надіслано на email!' : 'Відповідь збережено');
                setReplyingTo(null);
                setReplyText('');
                fetchTickets();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error('Помилка при відправці');
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (ticketId: string, status: string) => {
        try {
            await fetch(`/api/support/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchTickets();
        } catch (error) {
            toast.error('Помилка');
        }
    };

    const handleDelete = async (ticketId: string) => {
        if (!confirm('Видалити запит?')) return;

        try {
            await fetch(`/api/support/${ticketId}`, { method: 'DELETE' });
            toast.success('Видалено');
            fetchTickets();
        } catch (error) {
            toast.error('Помилка');
        }
    };

    const filteredTickets = tickets.filter(t => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <FiClock className={styles.iconOpen} />;
            case 'replied': return <FiCheck className={styles.iconReplied} />;
            case 'closed': return <FiX className={styles.iconClosed} />;
            default: return null;
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1><FiMail size={24} /> Підтримка</h1>
                <div className={styles.filters}>
                    <button
                        className={filter === 'all' ? styles.active : ''}
                        onClick={() => setFilter('all')}
                    >
                        Всі ({tickets.length})
                    </button>
                    <button
                        className={filter === 'open' ? styles.active : ''}
                        onClick={() => setFilter('open')}
                    >
                        Нові ({tickets.filter(t => t.status === 'open').length})
                    </button>
                    <button
                        className={filter === 'replied' ? styles.active : ''}
                        onClick={() => setFilter('replied')}
                    >
                        З відповіддю ({tickets.filter(t => t.status === 'replied').length})
                    </button>
                    <button
                        className={filter === 'closed' ? styles.active : ''}
                        onClick={() => setFilter('closed')}
                    >
                        Закриті ({tickets.filter(t => t.status === 'closed').length})
                    </button>
                </div>
            </div>

            {loading ? (
                <p className={styles.loading}>Завантаження...</p>
            ) : filteredTickets.length === 0 ? (
                <p className={styles.empty}>Запитів немає</p>
            ) : (
                <div className={styles.list}>
                    {filteredTickets.map((ticket) => (
                        <div key={ticket._id} className={`${styles.ticket} ${ticket.status === 'open' ? styles.unread : ''}`}>
                            <div className={styles.ticketHeader}>
                                <div className={styles.ticketInfo}>
                                    <span className={styles.name}>{ticket.name}</span>
                                    <a href={`mailto:${ticket.email}`} className={styles.email}>{ticket.email}</a>
                                    <span className={styles.date}>{formatDate(ticket.createdAt)}</span>
                                </div>
                                <div className={styles.statusBadge} data-status={ticket.status}>
                                    {getStatusIcon(ticket.status)}
                                    {ticket.status === 'open' && 'Новий'}
                                    {ticket.status === 'replied' && 'Відповідь надіслана'}
                                    {ticket.status === 'closed' && 'Закрито'}
                                </div>
                            </div>

                            <h3 className={styles.subject}>{ticket.subject}</h3>
                            <p className={styles.message}>{ticket.message}</p>

                            {ticket.adminReply && (
                                <div className={styles.adminReply}>
                                    <strong>Ваша відповідь ({formatDate(ticket.repliedAt!)}):</strong>
                                    <p>{ticket.adminReply}</p>
                                </div>
                            )}

                            <div className={styles.actions}>
                                {ticket.status !== 'closed' && (
                                    <button onClick={() => setReplyingTo(replyingTo === ticket._id ? null : ticket._id)}>
                                        <FiMessageCircle size={16} />
                                        Відповісти
                                    </button>
                                )}
                                {ticket.status === 'replied' && (
                                    <button onClick={() => handleStatusChange(ticket._id, 'closed')}>
                                        <FiCheck size={16} />
                                        Закрити
                                    </button>
                                )}
                                <button className={styles.deleteBtn} onClick={() => handleDelete(ticket._id)}>
                                    <FiTrash2 size={16} />
                                </button>
                            </div>

                            {replyingTo === ticket._id && (
                                <div className={styles.replyForm}>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Ваша відповідь..."
                                        rows={4}
                                    />
                                    <button onClick={() => handleReply(ticket._id)} disabled={sending}>
                                        {sending ? 'Відправка...' : 'Надіслати на email'}
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

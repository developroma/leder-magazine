'use client';

import { useState } from 'react';
import { FiMail, FiUser, FiMessageSquare, FiSend } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import styles from './page.module.scss';

export default function ContactPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.subject || !form.message) {
            toast.error('Заповніть всі поля');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                toast.success('Повідомлення надіслано! Ми відповімо найближчим часом.');
                setForm({ name: '', email: '', subject: '', message: '' });
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            toast.error('Помилка при відправці');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.contact}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Зв'язатися з нами</h1>
                    <p>Маєте питання? Напишіть нам, і ми обов'язково відповімо!</p>
                </div>

                <div className={styles.content}>
                    <div className={styles.info}>
                        <h2>Контактна інформація</h2>
                        <div className={styles.infoItem}>
                            <FiMail size={20} />
                            <div>
                                <strong>Email</strong>
                                <span>support@leder.ua</span>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <FiMessageSquare size={20} />
                            <div>
                                <strong>Графік роботи</strong>
                                <span>Пн-Пт: 9:00 - 18:00</span>
                            </div>
                        </div>
                        <p className={styles.note}>
                            Зазвичай ми відповідаємо протягом 24 годин.
                        </p>
                    </div>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="name">
                                <FiUser size={16} />
                                Ваше ім'я *
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Введіть ваше ім'я"
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="email">
                                <FiMail size={16} />
                                Email *
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="subject">
                                <FiMessageSquare size={16} />
                                Тема *
                            </label>
                            <input
                                id="subject"
                                type="text"
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                placeholder="Щодо замовлення..."
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="message">Повідомлення *</label>
                            <textarea
                                id="message"
                                rows={5}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="Опишіть ваше питання або проблему..."
                            />
                        </div>

                        <button type="submit" disabled={loading} className={styles.submitBtn}>
                            {loading ? (
                                'Надсилаю...'
                            ) : (
                                <>
                                    <FiSend size={18} />
                                    Надіслати
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

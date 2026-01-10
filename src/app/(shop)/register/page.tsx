'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/auth';
import { useTranslations } from '@/lib/store/language';
import styles from '../login/auth.module.scss';

export default function RegisterPage() {
    const router = useRouter();
    const { setUser } = useAuthStore();
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            toast.error('Паролі не співпадають');
            return;
        }

        if (form.password.length < 6) {
            toast.error('Пароль має бути мінімум 6 символів');
            return;
        }

        if (!/[A-Za-z]/.test(form.password)) {
            toast.error('Пароль має містити хоча б одну літеру');
            return;
        }

        if (!/[0-9]/.test(form.password)) {
            toast.error('Пароль має містити хоча б одну цифру');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            setUser(data);
            toast.success('Реєстрація успішна!');
            router.push('/profile');
        } catch (error: any) {
            toast.error(error.message || 'Помилка реєстрації');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.auth}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1>{t.register.title}</h1>
                        <p>{t.register.subtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label>{t.register.firstName}</label>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    placeholder="Іван"
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>{t.register.lastName}</label>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    placeholder="Петренко"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label>{t.register.email}</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>{t.register.password}</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder={t.register.minPassword}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>{t.register.confirmPassword}</label>
                            <input
                                type="password"
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                placeholder={t.register.repeatPassword}
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? '...' : t.register.submit}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p>
                            {t.register.hasAccount}{' '}
                            <Link href="/login">{t.register.loginLink}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

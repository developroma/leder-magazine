'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/auth';
import { useTranslations } from '@/lib/store/language';
import styles from './auth.module.scss';

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useAuthStore();
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            setUser(data);
            toast.success('Ви успішно увійшли!');

            if (data.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/profile');
            }
        } catch (error: any) {
            toast.error(error.message || 'Помилка входу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.auth}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1>{t.login.title}</h1>
                        <p>{t.login.subtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.field}>
                            <label>{t.login.email}</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>{t.login.password}</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? '...' : t.login.submit}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p>
                            {t.login.noAccount}{' '}
                            <Link href="/register">{t.login.createAccount}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

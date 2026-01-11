'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPackage, FiShoppingCart, FiDollarSign, FiAlertTriangle, FiMail, FiImage } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';
import { useTranslations } from '@/lib/store/language';
import type { Order } from '@/types';
import styles from './page.module.scss';

interface DashboardStats {
    totalOrders: number;
    newOrders: number;
    revenue: number;
    lowStock: number;
    openSupport: number;
    totalProducts: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        newOrders: 0,
        revenue: 0,
        lowStock: 0,
        openSupport: 0,
        totalProducts: 0,
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations();

    const STATUS_LABELS: Record<string, string> = {
        new: t.admin.statusNew,
        received: t.admin.statusReceived,
        shipped: t.admin.statusShipped,
        delivered: t.admin.statusDelivered,
        cancelled: t.admin.statusCancelled,
    };

    useEffect(() => {
        // Single optimized request instead of multiple
        fetch('/api/admin/stats')
            .then((r) => r.json())
            .then((data) => {
                setStats(data.stats || {});
                setRecentOrders(data.recentOrders || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className={styles.loading}>{t.common.loading}</div>;
    }

    return (
        <div className={styles.dashboard}>
            <h1>{t.admin.dashboard}</h1>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <FiShoppingCart size={24} />
                    <div>
                        <span className={styles.statValue}>{stats.totalOrders}</span>
                        <span className={styles.statLabel}>{t.admin.total} {t.admin.orders.toLowerCase()}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <FiPackage size={24} />
                    <div>
                        <span className={styles.statValue}>{stats.newOrders}</span>
                        <span className={styles.statLabel}>{t.admin.newOrders}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <FiDollarSign size={24} />
                    <div>
                        <span className={styles.statValue}>{formatPrice(stats.revenue)}</span>
                        <span className={styles.statLabel}>{t.admin.totalRevenue}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <FiAlertTriangle size={24} />
                    <div>
                        <span className={styles.statValue}>{stats.lowStock}</span>
                        <span className={styles.statLabel}>{t.admin.lowStock}</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${stats.openSupport > 0 ? styles.highlight : ''}`}>
                    <FiMail size={24} />
                    <div>
                        <span className={styles.statValue}>{stats.openSupport}</span>
                        <span className={styles.statLabel}>Нових запитів</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2>{t.admin.recentOrders}</h2>
                {recentOrders.length === 0 ? (
                    <p className={styles.empty}>Немає замовлень</p>
                ) : (
                    <div className={styles.table}>
                        <div className={styles.tableHeader}>
                            <span>Замовлення</span>
                            <span>Клієнт</span>
                            <span>{t.admin.status}</span>
                            <span>Сума</span>
                        </div>
                        {recentOrders.map((order) => (
                            <Link
                                key={order._id}
                                href={`/admin/orders?id=${order._id}`}
                                className={styles.tableRow}
                            >
                                <span>#{order._id.slice(-6)}</span>
                                <span>{order.customer?.lastName} {order.customer?.firstName}</span>
                                <span className={`${styles.status} ${styles[order.status]}`}>
                                    {STATUS_LABELS[order.status] || order.status}
                                </span>
                                <span>{formatPrice(order.totalPrice)}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <h2>Налаштування сайту</h2>
                <div className={styles.settingsGrid}>
                    <Link href="/admin/settings/hero" className={styles.settingCard}>
                        <FiImage size={32} />
                        <span>Hero зображення</span>
                        <p>Змінити фото на головній сторінці</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

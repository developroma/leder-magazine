'use client';

import { useState, useEffect } from 'react';
import { FiPackage, FiShoppingCart, FiDollarSign, FiAlertTriangle, FiMail } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';
import { useTranslations } from '@/lib/store/language';
import type { Order, Product } from '@/types';
import styles from './page.module.scss';

export default function AdminDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [supportCount, setSupportCount] = useState(0);
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
        Promise.all([
            fetch('/api/orders').then((r) => r.json()),
            fetch('/api/products').then((r) => r.json()),
            fetch('/api/support').then((r) => r.json()).catch(() => []),
        ])
            .then(([ordersData, productsData, supportData]) => {
                setOrders(ordersData.orders || []);
                setProducts(productsData.products || []);
                const tickets = Array.isArray(supportData) ? supportData : [];
                setSupportCount(tickets.filter((t: any) => t.status === 'open').length);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const stats = {
        totalOrders: orders.length,
        newOrders: orders.filter((o) => o.status === 'new').length,
        revenue: orders
            .filter((o) => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.totalPrice, 0),
        lowStock: products.filter((p) =>
            p.variants.some((v) => v.stock > 0 && v.stock <= 3)
        ).length,
    };

    const recentOrders = orders.slice(0, 5);

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
                <div className={`${styles.statCard} ${supportCount > 0 ? styles.highlight : ''}`}>
                    <FiMail size={24} />
                    <div>
                        <span className={styles.statValue}>{supportCount}</span>
                        <span className={styles.statLabel}>Нових запитів</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2>{t.admin.recentOrders}</h2>
                {recentOrders.length === 0 ? (
                    <p className={styles.empty}>{t.admin.noData}</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t.admin.orderNumber}</th>
                                <th>{t.admin.client}</th>
                                <th>{t.admin.amount}</th>
                                <th>{t.admin.status}</th>
                                <th>{t.admin.date}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order.orderNumber}</td>
                                    <td>{order.customer.firstName} {order.customer.lastName}</td>
                                    <td>{formatPrice(order.totalPrice)}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[order.status]}`}>
                                            {STATUS_LABELS[order.status]}
                                        </span>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString('uk-UA')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

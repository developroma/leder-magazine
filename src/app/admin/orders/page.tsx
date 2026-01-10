'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useTranslations } from '@/lib/store/language';
import type { Order } from '@/types';
import styles from './page.module.scss';

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const t = useTranslations();

    const STATUS_OPTIONS = [
        { value: 'new', label: t.admin.statusNew },
        { value: 'received', label: t.admin.statusReceived },
        { value: 'shipped', label: t.admin.statusShipped },
        { value: 'delivered', label: t.admin.statusDelivered },
        { value: 'cancelled', label: t.admin.statusCancelled },
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Update failed');
            toast.success('Статус оновлено');
            fetchOrders();
            if (selectedOrder?._id === orderId) {
                setSelectedOrder((o) => o ? { ...o, status: newStatus as Order['status'] } : null);
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Помилка оновлення');
        }
    };

    const filteredOrders = statusFilter
        ? orders.filter((o) => o.status === statusFilter)
        : orders;

    if (loading) {
        return <div className={styles.loading}>{t.common.loading}</div>;
    }

    return (
        <div className={styles.orders}>
            <div className={styles.header}>
                <h1>{t.admin.orders}</h1>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.filter}
                >
                    <option value="">{t.admin.allStatuses}</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            {filteredOrders.length === 0 ? (
                <div className={styles.empty}>{t.admin.noData}</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t.admin.orderNumber}</th>
                                <th>{t.admin.client}</th>
                                <th>{t.admin.phone}</th>
                                <th>{t.admin.city}</th>
                                <th>{t.admin.amount}</th>
                                <th>{t.admin.status}</th>
                                <th>{t.admin.date}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order.orderNumber}</td>
                                    <td>{order.customer.firstName} {order.customer.lastName}</td>
                                    <td>{order.customer.phone}</td>
                                    <td>{order.shipping.city}</td>
                                    <td>{formatPrice(order.totalPrice)}</td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            className={`${styles.statusSelect} ${styles[order.status]}`}
                                        >
                                            {STATUS_OPTIONS.map((s) => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString('uk-UA')}</td>
                                    <td>
                                        <button
                                            className={styles.detailsBtn}
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            {t.admin.details}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder && (
                <>
                    <div className={styles.overlay} onClick={() => setSelectedOrder(null)} />
                    <div className={styles.modal}>
                        <h2>{t.admin.orderDetails} #{selectedOrder.orderNumber}</h2>

                        <div className={styles.modalSection}>
                            <h3>{t.admin.customer}</h3>
                            <p>{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                            <p>{selectedOrder.customer.email}</p>
                            <p>{selectedOrder.customer.phone}</p>
                        </div>

                        <div className={styles.modalSection}>
                            <h3>{t.admin.delivery}</h3>
                            <p>{selectedOrder.shipping.city}</p>
                            <p>{selectedOrder.shipping.warehouse}</p>
                        </div>

                        <div className={styles.modalSection}>
                            <h3>{t.admin.items}</h3>
                            <ul className={styles.itemsList}>
                                {selectedOrder.items.map((item, i) => (
                                    <li key={i}>
                                        <span>{item.title} ({item.color}) × {item.quantity}</span>
                                        <span>{formatPrice(item.price * item.quantity)}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.total}>
                                <span>{t.admin.total}:</span>
                                <span>{formatPrice(selectedOrder.totalPrice)}</span>
                            </div>
                        </div>

                        <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>
                            {t.admin.close}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

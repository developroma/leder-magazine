'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheck, FiPackage } from 'react-icons/fi';
import type { Order } from '@/types';
import styles from './page.module.scss';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (orderId) {
            fetch(`/api/orders/${orderId}`)
                .then((res) => res.json())
                .then(setOrder)
                .catch(console.error);
        }
    }, [orderId]);

    return (
        <div className={styles.success}>
            <div className={styles.container}>
                <div className={styles.icon}>
                    <FiCheck size={48} />
                </div>
                <h1>Дякуємо за замовлення!</h1>
                <p className={styles.subtitle}>
                    Ваше замовлення успішно оформлено та незабаром буде оброблено
                </p>

                {order && (
                    <div className={styles.orderInfo}>
                        <div className={styles.orderNumber}>
                            <FiPackage size={24} />
                            <div>
                                <span>Номер замовлення</span>
                                <strong>{order.orderNumber}</strong>
                            </div>
                        </div>
                        <p>
                            Ми надіслали підтвердження на <strong>{order.customer.email}</strong>
                        </p>
                    </div>
                )}

                <div className={styles.steps}>
                    <h3>Що далі?</h3>
                    <ul>
                        <li>Очікуйте дзвінка від нашого менеджера для підтвердження</li>
                        <li>Ми відправимо ваше замовлення Новою Поштою</li>
                        <li>Ви отримаєте SMS з номером ТТН</li>
                    </ul>
                </div>

                <div className={styles.actions}>
                    <Link href="/catalog" className={styles.primaryBtn}>
                        Продовжити покупки
                    </Link>
                    <Link href="/" className={styles.secondaryBtn}>
                        На головну
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className={styles.success}><div className={styles.container}>Завантаження...</div></div>}>
            <SuccessContent />
        </Suspense>
    );
}


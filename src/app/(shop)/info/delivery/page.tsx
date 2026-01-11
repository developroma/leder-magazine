'use client';

import { useTranslations, useLanguageStore } from '@/lib/store/language';
import styles from '../page.module.scss';

const DELIVERY_CONTENT = {
    uk: {
        title: 'Доставка та оплата',
        deliveryTitle: 'Доставка',
        novaPoshta: 'Нова Пошта',
        novaPoshtaDesc: 'Доставка до відділення або поштомату по всій Україні',
        deliveryTime: 'Термін доставки: 1-3 робочі дні',
        deliveryCost: 'Вартість: за тарифами перевізника',
        freeDelivery: 'Безкоштовна доставка при замовленні від 3000 грн',
        paymentTitle: 'Оплата',
        cod: 'Накладений платіж',
        codDesc: 'Оплата при отриманні на пошті',
        online: 'Онлайн оплата',
        onlineDesc: 'Оплата карткою Visa/Mastercard через Stripe',
    },
    en: {
        title: 'Delivery & Payment',
        deliveryTitle: 'Delivery',
        novaPoshta: 'Nova Poshta',
        novaPoshtaDesc: 'Delivery to any branch or parcel locker across Ukraine',
        deliveryTime: 'Delivery time: 1-3 business days',
        deliveryCost: 'Cost: according to carrier rates',
        freeDelivery: 'Free delivery for orders over 3000 UAH',
        paymentTitle: 'Payment',
        cod: 'Cash on Delivery',
        codDesc: 'Pay when you receive your order',
        online: 'Online Payment',
        onlineDesc: 'Pay with Visa/Mastercard via Stripe',
    },
    pl: {
        title: 'Dostawa i płatność',
        deliveryTitle: 'Dostawa',
        novaPoshta: 'Nova Poshta',
        novaPoshtaDesc: 'Dostawa do oddziału lub paczkomatu na terenie całej Ukrainy',
        deliveryTime: 'Czas dostawy: 1-3 dni robocze',
        deliveryCost: 'Koszt: według taryf przewoźnika',
        freeDelivery: 'Darmowa dostawa przy zamówieniach powyżej 3000 UAH',
        paymentTitle: 'Płatność',
        cod: 'Płatność przy odbiorze',
        codDesc: 'Zapłać przy odbiorze paczki',
        online: 'Płatność online',
        onlineDesc: 'Płatność kartą Visa/Mastercard przez Stripe',
    },
};

export default function DeliveryPage() {
    const { language } = useLanguageStore();
    const content = DELIVERY_CONTENT[language] || DELIVERY_CONTENT.uk;

    return (
        <div className={styles.info}>
            <div className={styles.container}>
                <h1>{content.title}</h1>

                <section className={styles.section}>
                    <h2>{content.deliveryTitle}</h2>
                    <div className={styles.card}>
                        <h3>{content.novaPoshta}</h3>
                        <p>{content.novaPoshtaDesc}</p>
                        <ul>
                            <li>{content.deliveryTime}</li>
                            <li>{content.deliveryCost}</li>
                            <li>{content.freeDelivery}</li>
                        </ul>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>{content.paymentTitle}</h2>
                    <div className={styles.paymentOptions}>
                        <div className={styles.card}>
                            <h3>{content.cod}</h3>
                            <p>{content.codDesc}</p>
                        </div>
                        <div className={styles.card}>
                            <h3>{content.online}</h3>
                            <p>{content.onlineDesc}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

import styles from '../page.module.scss';

export default function DeliveryPage() {
    return (
        <div className={styles.info}>
            <div className={styles.container}>
                <h1>Доставка та оплата</h1>

                <section className={styles.section}>
                    <h2>Доставка</h2>
                    <div className={styles.card}>
                        <h3>Нова Пошта</h3>
                        <p>Доставка до відділення або поштомату по всій Україні</p>
                        <ul>
                            <li>Термін доставки: 1-3 робочі дні</li>
                            <li>Вартість: за тарифами перевізника</li>
                            <li>Безкоштовна доставка при замовленні від 3000 грн</li>
                        </ul>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>Оплата</h2>
                    <div className={styles.paymentOptions}>
                        <div className={styles.card}>
                            <h3>Накладений платіж</h3>
                            <p>Оплата при отриманні на пошті</p>
                        </div>
                        <div className={styles.card}>
                            <h3>Онлайн оплата</h3>
                            <p>Оплата карткою Visa/Mastercard через Stripe</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

import styles from '../page.module.scss';

export default function ContactsPage() {
    return (
        <div className={styles.info}>
            <div className={styles.container}>
                <h1>Контакти</h1>

                <section className={styles.section}>
                    <div className={styles.contactsGrid}>
                        <div className={styles.contactCard}>
                            <h3>Телефон</h3>
                            <a href="tel:+380501234567">+38 (050) 123-45-67</a>
                            <p>Пн-Пт: 9:00 - 18:00</p>
                        </div>
                        <div className={styles.contactCard}>
                            <h3>Email</h3>
                            <a href="mailto:info@leder.ua">info@leder.ua</a>
                            <p>Відповідаємо протягом 24 годин</p>
                        </div>
                        <div className={styles.contactCard}>
                            <h3>Instagram</h3>
                            <a href="https://instagram.com/leder.ua" target="_blank" rel="noopener">@leder.ua</a>
                            <p>Слідкуйте за новинками</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

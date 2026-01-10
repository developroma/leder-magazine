import styles from '../page.module.scss';

export default function ReturnsPage() {
    return (
        <div className={styles.info}>
            <div className={styles.container}>
                <h1>Повернення та обмін</h1>

                <section className={styles.section}>
                    <h2>Умови повернення</h2>
                    <p>
                        Ви можете повернути або обміняти товар протягом 14 днів з моменту
                        отримання, якщо він не був у використанні та збережено товарний вигляд.
                    </p>

                    <div className={styles.steps}>
                        <h3>Як повернути товар:</h3>
                        <ol>
                            <li>Зв'яжіться з нами за телефоном або email</li>
                            <li>Опишіть причину повернення</li>
                            <li>Отримайте інструкції для відправки</li>
                            <li>Надішліть товар Новою Поштою</li>
                            <li>Після перевірки отримаєте кошти або новий товар</li>
                        </ol>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>Важливо</h2>
                    <ul>
                        <li>Товар повинен бути в оригінальній упаковці</li>
                        <li>Без слідів використання</li>
                        <li>З усіма бірками та документами</li>
                        <li>Доставка за рахунок покупця</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

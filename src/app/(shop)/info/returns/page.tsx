'use client';

import { useLanguageStore } from '@/lib/store/language';
import styles from '../page.module.scss';

const RETURNS_CONTENT = {
    uk: {
        title: 'Повернення та обмін',
        conditionsTitle: 'Умови повернення',
        conditionsText: 'Ви можете повернути або обміняти товар протягом 14 днів з моменту отримання, якщо він не був у використанні та збережено товарний вигляд.',
        howToTitle: 'Як повернути товар:',
        step1: "Зв'яжіться з нами за телефоном або email",
        step2: 'Опишіть причину повернення',
        step3: 'Отримайте інструкції для відправки',
        step4: 'Надішліть товар Новою Поштою',
        step5: 'Після перевірки отримаєте кошти або новий товар',
        importantTitle: 'Важливо',
        important1: 'Товар повинен бути в оригінальній упаковці',
        important2: 'Без слідів використання',
        important3: 'З усіма бірками та документами',
        important4: 'Доставка за рахунок покупця',
    },
    en: {
        title: 'Returns & Exchanges',
        conditionsTitle: 'Return Policy',
        conditionsText: 'You can return or exchange an item within 14 days of receipt, provided it has not been used and the original condition is preserved.',
        howToTitle: 'How to return an item:',
        step1: 'Contact us by phone or email',
        step2: 'Describe the reason for the return',
        step3: 'Receive shipping instructions',
        step4: 'Send the item via Nova Poshta',
        step5: 'After inspection, receive a refund or new item',
        importantTitle: 'Important',
        important1: 'Item must be in original packaging',
        important2: 'No signs of use',
        important3: 'All tags and documentation included',
        important4: 'Shipping costs are covered by the buyer',
    },
    pl: {
        title: 'Zwroty i wymiana',
        conditionsTitle: 'Warunki zwrotu',
        conditionsText: 'Możesz zwrócić lub wymienić towar w ciągu 14 dni od otrzymania, jeśli nie był używany i zachował oryginalny wygląd.',
        howToTitle: 'Jak zwrócić towar:',
        step1: 'Skontaktuj się z nami telefonicznie lub mailowo',
        step2: 'Opisz powód zwrotu',
        step3: 'Otrzymaj instrukcje wysyłki',
        step4: 'Wyślij towar przez Nova Poshta',
        step5: 'Po weryfikacji otrzymasz zwrot pieniędzy lub nowy towar',
        importantTitle: 'Ważne',
        important1: 'Towar musi być w oryginalnym opakowaniu',
        important2: 'Bez śladów użytkowania',
        important3: 'Ze wszystkimi metkami i dokumentami',
        important4: 'Koszty wysyłki pokrywa kupujący',
    },
};

export default function ReturnsPage() {
    const { language } = useLanguageStore();
    const content = RETURNS_CONTENT[language] || RETURNS_CONTENT.uk;

    return (
        <div className={styles.info}>
            <div className={styles.container}>
                <h1>{content.title}</h1>

                <section className={styles.section}>
                    <h2>{content.conditionsTitle}</h2>
                    <p>{content.conditionsText}</p>

                    <div className={styles.steps}>
                        <h3>{content.howToTitle}</h3>
                        <ol>
                            <li>{content.step1}</li>
                            <li>{content.step2}</li>
                            <li>{content.step3}</li>
                            <li>{content.step4}</li>
                            <li>{content.step5}</li>
                        </ol>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>{content.importantTitle}</h2>
                    <ul>
                        <li>{content.important1}</li>
                        <li>{content.important2}</li>
                        <li>{content.important3}</li>
                        <li>{content.important4}</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

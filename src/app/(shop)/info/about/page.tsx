'use client';

import { useTranslations } from '@/lib/store/language';
import styles from '../page.module.scss';

export default function AboutPage() {
    const t = useTranslations();

    const content = {
        uk: {
            story1: 'Leder — це українська майстерня, яка спеціалізується на виготовленні шкіряних виробів ручної роботи. Ми створюємо аксесуари, які поєднують традиційну майстерність з сучасним дизайном.',
            story2: 'Кожен виріб створюється вручну майстрами з багаторічним досвідом. Ми використовуємо тільки натуральну шкіру найвищої якості — італійську та українську телячу шкіру рослинного дублення.',
            qualityDesc: 'Використовуємо тільки найкращі матеріали та фурнітуру',
            craftsmanshipDesc: 'Кожен виріб створюється вручну з увагою до деталей',
            durability: 'Довговічність',
            durabilityDesc: 'Наші вироби служать роками, стаючи тільки кращими з часом',
            support: 'Підтримка',
            supportDesc: "Ми завжди на зв'язку та готові допомогти",
        },
        en: {
            story1: 'Leder is a Ukrainian workshop specializing in handmade leather goods. We create accessories that combine traditional craftsmanship with modern design.',
            story2: 'Each product is handcrafted by masters with years of experience. We use only the highest quality natural leather — Italian and Ukrainian vegetable-tanned calfskin.',
            qualityDesc: 'We use only the best materials and hardware',
            craftsmanshipDesc: 'Each product is handcrafted with attention to detail',
            durability: 'Durability',
            durabilityDesc: 'Our products last for years, only getting better with time',
            support: 'Support',
            supportDesc: 'We are always in touch and ready to help',
        },
        pl: {
            story1: 'Leder to ukraiński warsztat specjalizujący się w ręcznie robionych wyrobach skórzanych. Tworzymy akcesoria, które łączą tradycyjne rzemiosło z nowoczesnym designem.',
            story2: 'Każdy produkt jest ręcznie wykonany przez mistrzów z wieloletnim doświadczeniem. Używamy tylko najwyższej jakości naturalnej skóry — włoskiej i ukraińskiej cielęcej skóry garbowanej roślinnie.',
            qualityDesc: 'Używamy tylko najlepszych materiałów i okuć',
            craftsmanshipDesc: 'Każdy produkt jest ręcznie wykonany z dbałością o szczegóły',
            durability: 'Trwałość',
            durabilityDesc: 'Nasze produkty służą latami, stając się tylko lepsze z czasem',
            support: 'Wsparcie',
            supportDesc: 'Jesteśmy zawsze w kontakcie i gotowi pomóc',
        },
    };

    const lang = t.common.currency === 'грн' ? 'uk' : t.common.currency === 'UAH' && t.nav.about === 'About Us' ? 'en' : 'pl';
    const c = content[lang];

    return (
        <div className={styles.info}>
            <div className={styles.container}>
                <h1>{t.about.title}</h1>

                <section className={styles.section}>
                    <h2>{t.about.story}</h2>
                    <p>{c.story1}</p>
                    <p>{c.story2}</p>
                </section>

                <section className={styles.section}>
                    <h2>{t.about.values}</h2>
                    <ul className={styles.values}>
                        <li>
                            <strong>{t.about.quality}</strong>
                            <p>{c.qualityDesc}</p>
                        </li>
                        <li>
                            <strong>{t.about.craftsmanship}</strong>
                            <p>{c.craftsmanshipDesc}</p>
                        </li>
                        <li>
                            <strong>{c.durability}</strong>
                            <p>{c.durabilityDesc}</p>
                        </li>
                        <li>
                            <strong>{c.support}</strong>
                            <p>{c.supportDesc}</p>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

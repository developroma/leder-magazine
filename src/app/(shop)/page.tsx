'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiTruck, FiShield, FiHeart, FiAward, FiStar } from 'react-icons/fi';
import { useTranslations } from '@/lib/store/language';
import styles from './page.module.scss';

const FEATURED_CATEGORIES = [
    { key: 'bags', slug: 'bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600' },
    { key: 'wallets', slug: 'wallets', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600' },
    { key: 'belts', slug: 'belts', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600' },
    { key: 'accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=600' },
];

const REVIEWS_DATA = [
    { nameKey: 'review1Name', textKey: 'review1Text', rating: 5 },
    { nameKey: 'review2Name', textKey: 'review2Text', rating: 5 },
    { nameKey: 'review3Name', textKey: 'review3Text', rating: 5 },
];

export default function HomePage() {
    const t = useTranslations();
    const sectionsRef = useRef<HTMLElement[]>([]);

    const BENEFITS = [
        { icon: FiTruck, title: t.home.freeDelivery, desc: t.home.freeDeliveryDesc },
        { icon: FiShield, title: t.home.warranty, desc: t.home.warrantyDesc },
        { icon: FiHeart, title: t.home.handmade, desc: t.home.handmadeDesc },
        { icon: FiAward, title: t.home.premiumQuality, desc: t.home.premiumQualityDesc },
    ];

    const categoryNames: Record<string, string> = {
        bags: t.home.bags,
        wallets: t.home.wallets,
        belts: t.home.belts,
        accessories: t.home.accessories,
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.visible);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        sectionsRef.current.forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    const addToRefs = (el: HTMLElement | null) => {
        if (el && !sectionsRef.current.includes(el)) {
            sectionsRef.current.push(el);
        }
    };

    return (
        <>
            <section className={styles.hero}>
                <div className={styles.heroBackground}>
                    <Image
                        src="https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=1920"
                        alt="Leather craftsmanship"
                        fill
                        priority
                        style={{ objectFit: 'cover' }}
                        sizes="100vw"
                    />
                    <div className={styles.heroOverlay} />
                </div>
                <div className={styles.heroContent}>
                    <h1>{t.home.heroTitle}</h1>
                    <p>{t.home.heroSubtitle}</p>
                    <Link href="/catalog" className={styles.heroBtn}>
                        {t.home.viewCatalog}
                        <FiArrowRight />
                    </Link>
                </div>
                <div className={styles.scrollIndicator}>
                    <span></span>
                </div>
            </section>

            <section className={`${styles.benefits} ${styles.animateSection}`} ref={addToRefs}>
                <div className={styles.container}>
                    <div className={styles.benefitsGrid}>
                        {BENEFITS.map((b, i) => (
                            <div key={i} className={styles.benefitCard} style={{ animationDelay: `${i * 0.1}s` }}>
                                <b.icon size={32} />
                                <h3>{b.title}</h3>
                                <p>{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`${styles.categories} ${styles.animateSection}`} ref={addToRefs}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>{t.home.categories}</h2>
                    <div className={styles.categoryGrid}>
                        {FEATURED_CATEGORIES.map((cat, i) => (
                            <Link
                                key={cat.slug}
                                href={`/catalog?category=${cat.slug}`}
                                className={styles.categoryCard}
                                style={{ animationDelay: `${i * 0.15}s` }}
                            >
                                <Image src={cat.image} alt={categoryNames[cat.key]} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 25vw" />
                                <div className={styles.categoryOverlay}>
                                    <span>{categoryNames[cat.key]}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`${styles.parallax} ${styles.animateSection}`} ref={addToRefs}>
                <div className={styles.parallaxBg}>
                    <Image
                        src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920"
                        alt="Workshop"
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="100vw"
                    />
                </div>
                <div className={styles.parallaxContent}>
                    <h2>{t.home.qualityTradition}</h2>
                    <p>{t.home.qualityTraditionDesc}</p>
                    <div className={styles.statsRow}>
                        <div className={styles.stat}>
                            <span>5000+</span>
                            <p>{t.home.satisfiedClients}</p>
                        </div>
                        <div className={styles.stat}>
                            <span>100%</span>
                            <p>{t.home.naturalLeather}</p>
                        </div>
                        <div className={styles.stat}>
                            <span>2</span>
                            <p>{t.home.warrantyYears}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={`${styles.about} ${styles.animateSection}`} ref={addToRefs}>
                <div className={styles.container}>
                    <div className={styles.aboutGrid}>
                        <div className={styles.aboutImage}>
                            <Image
                                src="https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800"
                                alt="Craftsmanship"
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        <div className={styles.aboutContent}>
                            <h2>{t.home.aboutTitle}</h2>
                            <p>{t.home.aboutText1}</p>
                            <p>{t.home.aboutText2}</p>
                            <ul className={styles.features}>
                                <li>{t.home.feature1}</li>
                                <li>{t.home.feature2}</li>
                                <li>{t.home.feature3}</li>
                                <li>{t.home.feature4}</li>
                            </ul>
                            <Link href="/info/about" className={styles.aboutBtn}>
                                {t.home.learnMore}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className={`${styles.reviews} ${styles.animateSection}`} ref={addToRefs}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>{t.home.reviews}</h2>
                    <div className={styles.reviewsGrid}>
                        <div className={styles.reviewCard} style={{ animationDelay: '0s' }}>
                            <div className={styles.stars}>
                                {[...Array(5)].map((_, j) => (
                                    <FiStar key={j} fill="currentColor" />
                                ))}
                            </div>
                            <p>"Чудова сумка! Якість неймовірна, шкіра м'яка та приємна. Рекомендую!"</p>
                            <span className={styles.reviewer}>Олена К.</span>
                        </div>
                        <div className={styles.reviewCard} style={{ animationDelay: '0.15s' }}>
                            <div className={styles.stars}>
                                {[...Array(5)].map((_, j) => (
                                    <FiStar key={j} fill="currentColor" />
                                ))}
                            </div>
                            <p>"Замовляв гаманець, дуже задоволений. Швидка доставка, гарна упаковка."</p>
                            <span className={styles.reviewer}>Михайло Т.</span>
                        </div>
                        <div className={styles.reviewCard} style={{ animationDelay: '0.3s' }}>
                            <div className={styles.stars}>
                                {[...Array(5)].map((_, j) => (
                                    <FiStar key={j} fill="currentColor" />
                                ))}
                            </div>
                            <p>"Ремінь для чоловіка — ідеальний подарунок! Якість на висоті."</p>
                            <span className={styles.reviewer}>Ірина В.</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className={`${styles.cta} ${styles.animateSection}`} ref={addToRefs}>
                <div className={styles.container}>
                    <div className={styles.ctaContent}>
                        <h2>{t.home.ctaTitle}</h2>
                        <p>{t.home.ctaSubtitle}</p>
                        <Link href="/catalog" className={styles.ctaBtn}>
                            {t.home.goToCatalog}
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

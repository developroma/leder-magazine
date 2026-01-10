'use client';

import Link from 'next/link';
import { FiInstagram, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { useTranslations } from '@/lib/store/language';
import styles from './Footer.module.scss';

export default function Footer() {
    const t = useTranslations();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.brand}>
                        <Link href="/" className={styles.logo}>
                            Leder
                        </Link>
                        <p className={styles.tagline}>
                            {t.footer.tagline}
                        </p>
                        <div className={styles.social}>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                <FiInstagram size={24} />
                            </a>
                        </div>
                    </div>

                    <div className={styles.links}>
                        <h4>{t.footer.catalog}</h4>
                        <nav>
                            <Link href="/catalog?category=bags">{t.footer.bags}</Link>
                            <Link href="/catalog?category=wallets">{t.footer.wallets}</Link>
                            <Link href="/catalog?category=belts">{t.footer.belts}</Link>
                            <Link href="/catalog?category=accessories">{t.footer.accessories}</Link>
                        </nav>
                    </div>

                    <div className={styles.links}>
                        <h4>{t.footer.information}</h4>
                        <nav>
                            <Link href="/info/about">{t.footer.about}</Link>
                            <Link href="/info/delivery">{t.footer.delivery}</Link>
                            <Link href="/info/returns">{t.footer.returns}</Link>
                            <Link href="/contact">Підтримка</Link>
                        </nav>
                    </div>

                    <div className={styles.contacts}>
                        <h4>{t.footer.contacts}</h4>
                        <a href="tel:+380501234567">
                            <FiPhone size={16} />
                            +38 (050) 123-45-67
                        </a>
                        <a href="mailto:info@leder.ua">
                            <FiMail size={16} />
                            info@leder.ua
                        </a>
                        <p>
                            <FiMapPin size={16} />
                            {t.footer.location}
                        </p>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>© {new Date().getFullYear()} Leder. {t.footer.rights}</p>
                </div>
            </div>
        </footer>
    );
}

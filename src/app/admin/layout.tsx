'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiPackage, FiShoppingCart, FiLogOut, FiMenu, FiX, FiGrid, FiUsers, FiSun, FiMoon, FiGlobe, FiStar, FiMail } from 'react-icons/fi';
import { useTranslations, useLanguageStore, Language } from '@/lib/store/language';
import { useThemeStore } from '@/lib/store/theme';
import styles from './layout.module.scss';

const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'uk', label: 'UA' },
    { code: 'en', label: 'EN' },
    { code: 'pl', label: 'PL' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const t = useTranslations();
    const { language, setLanguage } = useLanguageStore();
    const { theme, toggleTheme } = useThemeStore();

    const NAV_ITEMS = [
        { href: '/admin', label: t.admin.dashboard, icon: FiHome },
        { href: '/admin/products', label: t.admin.products, icon: FiPackage },
        { href: '/admin/categories', label: t.admin.categories, icon: FiGrid },
        { href: '/admin/orders', label: t.admin.orders, icon: FiShoppingCart },
        { href: '/admin/users', label: t.admin.users, icon: FiUsers },
        { href: '/admin/reviews', label: t.reviews?.reviews || 'Відгуки', icon: FiStar },
        { href: '/admin/support', label: 'Підтримка', icon: FiMail },
    ];

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClick = () => setLangMenuOpen(false);
        if (langMenuOpen) {
            document.addEventListener('click', handleClick);
        }
        return () => document.removeEventListener('click', handleClick);
    }, [langMenuOpen]);

    if (!mounted) return null;

    return (
        <div className={styles.admin}>
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <Link href="/admin" className={styles.logo}>
                        Leder Admin
                    </Link>
                    <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
                        <FiX size={24} />
                    </button>
                </div>
                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className={styles.sidebarFooter}>
                    <Link href="/" className={styles.backLink}>
                        <FiLogOut size={18} />
                        {t.admin.backToSite}
                    </Link>
                </div>
            </aside>

            <div className={styles.main}>
                <header className={styles.header}>
                    <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                        <FiMenu size={24} />
                    </button>
                    <h1>{t.admin.title}</h1>

                    <div className={styles.headerActions}>
                        <div className={styles.langSelector}>
                            <button
                                className={styles.langBtn}
                                onClick={(e) => { e.stopPropagation(); setLangMenuOpen(!langMenuOpen); }}
                            >
                                <FiGlobe size={18} />
                                <span>{LANGUAGES.find(l => l.code === language)?.label}</span>
                            </button>
                            {langMenuOpen && (
                                <div className={styles.langMenu}>
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            className={`${styles.langOption} ${language === lang.code ? styles.active : ''}`}
                                            onClick={() => { setLanguage(lang.code); setLangMenuOpen(false); }}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className={styles.themeBtn} onClick={toggleTheme} aria-label="Toggle theme">
                            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
                        </button>
                    </div>
                </header>
                <main className={styles.content}>{children}</main>
            </div>

            {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
        </div>
    );
}

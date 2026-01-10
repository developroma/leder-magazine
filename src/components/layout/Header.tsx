'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiShoppingBag, FiMenu, FiX, FiUser, FiSettings, FiLogIn, FiMoon, FiSun, FiGlobe, FiHeadphones } from 'react-icons/fi';
import { useCartStore } from '@/lib/store/cart';
import { useAuthStore } from '@/lib/store/auth';
import { useThemeStore } from '@/lib/store/theme';
import { useLanguageStore, useTranslations, type Language } from '@/lib/store/language';
import CartDrawer from '@/components/cart/CartDrawer';
import styles from './Header.module.scss';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
    { code: 'uk', label: 'Українська', flag: '🇺🇦' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const { getTotalItems, openCart } = useCartStore();
    const { user, isAdmin, viewAsCustomer, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();
    const t = useTranslations();

    useEffect(() => {
        setMounted(true);
        // Apply theme on mount
        const savedTheme = localStorage.getItem('theme-storage');
        if (savedTheme) {
            const parsed = JSON.parse(savedTheme);
            if (parsed.state?.theme) {
                document.documentElement.setAttribute('data-theme', parsed.state.theme);
            }
        }
    }, []);

    const totalItems = mounted ? getTotalItems() : 0;
    const showAdminLink = mounted && user && isAdmin && !viewAsCustomer;
    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    return (
        <>
            <header className={styles.header}>
                <div className={styles.container}>
                    <button
                        className={styles.menuBtn}
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <FiMenu size={24} />
                    </button>

                    <Link href="/" className={styles.logo}>
                        Leder
                    </Link>

                    <nav className={styles.nav}>
                        <Link href="/catalog" className={styles.navLink}>
                            {t.nav.catalog}
                        </Link>
                        <Link href="/catalog?category=bags" className={styles.navLink}>
                            {t.nav.bags}
                        </Link>
                        <Link href="/catalog?category=wallets" className={styles.navLink}>
                            {t.nav.wallets}
                        </Link>
                        <Link href="/catalog?category=belts" className={styles.navLink}>
                            {t.nav.belts}
                        </Link>
                        <Link href="/info/about" className={styles.navLink}>
                            {t.nav.about}
                        </Link>
                        <Link href="/contact" className={styles.navLink}>
                            <FiHeadphones size={16} />
                        </Link>
                    </nav>

                    <div className={styles.actions}>
                        {/* Language Switcher */}
                        <div className={styles.langSwitcher}>
                            <button
                                className={styles.langBtn}
                                onClick={() => setLangMenuOpen(!langMenuOpen)}
                                aria-label="Change language"
                            >
                                <span>{language.toUpperCase()}</span>
                            </button>
                            {langMenuOpen && (
                                <>
                                    <div className={styles.langOverlay} onClick={() => setLangMenuOpen(false)} />
                                    <div className={styles.langDropdown}>
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang.code}
                                                className={language === lang.code ? styles.active : ''}
                                                onClick={() => {
                                                    setLanguage(lang.code);
                                                    setLangMenuOpen(false);
                                                }}
                                            >
                                                <span>{lang.flag}</span>
                                                {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        <button
                            className={styles.themeBtn}
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {mounted && theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
                        </button>

                        {mounted && user ? (
                            <div className={styles.userMenu}>
                                <button
                                    className={styles.userBtn}
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="" className={styles.userAvatar} />
                                    ) : (
                                        <FiUser size={20} />
                                    )}
                                    <span className={styles.userName}>{user.firstName || user.email.split('@')[0]}</span>
                                    {isAdmin && <span className={styles.adminDot} />}
                                </button>
                                {userMenuOpen && (
                                    <>
                                        <div className={styles.userOverlay} onClick={() => setUserMenuOpen(false)} />
                                        <div className={styles.userDropdown}>
                                            <Link href="/profile" onClick={() => setUserMenuOpen(false)}>
                                                <FiUser size={16} />
                                                {t.auth.profile}
                                            </Link>
                                            {showAdminLink && (
                                                <Link href="/admin" onClick={() => setUserMenuOpen(false)}>
                                                    <FiSettings size={16} />
                                                    {t.auth.admin}
                                                </Link>
                                            )}
                                            <button onClick={() => { logout(); setUserMenuOpen(false); }}>
                                                {t.auth.logout}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className={styles.actionBtn} aria-label="Login">
                                <FiLogIn size={20} />
                            </Link>
                        )}

                        <button className={styles.cartBtn} onClick={openCart} aria-label="Cart">
                            <FiShoppingBag size={20} />
                            {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
                <div className={styles.mobileHeader}>
                    <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
                        Leder
                    </Link>
                    <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                        <FiX size={24} />
                    </button>
                </div>
                <nav className={styles.mobileNav}>
                    <Link href="/catalog" onClick={() => setIsMenuOpen(false)}>{t.nav.catalog}</Link>
                    <Link href="/catalog?category=bags" onClick={() => setIsMenuOpen(false)}>{t.nav.bags}</Link>
                    <Link href="/catalog?category=wallets" onClick={() => setIsMenuOpen(false)}>{t.nav.wallets}</Link>
                    <Link href="/catalog?category=belts" onClick={() => setIsMenuOpen(false)}>{t.nav.belts}</Link>
                    <Link href="/info/about" onClick={() => setIsMenuOpen(false)}>{t.nav.about}</Link>
                </nav>
            </div>
            {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />}

            <CartDrawer />
        </>
    );
}

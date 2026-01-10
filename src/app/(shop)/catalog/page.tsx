'use client';

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiSearch, FiX, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from '@/components/product/ProductCard';
import { useTranslations } from '@/lib/store/language';
import type { Product } from '@/types';
import styles from './page.module.scss';

const PRODUCTS_PER_PAGE = 12;

const SORT_KEYS = ['sortNew', 'sortPriceAsc', 'sortPriceDesc', 'sortName'] as const;
const SORT_VALUES = ['createdAt-desc', 'price-asc', 'price-desc', 'title-asc'];

interface ColorOption {
    hex: string;
    name: string;
}

interface Category {
    value: string;
    label: string;
}

function CatalogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations();
    const [products, setProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const [colors, setColors] = useState<ColorOption[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [filters, setFilters] = useState({
        categories: searchParams.get('category')?.split(',').filter(Boolean) || [],
        colors: searchParams.get('color')?.split(',').filter(Boolean) || [],
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'createdAt-desc',
        search: searchParams.get('q') || '',
    });

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const res = await fetch('/api/products?limit=100');
                const data = await res.json();
                const prods = data.products || [];
                setAllProducts(prods);

                const uniqueColors = new Map<string, string>();
                prods.forEach((p: Product) => {
                    p.variants.forEach((v) => {
                        if (v.colorHex && v.color) {
                            uniqueColors.set(v.colorHex.toLowerCase(), v.color);
                        }
                    });
                });
                setColors(Array.from(uniqueColors, ([hex, name]) => ({ hex, name })));

                const uniqueCategories = Array.from(new Set(prods.map((p: Product) => p.category))) as string[];
                const categoryLabels: Record<string, string> = {
                    bags: t.catalog.categoryBags,
                    wallets: t.catalog.categoryWallets,
                    belts: t.catalog.categoryBelts,
                    accessories: t.catalog.categoryAccessories,
                };
                setCategories(uniqueCategories.map((c) => ({
                    value: c,
                    label: categoryLabels[c] || c,
                })));
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };
        fetchAllProducts();
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.categories.length > 0) params.set('category', filters.categories.join(','));
        if (filters.colors.length > 0) params.set('color', filters.colors.join(','));
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.search) params.set('q', filters.search);
        const [sort, order] = filters.sort.split('-');
        params.set('sort', sort);
        params.set('order', order);

        try {
            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const updateFilters = (newFilters: typeof filters) => {
        setFilters(newFilters);
        const params = new URLSearchParams();
        if (newFilters.categories.length > 0) params.set('category', newFilters.categories.join(','));
        if (newFilters.colors.length > 0) params.set('color', newFilters.colors.join(','));
        if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
        if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
        if (newFilters.search) params.set('q', newFilters.search);
        if (newFilters.sort !== 'createdAt-desc') params.set('sort', newFilters.sort);
        router.push(`/catalog?${params.toString()}`, { scroll: false });
    };

    const toggleCategory = (cat: string) => {
        const newCategories = filters.categories.includes(cat)
            ? filters.categories.filter((c) => c !== cat)
            : [...filters.categories, cat];
        updateFilters({ ...filters, categories: newCategories });
    };

    const toggleColor = (hex: string) => {
        const newColors = filters.colors.includes(hex)
            ? filters.colors.filter((c) => c !== hex)
            : [...filters.colors, hex];
        updateFilters({ ...filters, colors: newColors });
    };

    const clearFilters = () => {
        updateFilters({
            categories: [],
            colors: [],
            minPrice: '',
            maxPrice: '',
            sort: 'createdAt-desc',
            search: '',
        });
    };

    const handleSearch = (value: string) => {
        updateFilters({ ...filters, search: value });
    };

    const handleSort = (value: string) => {
        updateFilters({ ...filters, sort: value });
        setSortOpen(false);
    };

    const activeFiltersCount =
        filters.categories.length + filters.colors.length +
        (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0);

    // Pagination calculations
    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return products.slice(start, start + PRODUCTS_PER_PAGE);
    }, [products, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={styles.catalog}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        <span>{t.catalog.title.split(' ')[0]}</span>
                        <span className={styles.titleAccent}>{t.catalog.title.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className={styles.subtitle}>{t.catalog.subtitle}</p>
                </div>

                <div className={styles.searchBar}>
                    <FiSearch className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder={t.catalog.search}
                        value={filters.search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                    {filters.search && (
                        <button
                            className={styles.clearSearch}
                            onClick={() => handleSearch('')}
                        >
                            <FiX size={18} />
                        </button>
                    )}
                </div>

                <div className={styles.toolbar}>
                    <button
                        className={`${styles.filterToggle} ${activeFiltersCount > 0 ? styles.hasFilters : ''}`}
                        onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                        {t.catalog.filters}
                        {activeFiltersCount > 0 && <span className={styles.filterBadge}>{activeFiltersCount}</span>}
                    </button>

                    <div className={styles.sortWrapper}>
                        <button className={styles.sortBtn} onClick={() => setSortOpen(!sortOpen)}>
                            {t.catalog[SORT_KEYS[SORT_VALUES.indexOf(filters.sort)] || 'sortNew'] as string}
                            <FiChevronDown className={`${styles.sortIcon} ${sortOpen ? styles.open : ''}`} />
                        </button>
                        {sortOpen && (
                            <>
                                <div className={styles.sortOverlay} onClick={() => setSortOpen(false)} />
                                <ul className={styles.sortDropdown}>
                                    {SORT_KEYS.map((key, idx) => (
                                        <li
                                            key={key}
                                            className={filters.sort === SORT_VALUES[idx] ? styles.active : ''}
                                            onClick={() => handleSort(SORT_VALUES[idx])}
                                        >
                                            {t.catalog[key] as string}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    <p className={styles.results}>
                        {t.catalog.found}: <strong>{products.length}</strong> {t.catalog.products}
                    </p>
                </div>

                <div className={styles.layout}>
                    <aside className={`${styles.sidebar} ${filtersOpen ? styles.open : ''}`}>
                        <div className={styles.sidebarHeader}>
                            <h3>{t.catalog.filters}</h3>
                            <button onClick={() => setFiltersOpen(false)}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className={styles.filterGroup}>
                            <h4>{t.catalog.categories}</h4>
                            <div className={styles.checkboxList}>
                                {categories.map((cat) => (
                                    <label key={cat.value} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={filters.categories.includes(cat.value)}
                                            onChange={() => toggleCategory(cat.value)}
                                        />
                                        <span className={styles.checkboxCustom} />
                                        <span>{cat.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <h4>{t.catalog.colors}</h4>
                            <div className={styles.colorFilters}>
                                {colors.map((color) => (
                                    <button
                                        key={color.hex}
                                        className={`${styles.colorBtn} ${filters.colors.includes(color.hex) ? styles.active : ''}`}
                                        style={{ backgroundColor: color.hex }}
                                        onClick={() => toggleColor(color.hex)}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <h4>{t.catalog.price}</h4>
                            <div className={styles.priceInputs}>
                                <input
                                    type="number"
                                    placeholder={t.catalog.from}
                                    value={filters.minPrice}
                                    onChange={(e) => updateFilters({ ...filters, minPrice: e.target.value })}
                                />
                                <span className={styles.priceDash}>—</span>
                                <input
                                    type="number"
                                    placeholder={t.catalog.to}
                                    value={filters.maxPrice}
                                    onChange={(e) => updateFilters({ ...filters, maxPrice: e.target.value })}
                                />
                            </div>
                        </div>

                        {activeFiltersCount > 0 && (
                            <button className={styles.clearBtn} onClick={clearFilters}>
                                {t.catalog.reset}
                            </button>
                        )}
                    </aside>

                    <main className={styles.main}>
                        {loading ? (
                            <div className={styles.grid}>
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className={styles.skeleton}>
                                        <div className={styles.skeletonImage} />
                                        <div className={styles.skeletonText} />
                                        <div className={styles.skeletonPrice} />
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className={styles.empty}>
                                <div className={styles.emptyIcon}>🔍</div>
                                <h3>{t.catalog.noProducts}</h3>
                                <p>{t.catalog.reset}</p>
                                <button onClick={clearFilters} className={styles.emptyBtn}>
                                    {t.catalog.reset}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={styles.grid}>
                                    {paginatedProducts.map((product, index) => (
                                        <div
                                            key={product._id}
                                            className={styles.productWrapper}
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className={styles.pagination}>
                                        <button
                                            className={styles.pageBtn}
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <FiChevronLeft size={18} />
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                // Show first, last, current, and nearby pages
                                                return page === 1 ||
                                                    page === totalPages ||
                                                    Math.abs(page - currentPage) <= 1;
                                            })
                                            .map((page, idx, arr) => (
                                                <span key={page}>
                                                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                        <span className={styles.pageDots}>...</span>
                                                    )}
                                                    <button
                                                        className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                                                        onClick={() => goToPage(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </span>
                                            ))
                                        }

                                        <button
                                            className={styles.pageBtn}
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <FiChevronRight size={18} />
                                        </button>

                                        <span className={styles.pageInfo}>
                                            {currentPage} / {totalPages}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
            {filtersOpen && <div className={styles.overlay} onClick={() => setFiltersOpen(false)} />}
        </div>
    );
}

export default function CatalogPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>Завантаження...</div>}>
            <CatalogContent />
        </Suspense>
    );
}

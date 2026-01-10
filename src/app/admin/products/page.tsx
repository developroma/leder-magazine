'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { formatPrice, generateSlug } from '@/lib/utils';
import { useTranslations } from '@/lib/store/language';
import type { Product } from '@/types';
import styles from './page.module.scss';

const ITEMS_PER_PAGE_OPTIONS = [8, 12, 24, 48];

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const t = useTranslations();

    const CATEGORIES = [
        { value: 'bags', label: t.catalog.categoryBags },
        { value: 'wallets', label: t.catalog.categoryWallets },
        { value: 'belts', label: t.catalog.categoryBelts },
        { value: 'accessories', label: t.catalog.categoryAccessories },
    ];

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        compareAtPrice: '',
        category: 'bags',
        status: 'active',
        labels: [] as string[],
        variants: [{ color: '', colorHex: '#8B4513', size: '', stock: '', priceModifier: '0', images: [''] }],
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products?limit=100');
            const data = await res.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setForm({
                title: product.title,
                description: product.description,
                price: product.price.toString(),
                compareAtPrice: product.compareAtPrice?.toString() || '',
                category: product.category,
                status: product.status,
                labels: product.labels,
                variants: product.variants.map((v) => ({
                    color: v.color,
                    colorHex: v.colorHex,
                    size: v.size || '',
                    stock: v.stock.toString(),
                    priceModifier: v.priceModifier.toString(),
                    images: v.images.length > 0 ? v.images : [''],
                })),
            });
        } else {
            setEditingProduct(null);
            setForm({
                title: '',
                description: '',
                price: '',
                compareAtPrice: '',
                category: 'bags',
                status: 'active',
                labels: [],
                variants: [{ color: '', colorHex: '#8B4513', size: '', stock: '', priceModifier: '0', images: [''] }],
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const productData = {
            title: form.title,
            slug: generateSlug(form.title),
            description: form.description,
            price: parseFloat(form.price),
            compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
            category: form.category,
            status: form.status,
            labels: form.labels,
            variants: form.variants.map((v) => ({
                color: v.color,
                colorHex: v.colorHex,
                size: v.size || undefined,
                stock: parseInt(v.stock) || 0,
                priceModifier: parseFloat(v.priceModifier) || 0,
                images: v.images.filter(Boolean),
            })),
        };

        try {
            const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
            const method = editingProduct ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (!res.ok) throw new Error('Save failed');

            toast.success(editingProduct ? t.admin.editProduct : t.admin.addProduct);
            setShowModal(false);
            fetchProducts();
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.admin.delete + '?')) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast.success(t.admin.delete);
            fetchProducts();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Error');
        }
    };

    const addVariant = () => {
        setForm((f) => ({
            ...f,
            variants: [...f.variants, { color: '', colorHex: '#8B4513', size: '', stock: '', priceModifier: '0', images: [''] }],
        }));
    };

    const updateVariant = (index: number, field: string, value: string) => {
        setForm((f) => ({
            ...f,
            variants: f.variants.map((v, i) => {
                if (i !== index) return v;
                if (field === 'images') {
                    return { ...v, images: [value] };
                }
                return { ...v, [field]: value };
            }),
        }));
    };

    const removeVariant = (index: number) => {
        if (form.variants.length <= 1) return;
        setForm((f) => ({
            ...f,
            variants: f.variants.filter((_, i) => i !== index),
        }));
    };

    const filteredProducts = products.filter(
        (p) => p.title.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when search or itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, itemsPerPage]);

    if (loading) {
        return <div className={styles.loading}>{t.common.loading}</div>;
    }

    return (
        <div className={styles.products}>
            <div className={styles.header}>
                <h1>{t.admin.products}</h1>
                <button className={styles.addBtn} onClick={() => openModal()}>
                    <FiPlus size={20} />
                    {t.admin.addProduct}
                </button>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <FiSearch size={18} />
                    <input
                        type="text"
                        placeholder={t.admin.searchProducts}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className={styles.toolbarRight}>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className={styles.perPageSelect}
                    >
                        {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <span className={styles.count}>{filteredProducts.length} {t.admin.productCount}</span>
                </div>
            </div>

            {paginatedProducts.length === 0 ? (
                <div className={styles.empty}>
                    <p>{t.admin.noData}</p>
                </div>
            ) : (
                <>
                    <div className={styles.grid}>
                        {paginatedProducts.map((product) => (
                            <div key={product._id} className={styles.card}>
                                <div className={styles.cardImage}>
                                    <Image
                                        src={product.variants[0]?.images[0] || '/placeholder.jpg'}
                                        alt={product.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className={styles.cardInfo}>
                                    <h3>{product.title}</h3>
                                    <p className={styles.cardPrice}>{formatPrice(product.price)}</p>
                                    <p className={styles.cardStock}>
                                        {t.admin.stock}: {product.variants.reduce((sum, v) => sum + v.stock, 0)}
                                    </p>
                                </div>
                                <div className={styles.cardActions}>
                                    <button onClick={() => openModal(product)}>
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(product._id)}>
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={styles.pageBtn}
                            >
                                <FiChevronLeft size={18} />
                            </button>
                            <div className={styles.pageNumbers}>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={styles.pageBtn}
                            >
                                <FiChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <>
                    <div className={styles.overlay} onClick={() => setShowModal(false)} />
                    <div className={styles.modal}>
                        <h2>{editingProduct ? t.admin.editProduct : t.admin.addProduct}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <label>{t.admin.productName} *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label>{t.admin.description}</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={4}
                                />
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formRow}>
                                    <label>{t.admin.price} *</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label>{t.admin.price} (old)</label>
                                    <input
                                        type="number"
                                        value={form.compareAtPrice}
                                        onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formRow}>
                                    <label>{t.admin.category}</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formRow}>
                                    <label>{t.admin.status}</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                    >
                                        <option value="active">{t.admin.statusNew}</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.variants}>
                                <h3>{t.admin.variants}</h3>
                                {form.variants.map((variant, i) => (
                                    <div key={i} className={styles.variantRow}>
                                        <input
                                            type="text"
                                            placeholder={t.admin.color}
                                            value={variant.color}
                                            onChange={(e) => updateVariant(i, 'color', e.target.value)}
                                        />
                                        <input
                                            type="color"
                                            value={variant.colorHex}
                                            onChange={(e) => updateVariant(i, 'colorHex', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder={t.admin.stock}
                                            value={variant.stock}
                                            onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder={t.admin.images}
                                            value={variant.images[0]}
                                            onChange={(e) => updateVariant(i, 'images', e.target.value)}
                                        />
                                        {form.variants.length > 1 && (
                                            <button type="button" onClick={() => removeVariant(i)}>✕</button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className={styles.addVariantBtn} onClick={addVariant}>
                                    {t.admin.addVariant}
                                </button>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                    {t.admin.cancel}
                                </button>
                                <button type="submit" className={styles.saveBtn}>
                                    {t.admin.save}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}

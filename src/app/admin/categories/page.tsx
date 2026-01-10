'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useTranslations } from '@/lib/store/language';
import styles from './page.module.scss';

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    productCount?: number;
}

const DEFAULT_CATEGORIES = [
    { name: 'Сумки', slug: 'bags', description: 'Шкіряні сумки ручної роботи' },
    { name: 'Гаманці', slug: 'wallets', description: 'Гаманці та портмоне' },
    { name: 'Ремені', slug: 'belts', description: 'Шкіряні ремені' },
    { name: 'Аксесуари', slug: 'accessories', description: 'Ключниці, браслети та інше' },
];

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        image: '',
    });
    const t = useTranslations();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.length > 0 ? data : DEFAULT_CATEGORIES.map((c, i) => ({ ...c, _id: `default-${i}` })));
            } else {
                setCategories(DEFAULT_CATEGORIES.map((c, i) => ({ ...c, _id: `default-${i}` })));
            }
        } catch {
            setCategories(DEFAULT_CATEGORIES.map((c, i) => ({ ...c, _id: `default-${i}` })));
        } finally {
            setLoading(false);
        }
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setForm({
                name: category.name,
                slug: category.slug,
                description: category.description || '',
                image: category.image || '',
            });
        } else {
            setEditingCategory(null);
            setForm({ name: '', slug: '', description: '', image: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingCategory && !editingCategory._id.startsWith('default-')
                ? `/api/categories/${editingCategory._id}`
                : '/api/categories';
            const method = editingCategory && !editingCategory._id.startsWith('default-') ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error('Save failed');

            toast.success(editingCategory ? 'Категорію оновлено' : 'Категорію створено');
            setShowModal(false);
            fetchCategories();
        } catch {
            toast.error('Помилка збереження');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.admin.delete + '?')) return;
        if (id.startsWith('default-')) {
            toast.error('Не можна видалити стандартну категорію');
            return;
        }

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast.success('Категорію видалено');
            fetchCategories();
        } catch {
            toast.error('Помилка видалення');
        }
    };

    const generateSlug = (name: string) => {
        const translit: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
            'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
            'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya',
        };
        return name.toLowerCase().split('').map(c => translit[c] || c).join('').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    };

    if (loading) {
        return <div className={styles.loading}>{t.common.loading}</div>;
    }

    return (
        <div className={styles.categories}>
            <div className={styles.header}>
                <h1>{t.admin.categories}</h1>
                <button className={styles.addBtn} onClick={() => openModal()}>
                    <FiPlus size={20} />
                    {t.admin.addCategory}
                </button>
            </div>

            <div className={styles.grid}>
                {categories.map((cat) => (
                    <div key={cat._id} className={styles.card}>
                        <div className={styles.cardContent}>
                            <h3>{cat.name}</h3>
                            <p className={styles.slug}>{cat.slug}</p>
                            {cat.description && <p className={styles.desc}>{cat.description}</p>}
                        </div>
                        <div className={styles.cardActions}>
                            <button onClick={() => openModal(cat)}>
                                <FiEdit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(cat._id)}>
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <>
                    <div className={styles.overlay} onClick={() => setShowModal(false)} />
                    <div className={styles.modal}>
                        <h2>{editingCategory ? t.admin.editCategory : t.admin.addCategory}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.field}>
                                <label>{t.admin.categoryName} *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => {
                                        setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) });
                                    }}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>{t.admin.slug}</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>{t.admin.description}</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>{t.admin.images}</label>
                                <input
                                    type="text"
                                    value={form.image}
                                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)}>{t.admin.cancel}</button>
                                <button type="submit" className={styles.saveBtn}>{t.admin.save}</button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}

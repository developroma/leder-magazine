'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiUser, FiPackage, FiLock, FiCamera, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/auth';
import { useTranslations } from '@/lib/store/language';
import { formatPrice, debounce } from '@/lib/utils';
import type { Order, NovaPoshtaCity, NovaPoshtaWarehouse } from '@/types';
import styles from './page.module.scss';

export default function ProfilePage() {
    const router = useRouter();
    const { user, setUser, logout } = useAuthStore();
    const t = useTranslations();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    // Nova Poshta states
    const [cities, setCities] = useState<NovaPoshtaCity[]>([]);
    const [warehouses, setWarehouses] = useState<NovaPoshtaWarehouse[]>([]);
    const [citySearch, setCitySearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        // Shipping address
        city: '',
        cityRef: '',
        warehouse: '',
        warehouseRef: '',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !user) {
            router.push('/login');
        } else if (user) {
            setForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                middleName: (user as any).middleName || '',
                email: user.email || '',
                phone: user.phone || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                city: (user as any).savedAddress?.city || '',
                cityRef: (user as any).savedAddress?.cityRef || '',
                warehouse: (user as any).savedAddress?.warehouse || '',
                warehouseRef: (user as any).savedAddress?.warehouseRef || '',
            });
            if ((user as any).savedAddress?.city) {
                setCitySearch((user as any).savedAddress.city);
                // Load warehouses for saved city
                if ((user as any).savedAddress?.cityRef) {
                    fetch(`/api/nova-poshta/warehouses?cityRef=${(user as any).savedAddress.cityRef}`)
                        .then(res => res.json())
                        .then(data => setWarehouses(data))
                        .catch(console.error);
                }
            }
            fetchOrders();
        }
    }, [mounted, user, router]);

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/orders?email=${user.email}`);
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Fetch orders error:', error);
        }
    };

    const searchCities = useCallback(
        debounce(async (query: string) => {
            if (query.length < 2) {
                setCities([]);
                return;
            }
            try {
                const res = await fetch(`/api/nova-poshta/cities?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setCities(data);
                setShowCityDropdown(true);
            } catch (error) {
                console.error('City search error:', error);
            }
        }, 300),
        []
    );

    const handleCitySearch = (value: string) => {
        setCitySearch(value);
        setForm((f) => ({ ...f, city: '', cityRef: '', warehouse: '', warehouseRef: '' }));
        setWarehouses([]);
        searchCities(value);
    };

    const selectCity = async (city: NovaPoshtaCity) => {
        setCitySearch(city.Description);
        setForm((f) => ({ ...f, city: city.Description, cityRef: city.Ref, warehouse: '', warehouseRef: '' }));
        setShowCityDropdown(false);
        setCities([]);

        try {
            const res = await fetch(`/api/nova-poshta/warehouses?cityRef=${city.Ref}`);
            const data = await res.json();
            setWarehouses(data);
        } catch (error) {
            console.error('Warehouses fetch error:', error);
        }
    };

    const selectWarehouse = (wh: NovaPoshtaWarehouse) => {
        setForm((f) => ({ ...f, warehouse: wh.Description, warehouseRef: wh.Ref }));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    middleName: form.middleName,
                    phone: form.phone,
                }),
            });

            if (!res.ok) throw new Error('Update failed');

            const data = await res.json();
            setUser({ ...user, ...data });
            toast.success(t.profile.save + '!');
        } catch (error) {
            toast.error('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    savedAddress: {
                        city: form.city,
                        cityRef: form.cityRef,
                        warehouse: form.warehouse,
                        warehouseRef: form.warehouseRef,
                    },
                }),
            });

            if (!res.ok) throw new Error('Update failed');

            const data = await res.json();
            setUser({ ...user, ...data });
            toast.success(t.profile.save + '!');
        } catch (error) {
            toast.error('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (form.newPassword !== form.confirmPassword) {
            toast.error(t.register.repeatPassword);
            return;
        }

        if (form.newPassword.length < 6) {
            toast.error(t.register.minPassword);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: form.newPassword,
                }),
            });

            if (!res.ok) throw new Error('Update failed');

            toast.success(t.profile.save + '!');
            setForm({ ...form, currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success(t.auth.logout);
        router.push('/');
    };

    if (!mounted || !user) {
        return <div className={styles.loading}>{t.common.loading}</div>;
    }

    return (
        <div className={styles.profile}>
            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <div className={styles.avatar}>
                        <div className={styles.avatarImage}>
                            {user.avatar ? (
                                <Image src={user.avatar} alt="Avatar" fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <FiUser size={40} />
                            )}
                        </div>
                        <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 2 * 1024 * 1024) {
                                    toast.error('Max 2MB');
                                    return;
                                }
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                    const base64 = event.target?.result as string;
                                    try {
                                        const res = await fetch(`/api/users/${user._id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ avatar: base64 }),
                                        });
                                        if (res.ok) {
                                            setUser({ ...user, avatar: base64 });
                                            toast.success('OK');
                                        }
                                    } catch {
                                        toast.error('Error');
                                    }
                                };
                                reader.readAsDataURL(file);
                            }}
                        />
                        <button
                            className={styles.avatarBtn}
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                            <FiCamera size={16} />
                        </button>
                    </div>
                    <h2>{user.firstName} {user.lastName}</h2>
                    <p className={styles.email}>{user.email}</p>
                    {user.role === 'admin' && (
                        <span className={styles.adminBadge}>Admin</span>
                    )}

                    <nav className={styles.tabs}>
                        <button
                            className={activeTab === 'profile' ? styles.active : ''}
                            onClick={() => setActiveTab('profile')}
                        >
                            <FiUser size={18} />
                            {t.auth.profile}
                        </button>
                        <button
                            className={activeTab === 'address' ? styles.active : ''}
                            onClick={() => setActiveTab('address')}
                        >
                            <FiMapPin size={18} />
                            {t.profile.shippingAddress}
                        </button>
                        <button
                            className={activeTab === 'orders' ? styles.active : ''}
                            onClick={() => setActiveTab('orders')}
                        >
                            <FiPackage size={18} />
                            {t.profile.orders}
                        </button>
                        <button
                            className={activeTab === 'security' ? styles.active : ''}
                            onClick={() => setActiveTab('security')}
                        >
                            <FiLock size={18} />
                            {t.profile.security}
                        </button>
                    </nav>

                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        {t.auth.logout}
                    </button>
                </div>

                <div className={styles.content}>
                    {activeTab === 'profile' && (
                        <div className={styles.section}>
                            <h3>{t.profile.personalData}</h3>
                            <form onSubmit={handleUpdateProfile}>
                                <div className={styles.formGrid}>
                                    <div className={styles.field}>
                                        <label>{t.profile.lastName}</label>
                                        <input
                                            type="text"
                                            value={form.lastName}
                                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>{t.profile.firstName}</label>
                                        <input
                                            type="text"
                                            value={form.firstName}
                                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label>{t.checkout.middleName}</label>
                                    <input
                                        type="text"
                                        value={form.middleName}
                                        onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>{t.profile.email}</label>
                                    <input type="email" value={form.email} disabled />
                                </div>
                                <div className={styles.field}>
                                    <label>{t.profile.phone}</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+380..."
                                    />
                                </div>
                                <button type="submit" className={styles.saveBtn} disabled={loading}>
                                    {loading ? '...' : t.profile.save}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'address' && (
                        <div className={styles.section}>
                            <h3>{t.profile.shippingAddress}</h3>
                            <form onSubmit={handleUpdateAddress}>
                                <div className={styles.field}>
                                    <label>{t.checkout.city}</label>
                                    <div className={styles.autocomplete}>
                                        <input
                                            type="text"
                                            placeholder={t.checkout.cityPlaceholder}
                                            value={citySearch}
                                            onChange={(e) => handleCitySearch(e.target.value)}
                                            onFocus={() => cities.length > 0 && setShowCityDropdown(true)}
                                        />
                                        {showCityDropdown && cities.length > 0 && (
                                            <ul className={styles.dropdown}>
                                                {cities.map((city) => (
                                                    <li key={city.Ref} onClick={() => selectCity(city)}>
                                                        {city.Description}, {city.AreaDescription}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label>{t.checkout.warehouse}</label>
                                    <select
                                        value={form.warehouseRef}
                                        onChange={(e) => {
                                            const wh = warehouses.find((w) => w.Ref === e.target.value);
                                            if (wh) selectWarehouse(wh);
                                        }}
                                        disabled={warehouses.length === 0}
                                    >
                                        <option value="">{t.checkout.warehouseSelect}</option>
                                        {warehouses.map((wh) => (
                                            <option key={wh.Ref} value={wh.Ref}>
                                                {wh.Description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {form.city && form.warehouse && (
                                    <div className={styles.savedInfo}>
                                        <p><strong>{t.profile.savedCity}:</strong> {form.city}</p>
                                        <p><strong>{t.profile.savedWarehouse}:</strong> {form.warehouse}</p>
                                    </div>
                                )}
                                <button type="submit" className={styles.saveBtn} disabled={loading}>
                                    {loading ? '...' : t.profile.save}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className={styles.section}>
                            <h3>{t.profile.orders}</h3>
                            {orders.length === 0 ? (
                                <div className={styles.empty}>
                                    <FiPackage size={48} />
                                    <p>{t.profile.noOrders}</p>
                                </div>
                            ) : (
                                <div className={styles.ordersList}>
                                    {orders.map((order) => (
                                        <div key={order._id} className={styles.orderCard}>
                                            <div className={styles.orderHeader}>
                                                <span className={styles.orderNumber}>#{order.orderNumber}</span>
                                                <span className={`${styles.status} ${styles[order.status]}`}>
                                                    {order.status === 'new' && t.admin.statusNew}
                                                    {order.status === 'received' && t.admin.statusReceived}
                                                    {order.status === 'shipped' && t.admin.statusShipped}
                                                    {order.status === 'delivered' && t.admin.statusDelivered}
                                                </span>
                                            </div>
                                            <div className={styles.orderItems}>
                                                {order.items.map((item, i) => (
                                                    <div key={i} className={styles.orderItem}>
                                                        <span>{item.title} × {item.quantity}</span>
                                                        <span>{formatPrice(item.price * item.quantity)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={styles.orderFooter}>
                                                <span>{new Date(order.createdAt).toLocaleDateString('uk-UA')}</span>
                                                <strong>{formatPrice(order.totalPrice)}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className={styles.section}>
                            <h3>{t.profile.security}</h3>
                            <form onSubmit={handleChangePassword}>
                                <div className={styles.field}>
                                    <label>{t.register.password}</label>
                                    <input
                                        type="password"
                                        value={form.newPassword}
                                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                        placeholder={t.register.minPassword}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>{t.register.confirmPassword}</label>
                                    <input
                                        type="password"
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        placeholder={t.register.repeatPassword}
                                    />
                                </div>
                                <button type="submit" className={styles.saveBtn} disabled={loading}>
                                    {loading ? '...' : t.common.save}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

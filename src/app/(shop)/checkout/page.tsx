'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FiInfo } from 'react-icons/fi';
import { useCartStore } from '@/lib/store/cart';
import { useAuthStore } from '@/lib/store/auth';
import { useTranslations } from '@/lib/store/language';
import { formatPrice, debounce } from '@/lib/utils';
import type { NovaPoshtaCity, NovaPoshtaWarehouse } from '@/types';
import PhoneInput from '@/components/ui/PhoneInput';
import styles from './page.module.scss';

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const [userDataLoaded, setUserDataLoaded] = useState(false);
    const [cities, setCities] = useState<NovaPoshtaCity[]>([]);
    const [warehouses, setWarehouses] = useState<NovaPoshtaWarehouse[]>([]);
    const [citySearch, setCitySearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [hasSavedData, setHasSavedData] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phone: '',
        city: '',
        cityRef: '',
        warehouse: '',
        warehouseRef: '',
        paymentMethod: 'cod' as 'stripe' | 'cod',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load user data from profile - always try API first
    useEffect(() => {
        const loadUserData = async () => {
            if (userDataLoaded) return;

            try {
                const res = await fetch('/api/users/me');
                if (res.ok) {
                    const userData = await res.json();
                    setForm((f) => ({
                        ...f,
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        middleName: userData.middleName || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        city: userData.savedAddress?.city || '',
                        cityRef: userData.savedAddress?.cityRef || '',
                        warehouse: userData.savedAddress?.warehouse || '',
                        warehouseRef: userData.savedAddress?.warehouseRef || '',
                    }));

                    // Mark that we loaded saved data
                    if (userData.firstName || userData.phone || userData.savedAddress?.city) {
                        setHasSavedData(true);
                    }

                    // If has saved city, set citySearch and load warehouses
                    if (userData.savedAddress?.city) {
                        setCitySearch(userData.savedAddress.city);
                        if (userData.savedAddress.cityRef) {
                            const whRes = await fetch(`/api/nova-poshta/warehouses?cityRef=${userData.savedAddress.cityRef}`);
                            const whData = await whRes.json();
                            setWarehouses(whData);
                        }
                    }
                }
            } catch (error) {
                console.error('Load user data error:', error);
            } finally {
                setUserDataLoaded(true);
            }
        };

        loadUserData();
    }, [userDataLoaded]);

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
        setForm((f) => ({ ...f, city: city.Description, cityRef: city.Ref }));
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

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.firstName.trim()) errs.firstName = t.checkout.firstName + ' required';
        if (!form.lastName.trim()) errs.lastName = t.checkout.lastName + ' required';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'Email required';
        }
        if (!form.phone.trim() || !/^\+?380\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
            errs.phone = '+380XXXXXXXXX';
        }
        if (!form.city) errs.city = t.checkout.city + ' required';
        if (!form.warehouse) errs.warehouse = t.checkout.warehouse + ' required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const saveUserShippingInfo = async () => {
        if (!user?.email) return;

        try {
            await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    middleName: form.middleName,
                    phone: form.phone,
                    savedAddress: {
                        city: form.city,
                        cityRef: form.cityRef,
                        warehouse: form.warehouse,
                        warehouseRef: form.warehouseRef,
                    },
                }),
            });
        } catch (error) {
            console.error('Save user info error:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (items.length === 0) {
            toast.error(t.cart.empty);
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                customer: {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    middleName: form.middleName,
                    email: form.email,
                    phone: form.phone,
                },
                shipping: {
                    city: form.city,
                    cityRef: form.cityRef,
                    warehouse: form.warehouse,
                    warehouseRef: form.warehouseRef,
                    method: 'nova_poshta',
                },
                items: items.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    title: item.product.title,
                    color: item.variant.color,
                    size: item.variant.size,
                    quantity: item.quantity,
                    price: item.product.price + item.variant.priceModifier,
                    image: item.variant.images[0],
                })),
                subtotal: getTotalPrice(),
                shippingCost: 0,
                totalPrice: getTotalPrice(),
                paymentMethod: form.paymentMethod,
            };

            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (!orderRes.ok) {
                const err = await orderRes.json();
                throw new Error(err.error || 'Order creation failed');
            }

            const order = await orderRes.json();

            // Save shipping info to user profile
            await saveUserShippingInfo();

            if (form.paymentMethod === 'stripe') {
                const stripeRes = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: orderData.items,
                        orderId: order._id,
                    }),
                });

                if (!stripeRes.ok) throw new Error('Stripe checkout failed');

                const { url } = await stripeRes.json();
                clearCart();
                window.location.href = url;
            } else {
                clearCart();
                router.push(`/success?order_id=${order._id}`);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Помилка оформлення замовлення');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.container}>
                    <h1>{t.cart.empty}</h1>
                    <p>{t.home.viewCatalog}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.checkout}>
            <div className={styles.container}>
                <h1>{t.checkout.title}</h1>

                <form onSubmit={handleSubmit} className={styles.layout}>
                    <div className={styles.form}>
                        {hasSavedData && (
                            <div className={styles.savedDataNotice}>
                                <FiInfo size={20} />
                                <div>
                                    <strong>{t.checkout.savedDataTitle || 'Дані з вашого профілю'}</strong>
                                    <p>{t.checkout.savedDataMessage || 'Перевірте, будь ласка, правильність та актуальність даних'}</p>
                                </div>
                            </div>
                        )}
                        <section className={styles.section}>
                            <h2>{t.checkout.contactInfo}</h2>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>{t.checkout.lastName} *</label>
                                    <input
                                        type="text"
                                        value={form.lastName}
                                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                                        className={errors.lastName ? styles.error : ''}
                                    />
                                    {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
                                </div>
                                <div className={styles.field}>
                                    <label>{t.checkout.firstName} *</label>
                                    <input
                                        type="text"
                                        value={form.firstName}
                                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                                        className={errors.firstName ? styles.error : ''}
                                    />
                                    {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>{t.checkout.middleName}</label>
                                    <input
                                        type="text"
                                        value={form.middleName}
                                        onChange={(e) => setForm((f) => ({ ...f, middleName: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>{t.checkout.email} *</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                        className={errors.email ? styles.error : ''}
                                    />
                                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                                </div>
                                <div className={styles.field}>
                                    <label>{t.checkout.phone} *</label>
                                    <PhoneInput
                                        value={form.phone}
                                        onChange={(value) => setForm((f) => ({ ...f, phone: value }))}
                                        required
                                        error={errors.phone}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h2>{t.checkout.delivery}</h2>
                            <div className={styles.field}>
                                <label>{t.checkout.city} *</label>
                                <div className={styles.autocomplete}>
                                    <input
                                        type="text"
                                        placeholder={t.checkout.cityPlaceholder}
                                        value={citySearch}
                                        onChange={(e) => handleCitySearch(e.target.value)}
                                        onFocus={() => cities.length > 0 && setShowCityDropdown(true)}
                                        className={errors.city ? styles.error : ''}
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
                                {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                            </div>
                            <div className={styles.field}>
                                <label>{t.checkout.warehouse} *</label>
                                <select
                                    value={form.warehouseRef}
                                    onChange={(e) => {
                                        const wh = warehouses.find((w) => w.Ref === e.target.value);
                                        if (wh) selectWarehouse(wh);
                                    }}
                                    disabled={warehouses.length === 0}
                                    className={errors.warehouse ? styles.error : ''}
                                >
                                    <option value="">{t.checkout.warehouseSelect}</option>
                                    {warehouses.map((wh) => (
                                        <option key={wh.Ref} value={wh.Ref}>
                                            {wh.Description}
                                        </option>
                                    ))}
                                </select>
                                {errors.warehouse && <span className={styles.errorText}>{errors.warehouse}</span>}
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h2>{t.checkout.payment}</h2>
                            <div className={styles.paymentMethods}>
                                <label className={styles.paymentOption}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={form.paymentMethod === 'cod'}
                                        onChange={() => setForm((f) => ({ ...f, paymentMethod: 'cod' }))}
                                    />
                                    <span>{t.checkout.paymentCod}</span>
                                </label>
                                <label className={styles.paymentOption}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={form.paymentMethod === 'stripe'}
                                        onChange={() => setForm((f) => ({ ...f, paymentMethod: 'stripe' }))}
                                    />
                                    <span>{t.checkout.paymentCard}</span>
                                </label>
                            </div>
                        </section>
                    </div>

                    <div className={styles.summary}>
                        <h3>{t.checkout.yourOrder}</h3>
                        <div className={styles.summaryItems}>
                            {items.map((item) => (
                                <div key={`${item.productId}-${item.variantId}`} className={styles.summaryItem}>
                                    <div className={styles.summaryImage}>
                                        <Image
                                            src={item.variant.images[0] || '/placeholder.jpg'}
                                            alt={item.product.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <span className={styles.qty}>{item.quantity}</span>
                                    </div>
                                    <div className={styles.summaryInfo}>
                                        <p>{item.product.title}</p>
                                        <span>{item.variant.color}</span>
                                    </div>
                                    <div className={styles.summaryPrice}>
                                        {formatPrice((item.product.price + item.variant.priceModifier) * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.summaryTotal}>
                            <span>{t.checkout.toPay}:</span>
                            <span>{formatPrice(getTotalPrice())}</span>
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? t.checkout.processing : t.checkout.submit}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

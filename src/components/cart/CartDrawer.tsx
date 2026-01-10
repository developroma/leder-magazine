'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useCartStore } from '@/lib/store/cart';
import { useTranslations } from '@/lib/store/language';
import { formatPrice } from '@/lib/utils';
import styles from './CartDrawer.module.scss';

export default function CartDrawer() {
    const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice } = useCartStore();
    const t = useTranslations();

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={closeCart} />
            <div className={styles.drawer}>
                <div className={styles.header}>
                    <h2>{t.cart.cart}</h2>
                    <button onClick={closeCart} aria-label="Close cart">
                        <FiX size={24} />
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className={styles.empty}>
                        <p>{t.cart.empty}</p>
                        <Link href="/catalog" className={styles.continueBtn} onClick={closeCart}>
                            {t.home.viewCatalog}
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className={styles.items}>
                            {items.map((item) => (
                                <div key={`${item.productId}-${item.variantId}`} className={styles.item}>
                                    <div className={styles.image}>
                                        <Image
                                            src={item.variant.images[0] || '/placeholder.jpg'}
                                            alt={item.product.title}
                                            fill
                                            sizes="80px"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className={styles.info}>
                                        <h4>{item.product.title}</h4>
                                        <p className={styles.variant}>
                                            {item.variant.color}
                                            {item.variant.size && ` / ${item.variant.size}`}
                                        </p>
                                        <p className={styles.price}>
                                            {formatPrice(item.product.price + item.variant.priceModifier)}
                                        </p>
                                    </div>
                                    <div className={styles.controls}>
                                        <div className={styles.quantity}>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.productId, item.variantId, item.quantity - 1)
                                                }
                                                disabled={item.quantity <= 1}
                                            >
                                                <FiMinus size={14} />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.productId, item.variantId, item.quantity + 1)
                                                }
                                                disabled={item.quantity >= item.variant.stock}
                                            >
                                                <FiPlus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeItem(item.productId, item.variantId)}
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.total}>
                                <span>{t.cart.total}:</span>
                                <span>{formatPrice(getTotalPrice())}</span>
                            </div>
                            <Link href="/checkout" className={styles.checkoutBtn} onClick={closeCart}>
                                {t.cart.checkout}
                            </Link>
                            <button className={styles.continueBtn} onClick={closeCart}>
                                {t.cart.continue}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

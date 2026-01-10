'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiMinus, FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import styles from './page.module.scss';

export default function CartPage() {
    const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();

    if (items.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.container}>
                    <h1>Кошик порожній</h1>
                    <p>Додайте товари до кошика, щоб оформити замовлення</p>
                    <Link href="/catalog" className={styles.continueBtn}>
                        Перейти до каталогу
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.cart}>
            <div className={styles.container}>
                <h1>Кошик</h1>

                <div className={styles.layout}>
                    <div className={styles.items}>
                        {items.map((item) => (
                            <div key={`${item.productId}-${item.variantId}`} className={styles.item}>
                                <div className={styles.image}>
                                    <Image
                                        src={item.variant.images[0] || '/placeholder.jpg'}
                                        alt={item.product.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className={styles.details}>
                                    <Link href={`/product/${item.product.slug}`} className={styles.title}>
                                        {item.product.title}
                                    </Link>
                                    <p className={styles.variant}>
                                        {item.variant.color}
                                        {item.variant.size && ` / ${item.variant.size}`}
                                    </p>
                                    <p className={styles.price}>
                                        {formatPrice(item.product.price + item.variant.priceModifier)}
                                    </p>
                                </div>
                                <div className={styles.quantity}>
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        <FiMinus size={16} />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                                        disabled={item.quantity >= item.variant.stock}
                                    >
                                        <FiPlus size={16} />
                                    </button>
                                </div>
                                <div className={styles.subtotal}>
                                    {formatPrice((item.product.price + item.variant.priceModifier) * item.quantity)}
                                </div>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => removeItem(item.productId, item.variantId)}
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summary}>
                        <h3>Підсумок</h3>
                        <div className={styles.summaryRow}>
                            <span>Товарів:</span>
                            <span>{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Сума:</span>
                            <span>{formatPrice(getTotalPrice())}</span>
                        </div>
                        <div className={styles.summaryTotal}>
                            <span>До сплати:</span>
                            <span>{formatPrice(getTotalPrice())}</span>
                        </div>
                        <Link href="/checkout" className={styles.checkoutBtn}>
                            Оформити замовлення
                        </Link>
                        <button className={styles.clearBtn} onClick={clearCart}>
                            Очистити кошик
                        </button>
                    </div>
                </div>

                <Link href="/catalog" className={styles.backLink}>
                    <FiArrowLeft />
                    Продовжити покупки
                </Link>
            </div>
        </div>
    );
}

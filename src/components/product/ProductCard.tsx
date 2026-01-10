'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingBag, FiStar } from 'react-icons/fi';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice, cn } from '@/lib/utils';
import { useProductTranslation } from '@/lib/translate';
import type { Product } from '@/types';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem, openCart } = useCartStore();
    const translateName = useProductTranslation();
    const defaultVariant = product.variants[0];
    const isOutOfStock = product.variants.every((v) => v.stock === 0);
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
    const [rating, setRating] = useState({ avg: 0, count: 0 });

    useEffect(() => {
        // Fetch rating for this product
        fetch(`/api/reviews?productId=${product._id}`)
            .then(res => res.json())
            .then(data => {
                if (data.averageRating !== undefined) {
                    setRating({ avg: data.averageRating, count: data.totalReviews || 0 });
                }
            })
            .catch(() => { });
    }, [product._id]);

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        if (defaultVariant && defaultVariant.stock > 0) {
            addItem(product, defaultVariant);
            openCart();
        }
    };

    return (
        <Link href={`/product/${product.slug}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image
                    src={defaultVariant?.images[0] || '/placeholder.jpg'}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    style={{ objectFit: 'cover' }}
                    className={styles.image}
                />
                {defaultVariant?.images[1] && (
                    <Image
                        src={defaultVariant.images[1]}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        style={{ objectFit: 'cover' }}
                        className={styles.imageHover}
                    />
                )}

                <div className={styles.labels}>
                    {product.labels.includes('new') && <span className={styles.labelNew}>New</span>}
                    {product.labels.includes('sale') && <span className={styles.labelSale}>Sale</span>}
                    {isOutOfStock && <span className={styles.labelSoldOut}>Sold Out</span>}
                </div>

                {!isOutOfStock && (
                    <button className={styles.quickAdd} onClick={handleQuickAdd}>
                        <FiShoppingBag size={18} />
                    </button>
                )}
            </div>

            <div className={styles.info}>
                <h3 className={styles.title}>{translateName(product)}</h3>
                {rating.avg > 0 && (
                    <div className={styles.rating}>
                        <FiStar size={14} fill="#FFB800" color="#FFB800" />
                        <span>{rating.avg.toFixed(1)}</span>
                        <span className={styles.ratingCount}>({rating.count})</span>
                    </div>
                )}
                <div className={styles.colors}>
                    {product.variants.filter(v => v.colorHex).slice(0, 4).map((variant) => (
                        <span
                            key={variant._id}
                            className={styles.colorDot}
                            style={{ backgroundColor: variant.colorHex }}
                            title={variant.color}
                        />
                    ))}
                    {product.variants.filter(v => v.colorHex).length > 4 && (
                        <span className={styles.moreColors}>+{product.variants.filter(v => v.colorHex).length - 4}</span>
                    )}
                </div>
                <div className={styles.price}>
                    <span className={cn(hasDiscount ? styles.discounted : null)}>
                        {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                        <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice!)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

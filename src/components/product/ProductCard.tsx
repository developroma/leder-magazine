'use client';

import { useState } from 'react';
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
    rating?: { avg: number; count: number };
}

export default function ProductCard({ product, rating }: ProductCardProps) {
    const { addItem, openCart } = useCartStore();
    const translateName = useProductTranslation();
    const defaultVariant = product.variants[0];
    const isOutOfStock = product.variants.every((v) => v.stock === 0);
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

    // Check if product is new (created within last 7 days)
    const isNew = product.createdAt &&
        (new Date().getTime() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

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
                    {isNew && <span className={styles.labelNew}>New</span>}
                    {hasDiscount && <span className={styles.labelSale}>Sale</span>}
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
                {rating && rating.avg > 0 && (
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

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FiMinus, FiPlus, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice, cn } from '@/lib/utils';
import ReviewList from '@/components/reviews/ReviewList';
import type { Product, ProductVariant } from '@/types';
import styles from './page.module.scss';

export default function ProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

    const { addItem, openCart } = useCartStore();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                    if (data.variants.length > 0) {
                        setSelectedVariant(data.variants[0]);
                    }
                }
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [params.id]);

    const handleVariantChange = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        setSelectedImage(0);
        setQuantity(1);
    };

    const handleAddToCart = () => {
        if (!product || !selectedVariant) return;
        if (selectedVariant.stock === 0) {
            toast.error('Товар закінчився');
            return;
        }
        addItem(product, selectedVariant, quantity);
        openCart();
        toast.success('Додано до кошика');
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.notFound}>
                <h1>Товар не знайдено</h1>
            </div>
        );
    }

    const images = selectedVariant?.images || [];
    const currentPrice = product.price + (selectedVariant?.priceModifier || 0);
    const isOutOfStock = selectedVariant?.stock === 0;

    return (
        <div className={styles.product}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.gallery}>
                        <div
                            className={styles.mainImage}
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                            onMouseMove={handleMouseMove}
                        >
                            {images[selectedImage] && (
                                <>
                                    <Image
                                        src={images[selectedImage]}
                                        alt={product.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        priority
                                    />
                                    {isZoomed && (
                                        <div
                                            className={styles.zoomLens}
                                            style={{
                                                backgroundImage: `url(${images[selectedImage]})`,
                                                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                            }}
                                        />
                                    )}
                                </>
                            )}
                            {product.labels.includes('new') && <span className={styles.labelNew}>New</span>}
                            {product.labels.includes('sale') && <span className={styles.labelSale}>Sale</span>}
                        </div>
                        <div className={styles.thumbnails}>
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    className={cn(styles.thumbnail, selectedImage === i && styles.active)}
                                    onClick={() => setSelectedImage(i)}
                                >
                                    <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.info}>
                        <h1>{product.title}</h1>

                        <div className={styles.price}>
                            <span className={cn(product.compareAtPrice ? styles.discounted : undefined)}>
                                {formatPrice(currentPrice)}
                            </span>
                            {product.compareAtPrice && (
                                <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</span>
                            )}
                        </div>

                        <div className={styles.variants}>
                            <h4>Колір: {selectedVariant?.color}</h4>
                            <div className={styles.colorSwatches}>
                                {product.variants.map((variant) => (
                                    <button
                                        key={variant._id}
                                        className={cn(styles.swatch, selectedVariant?._id === variant._id && styles.active)}
                                        style={{ backgroundColor: variant.colorHex }}
                                        onClick={() => handleVariantChange(variant)}
                                        title={variant.color}
                                    >
                                        {selectedVariant?._id === variant._id && <FiCheck />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.stock}>
                            {isOutOfStock ? (
                                <span className={styles.outOfStock}>Немає в наявності</span>
                            ) : (
                                <span className={styles.inStock}>В наявності: {selectedVariant?.stock} шт.</span>
                            )}
                        </div>

                        <div className={styles.actions}>
                            <div className={styles.quantity}>
                                <button
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <FiMinus />
                                </button>
                                <span>{quantity}</span>
                                <button
                                    onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock || 1, q + 1))}
                                    disabled={quantity >= (selectedVariant?.stock || 1)}
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <button
                                className={styles.addToCart}
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                            >
                                {isOutOfStock ? 'Немає в наявності' : 'Додати в кошик'}
                            </button>
                        </div>

                        <div className={styles.description}>
                            <h4>Опис</h4>
                            <p>{product.description}</p>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <ReviewList productId={product._id} />
            </div>
        </div>
    );
}

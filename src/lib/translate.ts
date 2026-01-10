// Translation utility for products
import { useLanguageStore } from './store/language';
import type { Product } from '@/types';

export function getProductTitle(product: Product, lang: 'uk' | 'en' | 'pl'): string {
    if (lang === 'en' && product.titleEn) return product.titleEn;
    if (lang === 'pl' && product.titlePl) return product.titlePl;
    return product.title; // fallback to Ukrainian
}

// Hook for React components
export function useProductTranslation() {
    const { language } = useLanguageStore();

    return (product: Product) => getProductTitle(product, language);
}

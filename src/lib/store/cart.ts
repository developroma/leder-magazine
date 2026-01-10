import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '@/types';

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
    removeItem: (productId: string, variantId: string) => void;
    updateQuantity: (productId: string, variantId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product, variant, quantity = 1) => {
                set((state) => {
                    const existingIndex = state.items.findIndex(
                        (item) => item.productId === product._id && item.variantId === variant._id
                    );

                    if (existingIndex > -1) {
                        const newItems = [...state.items];
                        const newQuantity = newItems[existingIndex].quantity + quantity;
                        newItems[existingIndex].quantity = Math.min(newQuantity, variant.stock);
                        return { items: newItems };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                productId: product._id,
                                variantId: variant._id,
                                quantity: Math.min(quantity, variant.stock),
                                product,
                                variant,
                            },
                        ],
                    };
                });
            },

            removeItem: (productId, variantId) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => !(item.productId === productId && item.variantId === variantId)
                    ),
                }));
            },

            updateQuantity: (productId, variantId, quantity) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId && item.variantId === variantId
                            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.variant.stock)) }
                            : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

            getTotalPrice: () =>
                get().items.reduce(
                    (sum, item) =>
                        sum + (item.product.price + item.variant.priceModifier) * item.quantity,
                    0
                ),
        }),
        {
            name: 'leder-cart',
            partialize: (state) => ({ items: state.items }),
        }
    )
);

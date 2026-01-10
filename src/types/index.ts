export interface ProductVariant {
    _id: string;
    color: string;
    colorHex: string;
    size?: string;
    stock: number;
    priceModifier: number;
    images: string[];
}

export interface Product {
    _id: string;
    title: string;
    titleEn?: string;
    titlePl?: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    category: 'bags' | 'wallets' | 'belts' | 'accessories';
    variants: ProductVariant[];
    labels: ('new' | 'sale' | 'bestseller')[];
    status: 'active' | 'draft';
    createdAt: Date;
    updatedAt: Date;
}

export interface CartItem {
    productId: string;
    variantId: string;
    quantity: number;
    product: Product;
    variant: ProductVariant;
}

export interface Customer {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface Shipping {
    city: string;
    cityRef: string;
    warehouse: string;
    warehouseRef: string;
    method: 'nova_poshta' | 'ukrposhta';
}

export interface OrderItem {
    productId: string;
    variantId: string;
    title: string;
    color: string;
    size?: string;
    quantity: number;
    price: number;
    image: string;
}

export interface Order {
    _id: string;
    orderNumber: string;
    customer: Customer;
    shipping: Shipping;
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    totalPrice: number;
    status: 'new' | 'received' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'stripe' | 'cod';
    paymentId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    _id: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    avatar?: string;
    role: 'admin' | 'customer';
    // Saved shipping information
    savedAddress?: {
        city: string;
        cityRef: string;
        warehouse: string;
        warehouseRef: string;
    };
    createdAt: Date;
}

export interface NovaPoshtaCity {
    Ref: string;
    Description: string;
    AreaDescription: string;
}

export interface NovaPoshtaWarehouse {
    Ref: string;
    Description: string;
    ShortAddress: string;
    Number: string;
    TypeOfWarehouse: string;
}

export interface Review {
    _id: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    likes: string[];
    status: 'new' | 'read' | 'replied';
    parentId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    // Populated fields
    user?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
    replies?: Review[];
}


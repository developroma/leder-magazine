import mongoose, { Schema, Model } from 'mongoose';
import type { Product } from '@/types';

const ProductVariantSchema = new Schema({
    color: { type: String, required: true },
    colorHex: { type: String, required: true },
    size: { type: String },
    stock: { type: Number, required: true, default: 0 },
    priceModifier: { type: Number, default: 0 },
    images: [{ type: String }],
});

const ProductSchema = new Schema<Product>(
    {
        title: { type: String, required: true },
        titleEn: { type: String },
        titlePl: { type: String },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        compareAtPrice: { type: Number },
        category: {
            type: String,
            enum: ['bags', 'wallets', 'belts', 'accessories'],
            required: true,
        },
        variants: [ProductVariantSchema],
        labels: [{ type: String, enum: ['new', 'sale', 'bestseller'] }],
        status: { type: String, enum: ['active', 'draft'], default: 'active' },
    },
    { timestamps: true }
);

ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });

const ProductModel: Model<Product> =
    mongoose.models.Product || mongoose.model<Product>('Product', ProductSchema);

export default ProductModel;

import mongoose, { Schema, Model } from 'mongoose';
import type { Order } from '@/types';

const CustomerSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
});

const ShippingSchema = new Schema({
    city: { type: String, required: true },
    cityRef: { type: String, required: true },
    warehouse: { type: String, required: true },
    warehouseRef: { type: String, required: true },
    method: { type: String, enum: ['nova_poshta', 'ukrposhta'], default: 'nova_poshta' },
});

const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: String, required: true },
    title: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    image: { type: String },
});

const OrderSchema = new Schema<Order>(
    {
        orderNumber: { type: String, required: true, unique: true },
        customer: { type: CustomerSchema, required: true },
        shipping: { type: ShippingSchema, required: true },
        items: [OrderItemSchema],
        subtotal: { type: Number, required: true },
        shippingCost: { type: Number, default: 0 },
        totalPrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ['new', 'received', 'shipped', 'delivered', 'cancelled'],
            default: 'new',
        },
        paymentMethod: { type: String, enum: ['stripe', 'cod'], default: 'cod' },
        paymentId: { type: String },
    },
    { timestamps: true }
);

OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'customer.email': 1 });

const OrderModel: Model<Order> =
    mongoose.models.Order || mongoose.model<Order>('Order', OrderSchema);

export default OrderModel;

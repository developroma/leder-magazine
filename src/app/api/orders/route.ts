import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import OrderModel from '@/models/Order';
import ProductModel from '@/models/Product';
import { generateOrderNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        let query = {};
        if (email) {
            query = { 'customer.email': email };
        }

        const orders = await OrderModel.find(query).sort({ createdAt: -1 }).limit(100).lean();
        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Orders API error:', error);
        return NextResponse.json({ orders: [] }, { status: 200 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const data = await request.json();

        for (const item of data.items) {
            const product = await ProductModel.findById(item.productId);
            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
            }
            const variant = product.variants.find((v: { _id: { toString: () => string } }) => v._id.toString() === item.variantId);
            if (!variant || variant.stock < item.quantity) {
                return NextResponse.json({ error: `Insufficient stock for ${product.title}` }, { status: 400 });
            }
        }

        const order = await OrderModel.create({
            ...data,
            orderNumber: generateOrderNumber(),
        });

        for (const item of data.items) {
            await ProductModel.updateOne(
                { _id: item.productId, 'variants._id': item.variantId },
                { $inc: { 'variants.$.stock': -item.quantity } }
            );
        }

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

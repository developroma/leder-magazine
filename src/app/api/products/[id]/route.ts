import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import ProductModel from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const isValidObjectId = mongoose.Types.ObjectId.isValid(params.id);
        const query = isValidObjectId
            ? { $or: [{ _id: params.id }, { slug: params.id }], status: 'active' }
            : { slug: params.id, status: 'active' };

        const product = await ProductModel.findOne(query).lean();

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const data = await request.json();
        const product = await ProductModel.findByIdAndUpdate(params.id, data, { new: true });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const product = await ProductModel.findByIdAndDelete(params.id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
}, { timestamps: true });

const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const data = await request.json();
        const category = await CategoryModel.findByIdAndUpdate(params.id, data, { new: true });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const category = await CategoryModel.findByIdAndDelete(params.id);

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Category deleted' });
    } catch (error) {
        console.error('Delete category error:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}

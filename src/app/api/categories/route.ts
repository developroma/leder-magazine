import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
}, { timestamps: true });

const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export async function GET() {
    try {
        await dbConnect();
        const categories = await CategoryModel.find().sort({ name: 1 }).lean();
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const data = await request.json();
        const category = await CategoryModel.create(data);
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

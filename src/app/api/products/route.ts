import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import ProductModel from '@/models/Product';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const color = searchParams.get('color');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const sort = searchParams.get('sort') || 'createdAt';
        const order = searchParams.get('order') || 'desc';
        const q = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');

        const query: Record<string, unknown> = { status: 'active' };

        if (category) {
            const categories = category.split(',').filter(Boolean);
            if (categories.length > 0) {
                query.category = { $in: categories };
            }
        }

        if (color) {
            const colors = color.split(',').filter(Boolean);
            if (colors.length > 0) {
                query['variants.colorHex'] = { $in: colors.map(c => new RegExp(c, 'i')) };
            }
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) (query.price as Record<string, number>).$gte = parseInt(minPrice);
            if (maxPrice) (query.price as Record<string, number>).$lte = parseInt(maxPrice);
        }

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
            ];
        }

        const sortOptions: Record<string, 1 | -1> = {};
        if (sort === 'price') {
            sortOptions.price = order === 'asc' ? 1 : -1;
        } else if (sort === 'title') {
            sortOptions.title = order === 'asc' ? 1 : -1;
        } else {
            sortOptions.createdAt = -1;
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            ProductModel.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
            ProductModel.countDocuments(query),
        ]);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Products API error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const data = await request.json();
        const product = await ProductModel.create(data);
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

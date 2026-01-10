import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/mongoose';
import ReviewModel from '@/models/Review';
import UserModel from '@/models/User';
import ProductModel from '@/models/Product';

// Get all reviews for admin (with product info)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Check admin auth
        const cookieStore = await cookies();
        const userCookie = cookieStore.get('auth-user');
        if (!userCookie?.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { email } = JSON.parse(userCookie.value);
        const user = await UserModel.findOne({ email });
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Get top-level reviews only (not replies)
        const reviews = await ReviewModel.find({ parentId: null })
            .populate('userId', 'firstName lastName avatar role')
            .populate('productId', 'title')
            .sort({ createdAt: -1 })
            .lean();

        // Get replies for each review
        const reviewsWithReplies = await Promise.all(
            reviews.map(async (review: any) => {
                const replies = await ReviewModel.find({ parentId: review._id })
                    .populate('userId', 'firstName lastName avatar role')
                    .sort({ createdAt: 1 })
                    .lean();
                return {
                    ...review,
                    user: review.userId,
                    product: review.productId,
                    replies: replies.map((r: any) => ({
                        ...r,
                        user: r.userId,
                    })),
                };
            })
        );

        return NextResponse.json(reviewsWithReplies);
    } catch (error) {
        console.error('Get admin reviews error:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

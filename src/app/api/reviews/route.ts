import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/mongoose';
import ReviewModel from '@/models/Review';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

// Get reviews for a product
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        // Get top-level reviews (no parentId)
        const reviews = await ReviewModel.find({
            productId,
            parentId: null
        })
            .populate('userId', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .lean();

        // Get replies for each review
        const reviewsWithReplies = await Promise.all(
            reviews.map(async (review: any) => {
                const replies = await ReviewModel.find({ parentId: review._id })
                    .populate('userId', 'firstName lastName avatar')
                    .sort({ createdAt: 1 })
                    .lean();
                return {
                    ...review,
                    user: review.userId,
                    userId: review.userId?._id,
                    replies: replies.map((r: any) => ({
                        ...r,
                        user: r.userId,
                        userId: r.userId?._id,
                    })),
                };
            })
        );

        // Calculate average rating
        const allRatings = await ReviewModel.find({
            productId,
            parentId: null,
            rating: { $gt: 0 }
        }).select('rating');

        const avgRating = allRatings.length > 0
            ? allRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / allRatings.length
            : 0;

        return NextResponse.json({
            reviews: reviewsWithReplies,
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length,
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// Create new review
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Get user from cookie
        const cookieStore = await cookies();
        const userCookie = cookieStore.get('auth-user');
        if (!userCookie?.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { email } = JSON.parse(userCookie.value);
        const user = await UserModel.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { productId, rating, comment } = await request.json();

        if (!productId || rating === undefined || !comment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user already reviewed this product
        const existingReview = await ReviewModel.findOne({
            productId,
            userId: user._id,
            parentId: null
        });

        if (existingReview) {
            return NextResponse.json({ error: 'You already reviewed this product' }, { status: 400 });
        }

        const review = await ReviewModel.create({
            productId,
            userId: user._id,
            rating: Math.min(5, Math.max(0, rating)),
            comment,
            status: 'new',
        });

        const populatedReview = await ReviewModel.findById(review._id)
            .populate('userId', 'firstName lastName avatar')
            .lean();

        return NextResponse.json({
            ...populatedReview,
            user: (populatedReview as any).userId,
        }, { status: 201 });
    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}

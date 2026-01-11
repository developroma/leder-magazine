import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import ReviewModel from '@/models/Review';

export const dynamic = 'force-dynamic';

// Get featured reviews (4-5 stars) for homepage display
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '3');

        // Find approved reviews with 4-5 star ratings
        const reviews = await ReviewModel.find({
            rating: { $gte: 4 },
            parentId: { $exists: false }, // Only parent reviews, not replies
        })
            .populate('userId', 'firstName lastName')
            .sort({ rating: -1, createdAt: -1 })
            .limit(limit)
            .lean();

        // Format for frontend
        const formattedReviews = reviews.map((review: any) => ({
            _id: review._id,
            rating: review.rating,
            comment: review.comment,
            userName: review.userId?.firstName
                ? `${review.userId.firstName} ${review.userId.lastName?.[0] || ''}.`
                : 'Клієнт',
            createdAt: review.createdAt,
        }));

        return NextResponse.json(formattedReviews);
    } catch (error) {
        console.error('Featured reviews error:', error);
        return NextResponse.json([]);
    }
}

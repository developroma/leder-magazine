import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/mongoose';
import ReviewModel from '@/models/Review';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

// Add reply to review
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

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

        const parentReview = await ReviewModel.findById(params.id);
        if (!parentReview) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        const { comment } = await request.json();
        if (!comment) {
            return NextResponse.json({ error: 'Comment required' }, { status: 400 });
        }

        // Create reply (rating 0 for replies, they don't count towards average)
        const reply = await ReviewModel.create({
            productId: parentReview.productId,
            userId: user._id,
            rating: 0,
            comment,
            parentId: params.id,
            status: 'new',
        });

        // If admin replies, mark parent as replied
        if (user.role === 'admin') {
            parentReview.status = 'replied';
            await parentReview.save();
        }

        const populatedReply = await ReviewModel.findById(reply._id)
            .populate('userId', 'firstName lastName avatar')
            .lean();

        return NextResponse.json({
            ...populatedReply,
            user: (populatedReply as any).userId,
        }, { status: 201 });
    } catch (error) {
        console.error('Create reply error:', error);
        return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
    }
}

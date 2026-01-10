import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/mongoose';
import ReviewModel from '@/models/Review';
import UserModel from '@/models/User';

// Get single review
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const review = await ReviewModel.findById(params.id)
            .populate('userId', 'firstName lastName avatar')
            .lean();

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json(review);
    } catch (error) {
        console.error('Get review error:', error);
        return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
    }
}

// Update review (owner or admin)
export async function PUT(
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

        const review = await ReviewModel.findById(params.id);
        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        // Only owner or admin can edit
        if (review.userId.toString() !== user._id.toString() && user.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const data = await request.json();

        // Admin can update status
        if (user.role === 'admin' && data.status) {
            review.status = data.status;
        }

        // Owner can update rating and comment
        if (review.userId.toString() === user._id.toString()) {
            if (data.rating !== undefined) review.rating = Math.min(5, Math.max(0, data.rating));
            if (data.comment) review.comment = data.comment;
        }

        await review.save();

        return NextResponse.json(review);
    } catch (error) {
        console.error('Update review error:', error);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}

// Delete review (owner or admin)
export async function DELETE(
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

        const review = await ReviewModel.findById(params.id);
        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        // Only owner or admin can delete
        if (review.userId.toString() !== user._id.toString() && user.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Delete all replies too
        await ReviewModel.deleteMany({ parentId: params.id });
        await ReviewModel.findByIdAndDelete(params.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete review error:', error);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}

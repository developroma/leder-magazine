import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/mongoose';
import ReviewModel from '@/models/Review';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

// Toggle like on review
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

        const review = await ReviewModel.findById(params.id);
        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        const userId = user._id.toString();
        const likeIndex = review.likes.findIndex((id: any) => id.toString() === userId);

        if (likeIndex > -1) {
            // Unlike
            review.likes.splice(likeIndex, 1);
        } else {
            // Like
            review.likes.push(user._id);
        }

        await review.save();

        return NextResponse.json({
            liked: likeIndex === -1,
            likesCount: review.likes.length
        });
    } catch (error) {
        console.error('Toggle like error:', error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}

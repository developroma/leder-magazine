import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import UserModel from '@/models/User';

export async function GET() {
    try {
        await dbConnect();
        const users = await UserModel.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json({ users: [] }, { status: 200 });
    }
}

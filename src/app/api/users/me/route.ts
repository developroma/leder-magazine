import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/mongoose';
import UserModel from '@/models/User';

// Get current user data by email from cookie/session
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get user email from auth-user cookie
        const cookieStore = await cookies();
        const userCookie = cookieStore.get('auth-user');

        if (!userCookie?.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        let userData;
        try {
            userData = JSON.parse(userCookie.value);
        } catch {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const user = await UserModel.findOne({ email: userData.email }).select('-password').lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

// Update current user data
export async function PUT(request: NextRequest) {
    try {
        await dbConnect();

        // Get user email from auth-user cookie
        const cookieStore = await cookies();
        const userCookie = cookieStore.get('auth-user');

        if (!userCookie?.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        let userData;
        try {
            userData = JSON.parse(userCookie.value);
        } catch {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const data = await request.json();

        // If updating password, hash it
        if (data.password) {
            const bcrypt = require('bcryptjs');
            data.password = await bcrypt.hash(data.password, 10);
        }

        const user = await UserModel.findOneAndUpdate(
            { email: userData.email },
            { $set: data },
            { new: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Update current user error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

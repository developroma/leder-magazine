import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';

async function ensureDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@leder.ua';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
        await UserModel.create({
            email: adminEmail,
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'Leder',
            role: 'admin',
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        await ensureDefaultAdmin();

        const { email, password } = await request.json();

        const user = await UserModel.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 });
        }

        const userWithoutPassword = {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
        };

        // Create response with user data
        const response = NextResponse.json(userWithoutPassword);

        // Set auth cookie for API access
        response.cookies.set('auth-user', JSON.stringify({ email: user.email }), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Помилка входу' }, { status: 500 });
    }
}


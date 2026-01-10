import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import UserModel from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { email, password, firstName, lastName } = await request.json();

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Користувач вже існує' }, { status: 400 });
        }

        const user = await UserModel.create({
            email,
            password,
            firstName,
            lastName,
            role: 'customer',
        });

        const userWithoutPassword = {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
        };

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Помилка реєстрації' }, { status: 500 });
    }
}

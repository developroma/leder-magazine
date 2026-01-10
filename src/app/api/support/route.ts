import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/mongoose';
import SupportTicketModel from '@/models/SupportTicket';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

// Get all tickets (admin only)
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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query: any = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const tickets = await SupportTicketModel.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(tickets);
    } catch (error) {
        console.error('Get tickets error:', error);
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}

// Create new ticket (public)
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { name, email, subject, message } = await request.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Simple email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        const ticket = await SupportTicketModel.create({
            name,
            email,
            subject,
            message,
            status: 'open',
        });

        return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
        console.error('Create ticket error:', error);
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
}

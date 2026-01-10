import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/mongoose';
import SupportTicketModel from '@/models/SupportTicket';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

// Update ticket status (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { status } = await request.json();
        if (!['open', 'replied', 'closed'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const ticket = await SupportTicketModel.findByIdAndUpdate(
            params.id,
            { status },
            { new: true }
        );

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error('Update ticket error:', error);
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
}

// Delete ticket (admin only)
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
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        await SupportTicketModel.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete ticket error:', error);
        return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
    }
}

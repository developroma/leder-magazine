import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/mongoose';
import SupportTicketModel from '@/models/SupportTicket';
import UserModel from '@/models/User';
import { sendSupportReply } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Admin reply to ticket
export async function POST(
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

        const { reply } = await request.json();
        if (!reply || !reply.trim()) {
            return NextResponse.json({ error: 'Reply is required' }, { status: 400 });
        }

        const ticket = await SupportTicketModel.findById(params.id);
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Send email
        const emailSent = await sendSupportReply(
            ticket.email,
            ticket.subject,
            ticket.name,
            ticket.message,
            reply
        );

        // Update ticket
        ticket.adminReply = reply;
        ticket.status = 'replied';
        ticket.repliedAt = new Date();
        await ticket.save();

        return NextResponse.json({
            success: true,
            emailSent,
            ticket
        });
    } catch (error) {
        console.error('Reply to ticket error:', error);
        return NextResponse.json({ error: 'Failed to reply' }, { status: 500 });
    }
}

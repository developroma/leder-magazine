import mongoose, { Schema } from 'mongoose';

const SupportTicketSchema = new Schema(
    {
        email: { type: String, required: true },
        name: { type: String, required: true },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ['open', 'replied', 'closed'],
            default: 'open'
        },
        adminReply: { type: String },
        repliedAt: { type: Date },
    },
    { timestamps: true }
);

// Index for efficient queries
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ createdAt: -1 });

export default mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema);

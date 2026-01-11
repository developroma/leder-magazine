import mongoose, { Schema, Model } from 'mongoose';

const ReviewSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 0, max: 5 },
        comment: { type: String, required: true },
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        status: {
            type: String,
            enum: ['new', 'read', 'replied'],
            default: 'new'
        },
        moderation: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        parentId: { type: Schema.Types.ObjectId, ref: 'Review', default: null },
    },
    { timestamps: true }
);

// Index for efficient queries
ReviewSchema.index({ productId: 1, parentId: 1 });
ReviewSchema.index({ status: 1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);

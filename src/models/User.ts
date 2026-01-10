import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { User } from '@/types';

interface UserMethods {
    comparePassword(password: string): Promise<boolean>;
}

type UserModel = Model<User, {}, UserMethods>;

const UserSchema = new Schema<User, UserModel, UserMethods>(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        middleName: { type: String },
        phone: { type: String },
        avatar: { type: String },
        role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
        savedAddress: {
            city: { type: String },
            cityRef: { type: String },
            warehouse: { type: String },
            warehouseRef: { type: String },
        },
    },
    { timestamps: true }
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

UserSchema.methods.comparePassword = async function (password: string) {
    return bcrypt.compare(password, this.password);
};

const UserModel: UserModel =
    mongoose.models.User || mongoose.model<User, UserModel>('User', UserSchema);

export default UserModel;

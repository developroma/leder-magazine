import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import ProductModel from '@/models/Product';
import OrderModel from '@/models/Order';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// Consolidated admin dashboard stats endpoint - single request instead of multiple
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Run all queries in parallel for maximum speed
        const [products, orders, supportTickets] = await Promise.all([
            ProductModel.find({ status: 'active' }).select('variants').lean(),
            OrderModel.find().select('status totalPrice').lean(),
            // Support tickets - check if collection exists
            mongoose.connection.db?.collection('supporttickets')
                ?.find({ status: 'open' })
                .toArray()
                .catch(() => []) || [],
        ]);

        // Calculate stats
        const stats = {
            totalOrders: orders.length,
            newOrders: orders.filter((o: any) => o.status === 'new').length,
            revenue: orders
                .filter((o: any) => o.status !== 'cancelled')
                .reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0),
            lowStock: products.filter((p: any) =>
                p.variants?.some((v: any) => v.stock > 0 && v.stock <= 3)
            ).length,
            openSupport: (supportTickets || []).length,
            totalProducts: products.length,
        };

        // Recent orders for dashboard (limit 5)
        const recentOrders = await OrderModel.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return NextResponse.json({ stats, recentOrders });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { stats: { totalOrders: 0, newOrders: 0, revenue: 0, lowStock: 0, openSupport: 0 }, recentOrders: [] },
            { status: 200 }
        );
    }
}

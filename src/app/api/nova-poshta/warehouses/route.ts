import { NextRequest, NextResponse } from 'next/server';
import { getWarehouses } from '@/lib/nova-poshta';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cityRef = searchParams.get('cityRef') || '';

        if (!cityRef) {
            return NextResponse.json([]);
        }

        const warehouses = await getWarehouses(cityRef);
        return NextResponse.json(warehouses);
    } catch (error) {
        console.error('Nova Poshta warehouses error:', error);
        return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 });
    }
}

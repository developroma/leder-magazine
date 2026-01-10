import { NextRequest, NextResponse } from 'next/server';
import { searchCities } from '@/lib/nova-poshta';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (query.length < 2) {
            return NextResponse.json([]);
        }

        const cities = await searchCities(query);
        return NextResponse.json(cities);
    } catch (error) {
        console.error('Nova Poshta cities error:', error);
        return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
    }
}

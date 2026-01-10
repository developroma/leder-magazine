import axios from 'axios';
import type { NovaPoshtaCity, NovaPoshtaWarehouse } from '@/types';

const API_URL = 'https://api.novaposhta.ua/v2.0/json/';
const API_KEY = process.env.NOVA_POSHTA_API_KEY!;

// Simple in-memory cache to reduce API calls
const citiesCache = new Map<string, { data: NovaPoshtaCity[], timestamp: number }>();
const warehousesCache = new Map<string, { data: NovaPoshtaWarehouse[], timestamp: number }>();
const CITIES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const WAREHOUSES_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface NovaPoshtaResponse<T> {
    success: boolean;
    data: T[];
    errors: string[];
    warnings: string[];
}

export async function searchCities(query: string): Promise<NovaPoshtaCity[]> {
    if (!query || query.length < 2) return [];

    // Check cache
    const cacheKey = query.toLowerCase();
    const cached = citiesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CITIES_CACHE_TTL) {
        return cached.data;
    }

    try {
        const response = await axios.post<NovaPoshtaResponse<NovaPoshtaCity>>(API_URL, {
            apiKey: API_KEY,
            modelName: 'Address',
            calledMethod: 'getCities',
            methodProperties: {
                FindByString: query,
                Limit: '20',
            },
        });

        if (!response.data.success) {
            console.error('Nova Poshta API error:', response.data.errors);
            // Return cached data if available even if expired
            return cached?.data || [];
        }

        // Update cache
        citiesCache.set(cacheKey, { data: response.data.data, timestamp: Date.now() });
        return response.data.data;
    } catch (error) {
        console.error('Nova Poshta API request error:', error);
        return cached?.data || [];
    }
}

export async function getWarehouses(cityRef: string): Promise<NovaPoshtaWarehouse[]> {
    if (!cityRef) return [];

    // Check cache
    const cached = warehousesCache.get(cityRef);
    if (cached && Date.now() - cached.timestamp < WAREHOUSES_CACHE_TTL) {
        return cached.data;
    }

    try {
        const response = await axios.post<NovaPoshtaResponse<NovaPoshtaWarehouse>>(API_URL, {
            apiKey: API_KEY,
            modelName: 'Address',
            calledMethod: 'getWarehouses',
            methodProperties: {
                CityRef: cityRef,
                Limit: '100',
            },
        });

        if (!response.data.success) {
            console.error('Nova Poshta API error:', response.data.errors);
            // Return cached data if available even if expired
            return cached?.data || [];
        }

        // Update cache
        warehousesCache.set(cityRef, { data: response.data.data, timestamp: Date.now() });
        return response.data.data;
    } catch (error) {
        console.error('Nova Poshta API request error:', error);
        return cached?.data || [];
    }
}


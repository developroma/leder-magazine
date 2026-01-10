import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'customer' | 'admin';
    avatar?: string;
    phone?: string;
}

interface AuthState {
    user: User | null;
    isAdmin: boolean;
    viewAsCustomer: boolean;
    setUser: (user: User | null) => void;
    toggleViewMode: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAdmin: false,
            viewAsCustomer: false,
            setUser: (user) => set({
                user,
                isAdmin: user?.role === 'admin',
                viewAsCustomer: false,
            }),
            toggleViewMode: () => set({ viewAsCustomer: !get().viewAsCustomer }),
            logout: () => {
                // Clear cookie via API
                fetch('/api/auth/logout', { method: 'POST' }).catch(console.error);
                // Clear local state
                set({ user: null, isAdmin: false, viewAsCustomer: false });
            },
        }),
        {
            name: 'leder-auth',
        }
    )
);

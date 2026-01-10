import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeStore {
    theme: Theme;
    _hasHydrated: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            theme: 'light',
            _hasHydrated: false,
            setTheme: (theme) => {
                set({ theme });
                if (typeof document !== 'undefined') {
                    document.documentElement.setAttribute('data-theme', theme);
                }
            },
            toggleTheme: () => {
                const newTheme = get().theme === 'light' ? 'dark' : 'light';
                set({ theme: newTheme });
                if (typeof document !== 'undefined') {
                    document.documentElement.setAttribute('data-theme', newTheme);
                }
            },
            setHasHydrated: (state) => {
                set({ _hasHydrated: state });
            },
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true);
                    // Apply theme after hydration
                    if (typeof document !== 'undefined') {
                        document.documentElement.setAttribute('data-theme', state.theme);
                    }
                }
            },
        }
    )
);

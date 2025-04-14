import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) =>
                set({
                    user,
                }),
            
            logout: () => {
                set({
                    user: null,
                });
                localStorage.removeItem('auth-storage');
                document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
      )
);
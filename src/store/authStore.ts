import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
    id: string;
    code: string,
    name: string;
    email?: string;
    dateJoinCompany: string,
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
            setUser: (user) => {
                set({
                    user,
                    isAuthenticated: true
                });
            },
            
            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                });
                localStorage.removeItem('auth-storage');
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
      )
);
import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
    id: string;
    code: string,
    name?: string;
    email?: string;
    date_join_company?: string,
    date_of_birth?: string,
    phone?: string,
    sex?: number,
    role?: {
        id: number,
        name: string
    },
    parent_department?: {
        id: number,
        name: string
    },
    children_department?: {
        id: number,
        name: string
    },
    position?: {
        id: number,
        name: string
    }
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
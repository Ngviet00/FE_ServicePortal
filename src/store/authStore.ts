import userApi from "@/api/userApi";
import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';
interface IRole {
    id: number,
    name?: string,
    code?: string
}

interface User {
    id: string;
    code: string,
    name?: string;
    email?: string;
    date_join_company?: string,
    date_of_birth?: string,
    phone?: string,
    sex?: number,
    level: string,
    level_parent: string,
    position: string,
    department_id: number,
    department?: {
        id: number,
        name: string
    },
    roles?: IRole[],
    user_permissions?: string[],
    permissions?: string[]
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
    fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
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
            },
            fetchCurrentUser: async () => {
                const currentUser = get().user;
                if (!currentUser) return;
                
                try {
                    const res = await userApi.getMe();
                    set({ user: res.data.data });
                } catch (err) {
                    console.error('Failed to fetch user', err);
                }
              },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
      )
);
import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';
interface IRole {
    id: number,
    name?: string,
    code?: string
}

interface User {
    id: string;
    userCode: string,
    IsActive?: number;
    isChangePassword?: number;
    position?: number,
    roles?: IRole[],
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
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
    positionId?: number,
    roles?: IRole[],
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    setUser: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            setUser: (user, accessToken, refreshToken) => {
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true
                });
            },

            setAccessToken: (token) =>
                set((state) => ({
                ...state,
                accessToken: token,
            })),
            
            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
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
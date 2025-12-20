import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';

export interface User {
    id: string;
    userCode: string,
    userName?: string | undefined | null,
    departmentId?: number | undefined | null,
    departmentName?: string,
    isActive?: number;
    isChangePassword?: number;
    orgPositionId?: number,
    unitId?: number,
    dateOfBirth?: string,
    dateJoinCompany?: string,
    email?: string,
    sex?: boolean,
    phone?: string,
    roles?: string[],
    permissions?: string[] ,
    unitName?: string,
    unitNameV?: string
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    setUser: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setAccessToken: (token: string) => void;
    updateUser: (updated: Partial<User>) => void;
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
                });
            },

            setAccessToken: (token) =>
                set((state) => ({
                ...state,
                accessToken: token,
            })),

            updateUser: (updated) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updated } : null
                }
            )),
            
            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
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
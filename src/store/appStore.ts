import { create } from 'zustand';

type AppStore = {
    numberWait: number;
    setNumberWait: (value: number) => void;
};

export const useAppStore = create<AppStore>((set) => ({
    numberWait: 0,
    setNumberWait: (value) => set({ numberWait: value }),
}));
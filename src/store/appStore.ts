import { create } from 'zustand';

type AppStore = {
    numberLeaveWaitApproval: number;
    setNumberLeaveWaitApproval: (value: number) => void;
};

export const useAppStore = create<AppStore>((set) => ({
    numberLeaveWaitApproval: 0,
    setNumberLeaveWaitApproval: (value) => set({ numberLeaveWaitApproval: value }),
}));
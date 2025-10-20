import { create } from 'zustand';

type AppStore = {
    numberLeaveWaitApproval: number;
    setNumberLeaveWaitApproval: (value: number) => void;

    selectedQuoteId: number;
    setSelectedQuoteId: (value: number) => void;
};

export const useAppStore = create<AppStore>((set) => ({
    numberLeaveWaitApproval: 0,
    setNumberLeaveWaitApproval: (value) => set({ numberLeaveWaitApproval: value }),

    selectedQuoteId: 0,
    setSelectedQuoteId: (value) => set({ selectedQuoteId: value }),
}));
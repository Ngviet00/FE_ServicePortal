// import { create } from 'zustand';

// type AppStore = {
//     numberWaitApprovalLeaveRequest: number;
//     setNumberWaitApprovalLeaveRequest: (count: number) => void;
//     decrementNumberWaitApprovalLeaveRequest: () => void;
// };

// export const useAppStore = create<AppStore>((set) => ({
//     numberWaitApprovalLeaveRequest : 0,
//     setNumberWaitApprovalLeaveRequest: (count) => set({numberWaitApprovalLeaveRequest : count}),
//     decrementNumberWaitApprovalLeaveRequest: () => {
//         set((state) => ({
//             numberWaitApprovalLeaveRequest: Math.max(0, state.numberWaitApprovalLeaveRequest - 1)
//         }))
//     }
// }));
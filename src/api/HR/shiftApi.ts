import axiosClient from '../axiosClient';

const shiftApi = {
    importShift(data: FormData) {
        return axiosClient.post('/shift/import-shift', data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    importDayOff(data: FormData) {
        return axiosClient.post('/shift/import-day-off', data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    getAllShift() {
        return axiosClient.get('/shift/get-all-shift');
    },

    getCombineUserShift() {
        return axiosClient.post('/shift/get-combine-user-with-shift')
    }
}

// export function usePushManualUserToMachine() {
//     return useMutation({
//         mutationFn: async (data: PushManualUserToMachine) => {
//             await scanMachineApi.pushManualUserToMachine(data)
//         },
//         onSuccess: () => {
//             ShowToast("Success");
//         },
//         onError: (err) => {
//             ShowToast(getErrorMessage(err), "error");
//         }
//     })
// }

// export function useSaveScanMachineWithDept() {
//     return useMutation({
//         mutationFn: async (data: SaveScanMachineWithDept) => {
//             await scanMachineApi.saveScanMachineWithDept(data)
//         },
//         onSuccess: () => {
//             ShowToast("Success");
//         },
//         onError: (err) => {
//             ShowToast(getErrorMessage(err), "error");
//         }
//     })
// }

// export function useCreateOrUpdateScanMachine() {
//     return useMutation({
//         mutationFn: async (data: Create) => {
//             await scanMachineApi.createOrUpdateScanMachine(data)
//         },
//         onSuccess: () => {
//             ShowToast("Success");
//         },
//         onError: (err) => {
//             ShowToast(getErrorMessage(err), "error");
//         }
//     })
// }

// export function useDeleteScanMachine() {
//     return useMutation({
//         mutationFn: async (id: number) => {
//             await scanMachineApi.deleteScanMachine(id)
//         },
//         onSuccess: () => {
//             ShowToast("Success");
//         },
//         onError: (err) => {
//             ShowToast(getErrorMessage(err), "error");
//         }
//     })
// }


export default shiftApi;
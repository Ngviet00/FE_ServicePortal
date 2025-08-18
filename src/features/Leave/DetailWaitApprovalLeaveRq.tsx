import ModalConfirm from "@/components/ModalConfirm"
import HistoryApproval from "../Approval/Components/HistoryApproval"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import leaveRequestApi, { useRegisterAllLeaveRequest } from "@/api/leaveRequestApi"
import { formatDate } from "@/lib/time"
import { useApproval } from "@/api/approvalApi"
import useHasRole from "@/hooks/useHasRole"
import { RoleEnum, STATUS_ENUM } from "@/lib"
import useHasPermission from "@/hooks/useHasPermission"

const DetailWaitApprovalLeaveRq = () => {
    const lang = useTranslation().i18n.language.split('-')[0]
    const [note, setNote] = useState("")
    const { t } = useTranslation()
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const { id } = useParams<{ id: string }>()
    const { user } = useAuthStore()
    const approval = useApproval()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const registerAllLeaveMutation = useRegisterAllLeaveRequest()

    const { data: leaveRequest } = useQuery({
        queryKey: ['get-detail-leave-request'],
        queryFn: async () => {
            const res = await leaveRequestApi.getById(id!);
            return res.data.data;
        },
        enabled: id != null || id != undefined
    });

    
    const isHR = useHasRole([RoleEnum.HR])
    const hasPermissionHRMngLeaveRq = useHasPermission(['leave_request.hr_management_leave_request'])
    const isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR = isHR && hasPermissionHRMngLeaveRq && leaveRequest?.applicationForm?.requestStatus?.id == STATUS_ENUM.WAIT_HR

    const handleSaveModalConfirm = async (type: string) => {
        const payload = {
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note,
            LeaveRequestId: id,
            urlFrontend: window.location.origin,
            RequestTypeId: leaveRequest?.applicationForm?.requestTypeId
        }

        try {
            if (isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR) {
                await registerAllLeaveMutation.mutateAsync({
                    UserCode: user?.userCode,
                    UserName: user?.userName ?? "",
                    leaveRequestIds: [id ?? ""]
                })
                setStatusModalConfirm('')
                navigate("/approval/pending-approval")
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
            else {
                await approval.mutateAsync(payload)
                setStatusModalConfirm('')
                navigate("/approval/pending-approval")
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }

        } catch (err) {
            console.log(err);
        }
    }

    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-3">
                <h3 className="font-bold text-xl md:text-2xl m-0 pb-2">Chi tiết đơn nghỉ phép</h3>
            </div>
            <div className="text-left mb-6 border-t border-dashed border-gray-400 pt-2">
                <p className="my-2 text-xl">
                    <strong className="text-blue-600">Mã đơn:</strong> <span className="font-bold text-gray-600">{leaveRequest?.code}</span>
                </p>
                <p className="my-2">
                    <strong>Mã nhân viên:</strong> {leaveRequest?.userCodeRequestor}
                </p>
                <p className="my-2">
                    <strong>Người gửi:</strong> {leaveRequest?.userNameRequestor}
                </p>

                <p className="my-2">
                    <strong>Phòng ban:</strong> {leaveRequest?.orgUnit.name}
                </p>
                <p className="my-2">
                    <strong>Chức vụ:</strong> {leaveRequest?.position}
                </p>

                <p className="my-2">
                    <strong>Ngày bắt đầu:</strong> {formatDate(leaveRequest?.fromDate, 'yyyy-MM-dd HH:mm:ss')}
                </p>

                <p className="my-2">
                    <strong>Ngày kết thúc:</strong> {formatDate(leaveRequest?.toDate, 'yyyy-MM-dd HH:mm:ss')}
                </p>

                <p className="my-2">
                    <strong>Thời gian nghỉ:</strong> {lang == 'vi' ? leaveRequest?.timeLeave.name : leaveRequest?.timeLeave.nameE}
                </p>

                <p className="my-2">
                    <strong>Lý do:</strong> {leaveRequest?.reason}
                </p>
            </div>

            <HistoryApproval historyApplicationForm={leaveRequest?.applicationForm?.historyApplicationForms[0]}/>

            <div>
                <Label className='mb-1'>{t('note')}</Label>
                <Textarea placeholder='Note' value={note} onChange={(e) => setNote(e.target.value)} className="border-gray-300"/>
            </div>

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />
            <div>
                <div className="flex justify-end gap-4 mt-8">
                    {
                        isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR ? (
                            <Button
                                onClick={() => setStatusModalConfirm('approval')}
                                className="px-4 py-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                            >
                                {t('approval')}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setStatusModalConfirm('approval')}
                                    className="px-4 py-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                                >
                                    {t('approval')}
                                </Button>
                                <Button
                                    onClick={() => setStatusModalConfirm('reject')}
                                    className="flex items-center justify-center hover:cursor-pointer px-8 py-4 bg-red-600 text-white rounded-[3px] shadow-lg hover:bg-red-700 hover:shadow-xl transform transition-all duration-200 text-base"
                                >
                                    {t('reject')}
                                </Button>
                            </>
                        )
                    }

                </div>
            </div>
        </div>
    )
}

export default DetailWaitApprovalLeaveRq
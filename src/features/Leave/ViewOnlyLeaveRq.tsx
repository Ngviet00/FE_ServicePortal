import HistoryApproval from "../Approval/Components/HistoryApproval"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import leaveRequestApi from "@/api/leaveRequestApi"
import { formatDate } from "@/lib/time"

const ViewOnlyLeaveRq = () => {
    const { t:tApproval } = useTranslation('pendingApproval')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { id } = useParams<{ id: string }>()

    const { data: leaveRequest } = useQuery({
        queryKey: ['get-detail-leave-request'],
        queryFn: async () => {
            const res = await leaveRequestApi.getById(id!);
            return res.data.data;
        },
        enabled: id != null || id != undefined
    });
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-3">
                <h3 className="font-bold text-xl md:text-2xl m-0 pb-2">{tApproval('detail_approval_leave_request.title')}</h3>
            </div>
            <div className="text-left mb-6 border-t border-dashed border-gray-400 pt-2">
                <p className="my-2 text-xl">
                    <strong className="text-blue-600">{tApproval('detail_approval_leave_request.code')}:</strong> <span className="font-bold text-gray-600">{leaveRequest?.code}</span>
                </p>
                <p className="my-2">
                    <strong>{tApproval('detail_approval_leave_request.user_code')}:</strong> {leaveRequest?.userCodeRequestor}
                </p>
                <p className="my-2">
                    <strong>{tApproval('detail_approval_leave_request.user_requestor')}:</strong> {leaveRequest?.userNameRequestor}
                </p>

                <p className="my-2">
                    <strong>{tApproval('detail_approval_leave_request.department')}:</strong> {leaveRequest?.orgUnit.name}
                </p>
                <p className="my-2">
                    <strong>{tApproval('detail_approval_leave_request.position')}:</strong> {leaveRequest?.position}
                </p>

                <p className="my-2">
                    <strong>{tApproval('detail_approval_leave_request.from_date')}:</strong> {formatDate(leaveRequest?.fromDate, 'yyyy-MM-dd HH:mm:ss')}
                </p>

                <p className="my-2">
                    <strong>{tApproval('detail_approval_leave_request.to_date')}:</strong> {formatDate(leaveRequest?.toDate, 'yyyy-MM-dd HH:mm:ss')}
                </p>

                <p className="my-2">
                    <strong>{tApproval('detail_approval_leave_request.type_leave')}</strong> {lang == 'vi' ? leaveRequest?.typeLeave.name : leaveRequest?.typeLeave.nameE}
                </p>

                <p className="my-2">
                    <strong>{tApproval('detail_approval_leave_request.time_leave')}:</strong> {lang == 'vi' ? leaveRequest?.timeLeave.name : leaveRequest?.timeLeave.nameE}
                </p>

                <p className="my-2">
                    <strong>{tApproval('detail_approval_leave_request.reason')}:</strong> {leaveRequest?.reason}
                </p>
            </div>

            <HistoryApproval historyApplicationForm={leaveRequest?.applicationForm?.historyApplicationForms[0]}/>
        </div>
    )
}

export default ViewOnlyLeaveRq
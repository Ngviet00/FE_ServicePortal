import HistoryApproval from "../Approval/Components/HistoryApproval"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import leaveRequestApi from "@/api/leaveRequestApi"
import { formatDate } from "@/lib/time"

const ViewOnlyLeaveRq = () => {
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
        </div>
    )
}

export default ViewOnlyLeaveRq
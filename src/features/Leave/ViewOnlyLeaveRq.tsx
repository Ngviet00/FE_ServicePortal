import HistoryApproval from "../Approval/Components/HistoryApproval"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import leaveRequestApi from "@/api/leaveRequestApi"
import { formatDate } from "@/lib/time"

const dict = {
    vi: {
        loading: 'Đang tải',
        userCode: 'Mã nhân viên',
        userName: 'Họ tên',
        department: 'Bộ phận',
        position: 'Chức vụ',
        leaveType: 'Loại phép',
        leaveTime: 'Thời gian nghỉ',
        fromDate: 'Nghỉ từ ngày',
        toDate: 'Nghỉ đến ngày',
        reason: 'Lý do',
        hrNote: 'Ghi chú HR',
        title: 'Chi tiết đơn nghỉ phép'
    },
    en: {
        loading: 'Loading',
        userCode: 'UserCode',
        userName: 'UserName',
        department: 'Department',
        position: 'Position',
        leaveType: 'Leave type',
        leaveTime: 'Leave time',
        fromDate: 'From date',
        toDate: 'To date',
        reason: 'Reason',
        hrNote: 'HR note',
        title: 'Leave Request Detail'
    }
}

const ViewOnlyLeaveRq = () => {
    const { t:tApproval } = useTranslation('pendingApproval')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { id } = useParams<{ id: string }>()
    const hasId = !!id;
    const tLocal = dict[lang as keyof typeof dict] || dict.en;


    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['leaveRequestForm', id],
        queryFn: async () => {
            const res = await leaveRequestApi.viewDetailLeaveRequestWithHistory(id ?? '');
            return res.data.data;
        },
        enabled: hasId,
    });

    if (hasId && isFormDataLoading) {
        return <div>{tLocal.loading}...</div>;
    }
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0 pb-2">{tApproval('detail_approval_leave_request.title')}</h3>
            </div>
            <div className="text-left mb-6 border-gray-400 pt-2 w-[100%]">
                <div>
                    <p className='my-2 text-[15px]'>
                        <span className="">{tLocal.userCode}: <strong className='mr-2 text-red-700'>{formData?.userCode ?? '--'}</strong></span>,
                        <span className="ml-2">{tLocal.userName}: <strong className='mr-2 text-red-700'>{formData?.userName ?? '--'}</strong></span>,
                        <span className="ml-2">{tLocal.department}: <strong className='mr-2 text-red-700'>{formData?.orgUnit?.name ?? '--'}</strong></span>,
                        <span className="ml-2">{tLocal.position}: <strong className='mr-2 text-red-700'>{formData?.position ?? '--'}</strong></span>,
                        <span className="ml-2">{tLocal.leaveType}: <strong className='mr-2 text-red-700'>{`${formData?.typeLeave?.name}__${formData?.typeLeave?.code}`}</strong></span>,
                        <span className="ml-2">{tLocal.leaveTime}: <strong className='mr-2 text-red-700'>{formData?.timeLeave?.name ?? '--'}</strong></span>
                    </p>
                    <p className='my-2 text-[15px]'>
                        <span className="">{tLocal.fromDate}: <strong className='mr-2 text-red-700'>{formatDate(formData?.fromDate, 'yyyy/MM/dd HH:mm') ?? '--'}</strong></span>, 
                        <span className="ml-2">{tLocal.toDate}: <strong className='mr-2 text-red-700'>{formatDate(formData?.toDate, 'yyyy/MM/dd HH:mm') ?? '--'}</strong></span>,
                        <span className="ml-2">{tLocal.reason}: <strong className='mr-2 text-red-700'>{formData?.reason ?? '--'}</strong></span>
                    </p>
                    {
                        formData?.noteOfHR && (
                            <p className='my-2 text-[15px]'>
                                <span className="font-bold">{tLocal.hrNote}: <strong className='mr-2 text-red-700'>{formData?.noteOfHR ?? '--'}</strong></span>
                            </p>
                        )
                    }
                </div>
            </div>
            <HistoryApproval historyApplicationForm={formData?.applicationForm?.historyApplicationForms}/>
        </div>
    )
}

export default ViewOnlyLeaveRq
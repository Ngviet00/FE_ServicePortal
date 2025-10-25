/* eslint-disable @typescript-eslint/no-explicit-any */
import HistoryApproval from "../Approval/Components/HistoryApproval"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import leaveRequestApi, { useHrExportExcelLeaveRequest } from "@/api/leaveRequestApi"
import { formatDate } from "@/lib/time"
import { X } from "lucide-react"
import useHasPermission from "@/hooks/useHasPermission"
import useHasRole from "@/hooks/useHasRole"
import { RoleEnum } from "@/lib"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"

const dict = {
    vi: {
        loading: 'Đang tải',
        userCode: 'Mã nhân viên',
        userName: 'Họ tên',
        department: 'Bộ phận',
        position: 'Chức vụ',
        leaveType: 'Loại phép',
        leaveTime: 'Thời gian nghỉ',
        fromDate: 'Từ ngày',
        toDate: 'Đến ngày',
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
            const res = await leaveRequestApi.getLeaveByAppliationFormCode(id ?? '');
            return res.data.data;
        },
        enabled: hasId,
    });

    const hrExportExcelLeaveRequest = useHrExportExcelLeaveRequest();
    const handleExport = async () => {
        await hrExportExcelLeaveRequest.mutateAsync(formData?.applicationForm?.id)
    };

    const hasPermissionHRMngLeaveRq = useHasPermission(['leave_request.hr_management_leave_request'])
    const isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR = useHasRole([RoleEnum.HR]) && hasPermissionHRMngLeaveRq; 

    if (hasId && isFormDataLoading) {
        return <div>{tLocal.loading}...</div>;
    }
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0 pb-2">{tApproval('detail_approval_leave_request.title')}</h3>
                {
                    isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR && (
                        <Button
                            variant="outline"
                            disabled={hrExportExcelLeaveRequest.isPending}
                            onClick={handleExport}
                            className="text-xs px-2 bg-blue-700 text-white hover:cursor-pointer hover:bg-dark hover:text-white w-full sm:w-auto"
                        >
                            {hrExportExcelLeaveRequest.isPending ? <Spinner className="text-white" size="small"/> : (lang == 'vi' ? 'Xuất Excel' : 'Export excel')}
                        </Button>
                    )
                }
            </div>
            <div className="text-left mb-6 border-gray-400 pt-2 w-[100%]">
                {
                    formData?.leaveRequests?.map((item: any, idx: number) => {
                        return (
                            <div key={idx} className="flex items-start gap-3 mb-4">
                                <div className="flex flex-col items-center justify-start mt-1">
                                    <span className={`w-7 h-7 flex items-center justify-center rounded-full ${item?.applicationFormItem?.status == false ? 'bg-red-100' : 'bg-gray-200'} text-gray-700 font-semibold text-sm mb-2`}>
                                        {item?.applicationFormItem?.status == true ? (idx + 1) : <X size={18} className="text-red-400"/>}
                                    </span>
                                </div>

                                <div className={`flex-grow border border-gray-200 p-4 rounded-lg shadow-sm ${item?.applicationFormItem?.status == false ? 'bg-red-50' : 'bg-white'}`}>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] leading-relaxed">
                                        <span className="text-gray-700">
                                            {tLocal.userCode}: <strong className="text-red-600">{item?.userCode ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {tLocal.userName}: <strong className="text-red-600">{item?.userName ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {tLocal.department}: <strong className="text-red-600">{item?.orgUnit?.name ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {tLocal.position}: <strong className="text-red-600">{item?.position ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {tLocal.leaveType}: <strong className="text-red-600">
                                                {`${lang == "vi" ? item?.typeLeave?.name : item?.typeLeave?.nameE ?? "--"}__${
                                                    item?.typeLeave?.code ?? "--"
                                                }`}
                                            </strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {tLocal.leaveTime}: <strong className="text-red-600">
                                            {lang == "vi" ? item?.timeLeave?.name : item?.timeLeave?.nameE ?? "--"}
                                            </strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {tLocal.fromDate}: <strong className="text-red-600">
                                            {formatDate(item?.fromDate, "yyyy/MM/dd HH:mm") ?? "--"}
                                            </strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {tLocal.toDate}: <strong className="text-red-600">
                                            {formatDate(item?.toDate, "yyyy/MM/dd HH:mm") ?? "--"}
                                            </strong>
                                        </span>
                                    </div>

                                    <div className="mt-2 text-[15px]">
                                        <span className="text-gray-700">
                                            {tLocal.reason}: <strong className="text-red-600">{item?.reason ?? "--"}</strong>
                                        </span>
                                    </div>

                                    {item?.noteOfHR && (
                                        <div className="mt-2 text-[15px]">
                                            <span className="font-normal text-gray-800">
                                                {tLocal.hrNote}: <strong className="text-red-600">{item?.noteOfHR ?? "--"}</strong>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <HistoryApproval historyApplicationForm={formData?.applicationForm?.historyApplicationForms}/>
        </div>
    )
}

export default ViewOnlyLeaveRq
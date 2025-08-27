import HistoryApproval from "../Approval/Components/HistoryApproval"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import leaveRequestApi from "@/api/leaveRequestApi"
import LeaveRqFormComponent from "./Components/LeaveRqFormComponent"
import typeLeaveApi, { ITypeLeave } from "@/api/typeLeaveApi"

const ViewOnlyLeaveRq = () => {
    const { t:tApproval } = useTranslation('pendingApproval')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { id } = useParams<{ id: string }>()
    const hasId = !!id;

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['leaveRequestForm', id],
        queryFn: async () => {
            const res = await leaveRequestApi.getById(id ?? '');
            return res.data.data;
        },
        enabled: hasId,
    });

    const initialFormData = hasId ? formData : {};
    const { data: typeLeaves } = useQuery<ITypeLeave[], Error>({
        queryKey: ['get-all-type-leave'],
        queryFn: async () => {
            const res = await typeLeaveApi.getAll({});
            return res.data.data;
        },
    });

    if (hasId && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>;
    }
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0 pb-2">{tApproval('detail_approval_leave_request.title')}</h3>
            </div>
            <div className="text-left mb-6 border-gray-400 pt-2 w-[100%]">
                <LeaveRqFormComponent 
                    mode={'approval'}
                    formData={initialFormData}
                    typeLeaves={typeLeaves}
                />
            </div>
            <HistoryApproval historyApplicationForm={formData?.applicationForm?.historyApplicationForms[0]}/>
        </div>
    )
}

export default ViewOnlyLeaveRq
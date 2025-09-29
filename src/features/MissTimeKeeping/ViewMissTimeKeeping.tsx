/* eslint-disable @typescript-eslint/no-explicit-any */
import HistoryApproval from "../Approval/Components/HistoryApproval"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { X } from "lucide-react"
import missTimeKeepingApi from "@/api/missTimeKeepingApi"
import { formatDate } from "@/lib/time"

export default function ViewMissTimeKeeping() {
    const { t } = useTranslation('hr')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { id } = useParams<{ id: string }>()
    const hasId = !!id;

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['miss-timekeeping', id],
        queryFn: async () => {
            const res = await missTimeKeepingApi.getDetailMissTimeKeeping(id ?? '');
            return res.data.data;
        },
        enabled: hasId,
    });

    if (hasId && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('miss_timekeeping.list.title_view')}</h3>
            </div>
            <div className="text-left mb-6 border-gray-400 pt-2 w-[100%]">
                <div className="flex mb-2">
                    <div>
                        {t('miss_timekeeping.list.department')}: <strong>{formData?.applicationForm?.orgUnit?.name}</strong>
                    </div>
                </div>
                {
                    formData?.missTimeKeepings?.map((item: any, idx: number) => {
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
                                            {t('miss_timekeeping.list.usercode')}: <strong className="text-red-600">{item?.userCode ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('miss_timekeeping.list.username')}: <strong className="text-red-600">{item?.userName ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('miss_timekeeping.list.date')}: <strong className="text-red-600">{formatDate(item?.dateRegister ?? "--", 'yyyy-MM-dd')}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('miss_timekeeping.list.shift')}: <strong className="text-red-600">{item?.shift ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('miss_timekeeping.list.additional')}: 
                                            <strong className="text-red-600">
                                                {t('miss_timekeeping.list.in')} {item?.additionalIn ? item?.additionalIn : '--'} , {t('miss_timekeeping.list.out')} {item?.additionalOut ? item?.additionalOut : '--'}
                                            </strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('miss_timekeeping.list.facial_recognition')}: 
                                            <strong className="text-red-600">
                                                {t('miss_timekeeping.list.in')} {item?.facialRecognitionIn ? item?.facialRecognitionIn : '--'} , {t('miss_timekeeping.list.out')} {item?.facialRecognitionOut ? item?.facialRecognitionOut : '--'}
                                            </strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('miss_timekeeping.list.gate')}: 
                                            <strong className="text-red-600">
                                                {t('miss_timekeeping.list.in')} {item?.gateIn ? item?.gateIn : '--'} , {t('miss_timekeeping.list.out')} {item?.gateOut ? item?.gateOut : '--'}
                                            </strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('miss_timekeeping.list.reason')}: 
                                            <strong className="text-red-600">
                                                {item?.reason ? item?.reason : '--'}
                                            </strong>
                                        </span>
                                    </div>

                                    {item?.noteOfHR && (
                                        <div className="mt-2 text-[15px]">
                                            <span className="font-normal text-gray-800">
                                                {t('miss_timekeeping.list.note_of_hr')}: <strong className="text-red-600">{item?.noteOfHR ?? "--"}</strong>
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
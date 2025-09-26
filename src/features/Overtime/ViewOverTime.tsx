/* eslint-disable @typescript-eslint/no-explicit-any */
import HistoryApproval from "../Approval/Components/HistoryApproval"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { formatDate } from "@/lib/time"
import { X } from "lucide-react"
import overTimeApi from "@/api/overTimeApi"

export default function ViewOverTime() {
    const { t } = useTranslation('hr')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { id } = useParams<{ id: string }>()
    const hasId = !!id;

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['overtime', id],
        queryFn: async () => {
            const res = await overTimeApi.getDetailOverTime(id ?? '');
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
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('overtime.list.title_view')}</h3>
            </div>
            <div className="text-left mb-6 border-gray-400 pt-2 w-[100%]">
                <div className="flex mb-2">
                    <div>
                        {t('overtime.list.unit')}: <strong>{formData?.applicationForm?.orgUnitCompany?.name}</strong>
                    </div>
                     <div className="mx-10">
                        {t('overtime.list.type_overtime')}: <strong>
                            {lang == 'vi' ? formData?.applicationForm?.typeOverTime?.name : formData?.applicationForm?.typeOverTime?.nameE}
                        </strong>
                    </div>
                    <div className="mr-10">
                        {t('overtime.list.date_register')}: <strong>{formatDate(formData?.applicationForm?.dateRegister ?? '', 'yyyy-MM-dd') }</strong>
                    </div>
                    <div>
                        {t('overtime.list.department')}: <strong>{formData?.applicationForm?.orgUnit?.name}</strong>
                    </div>
                </div>
                {
                    formData?.overTimes?.map((item: any, idx: number) => {
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
                                            {t('overtime.list.usercode')}: <strong className="text-red-600">{item?.userCode ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.username')}: <strong className="text-red-600">{item?.userName ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.position')}: <strong className="text-red-600">{item?.position ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.from_hour')}: <strong className="text-red-600">{item?.fromHour ?? "--"}(h)</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.to_hour')}: <strong className="text-red-600">{item?.toHour ?? "--"}(h)</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.number_hour')}: <strong className="text-red-600">{item?.numberHour ?? "--"}(h)</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.note')}: <strong className="text-red-600">{item?.note ?? "--"}</strong>
                                        </span>
                                    </div>

                                    {item?.noteOfHR && (
                                        <div className="mt-2 text-[15px]">
                                            <span className="font-normal text-gray-800">
                                                {t('overtime.list.userCode')}:: <strong className="text-red-600">{item?.noteOfHR ?? "--"}</strong>
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
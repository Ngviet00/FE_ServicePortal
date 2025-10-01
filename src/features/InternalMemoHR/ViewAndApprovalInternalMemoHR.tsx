/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { HotTable, HotTableRef } from '@handsontable/react-wrapper'
import { registerAllModules } from 'handsontable/registry'
import internalMemoHrApi, { useApprovalInternalMemo } from "@/api/internalMemoHrApi"
import { RoleEnum, STATUS_ENUM } from "@/lib"
import Handsontable from "handsontable"
import 'handsontable/styles/handsontable.css'
import 'handsontable/styles/ht-theme-main.css'
import HistoryApproval from "../Approval/Components/HistoryApproval"
import ModalConfirm from "@/components/ModalConfirm"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import useHasPermission from "@/hooks/useHasPermission"
import useHasRole from "@/hooks/useHasRole"

registerAllModules();

export default function ViewAndApprovalInternalMemoHR() {
    const { t } = useTranslation('hr')
    const { t:tCommon} = useTranslation('common');
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate()

    const hotRef = useRef<HotTableRef>(null);
    const [noteUserApproval, setNoteUserApproval] = useState<string | null>(null);
    const [tableData, setTableData] = useState<string[][]>([]);
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const queryClient = useQueryClient()
    const approvalInternalMemoHr = useApprovalInternalMemo()
    const [searchParams] = useSearchParams();
    const modeView = searchParams.get("mode") ?? 'view'; 

    const { data: formDataDetail, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['internal-memo-hr', id],
        queryFn: async () => {
            const res = await internalMemoHrApi.getDetailInternalMemoHr(id ?? '');
            const result = res.data.data;
            let metaData: any = null;
            metaData = typeof result.metaData === 'string' ? JSON.parse(result.metaData) : result.metaData;
            result.newMetaData = metaData;
            return result;
        },
        enabled: isEdit,
    });

    const hasPermissionHRMngLeaveRq = useHasPermission(['leave_request.hr_management_leave_request'])
    const isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR = useHasRole([RoleEnum.HR]) && hasPermissionHRMngLeaveRq && formDataDetail?.requestStatus?.id == STATUS_ENUM.WAIT_HR

    useEffect(() => {
        if (isEdit && formDataDetail) {
            const meta = JSON.parse(formDataDetail?.metaData);
            const headers: string[] = meta.Headers ?? [];
            const rows: any[][] = meta.Rows ?? [];
            setTableData([headers, ...rows]);
        }
    }, [formDataDetail, isEdit]);

    const handleSaveModalConfirm = async (type: string) => {
        const payload = {
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: noteUserApproval ?? '',
            applicationFormId: formDataDetail.id,
            RequestTypeId: formDataDetail.requestTypeId
        }

        try {
            await approvalInternalMemoHr.mutateAsync(payload)
            setStatusModalConfirm('')
            navigate("/approval/pending-approval")
            queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
        } catch (err) {
            console.log(err);
        }
    }

    if (isEdit && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4 leave-request-form">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
                <div className="flex flex-col gap-2">
                    <div className="flex">
                        <h3 className="font-bold text-xl md:text-2xl">
                            <span>{t('internal_memo_hr.title_view')} </span>
                        </h3>
                    </div>
                </div>
                <Button onClick={() => navigate("/internal-memo-hr")} className="w-full md:w-auto hover:cursor-pointer">
                    { lang == 'vi' ? 'Danh sách nội bộ' : 'List internal memo' }
                </Button>
            </div>
            <div className="flex items-center mb-1">
                <label className="block mr-2">{t('internal_memo_hr.department')}: <span className="font-semibold text-red-700">{formDataDetail?.orgUnit?.name}</span></label>
            </div>
            <div className="mb-1">
                <label className="">{t('internal_memo_hr.created_by')}: <span className="font-semibold text-red-700">{formDataDetail?.userNameCreatedForm} - {formDataDetail?.userCodeCreatedForm}</span></label> <br />
            </div>
            <div className="flex items-center mb-1">
                <label className="block mr-2">{t('internal_memo_hr.title')}: <span className="font-semibold text-red-700">
                        {formDataDetail?.newMetaData?.Title != 'other' ? t(`internal_memo_hr.${formDataDetail?.newMetaData?.Title}`) : formDataDetail?.newMetaData?.TitleOther}
                    </span>
                </label>
            </div>
            <div className="flex items-center mb-1">
                <label className="block mr-2">{t('internal_memo_hr.save')}: <span className="font-semibold text-red-700">{formDataDetail?.newMetaData?.Save}</span></label>
            </div>
            <div className="flex items-center mb-1">
                <label className="block mr-2">{t('internal_memo_hr.note')}: <span className="font-semibold text-red-700">{formDataDetail?.note}</span></label>
            </div>

            <div className="mt-1">
                <label htmlFor="" className="inline-block mb-2">{t('internal_memo_hr.list')}</label>
                <HotTable
                    readOnly={true}
                    ref={hotRef}
                    data={tableData}
                    fixedRowsTop={1}
                    rowHeaders={true}
                    colHeaders={false}
                    licenseKey="non-commercial-and-evaluation"
                    width="90%"
                    height="auto"
                    stretchH="all"
                    colWidths={130}
                    cells={(row) => {
                        const cellProperties = {} as Handsontable.CellProperties;
                        if (row == 0) {
                            cellProperties.renderer = (instance, td, r, c, prop, value, cellProps) => {
                                Handsontable.renderers.TextRenderer(instance, td, r, c, prop, value, cellProps);
                                td.style.fontWeight = "bold";
                                td.style.textAlign = "center";
                            };
                        }
                        cellProperties.className = "htCenter";

                        return cellProperties;
                    }}
                />
            </div>
            {
                modeView == 'approval' && (
                    <>
                        <div>
                            <Label className='mb-1'>{lang == 'vi' ? 'Chú thích của người duyệt' : 'Note of user approval'}</Label>
                            <Textarea placeholder='Note' value={noteUserApproval ?? ''} onChange={(e) => setNoteUserApproval(e.target.value)} className="border-gray-300"/>
                        </div>

                        <ModalConfirm
                            type={statusModalConfirm}
                            isOpen={statusModalConfirm != ''}
                            onClose={() => setStatusModalConfirm('')}
                            onSave={handleSaveModalConfirm}
                        />

                        <div className="flex justify-end gap-4 mt-8">
                            {
                                isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR ? (
                                    <Button
                                        onClick={() => setStatusModalConfirm('approval')}
                                        className="px-4 py-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                                    >
                                        {lang == 'vi' ? 'Đăng ký' : 'Register'}
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => setStatusModalConfirm('approval')}
                                            disabled={approvalInternalMemoHr.isPending}
                                            className="px-4 py-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                                        >
                                            {tCommon('approval')}
                                        </Button>
                                        <Button
                                            onClick={() => setStatusModalConfirm('reject')}
                                            disabled={approvalInternalMemoHr.isPending}
                                            className="flex items-center justify-center hover:cursor-pointer px-8 py-4 bg-red-600 text-white rounded-[3px] shadow-lg hover:bg-red-700 hover:shadow-xl transform transition-all duration-200 text-base"
                                        >
                                            {tCommon('reject')}
                                        </Button>
                                    </>
                                )
                            }
                        </div>
                    </>
                )
            }

            <HistoryApproval historyApplicationForm={formDataDetail?.historyApplicationForms}/>        
        </div>
    );
}
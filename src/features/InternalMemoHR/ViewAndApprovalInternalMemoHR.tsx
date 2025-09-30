/* eslint-disable @typescript-eslint/no-explicit-any */
import ModalConfirm from "@/components/ModalConfirm"
import HistoryApproval from "../Approval/Components/HistoryApproval"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import useHasRole from "@/hooks/useHasRole"
import { RoleEnum, STATUS_ENUM } from "@/lib"
import useHasPermission from "@/hooks/useHasPermission"
import { Spinner } from "@/components/ui/spinner"
import overTimeApi, { useApprovalOverTime, useHrExportExcelOverTime, useHrNoteOverTime, useRejectSomeOverTime } from "@/api/overTimeApi"
import { formatDate } from "@/lib/time"

export default function ViewAndApprovalInternalMemoHR() {
    const { t } = useTranslation('hr')
    const lang = useTranslation().i18n.language.split('-')[0]
    const [note, setNote] = useState("")
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const { user } = useAuthStore()
    const approvalOverTime = useApprovalOverTime()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const hasId = !!id
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const rejectSomeOverTime = useRejectSomeOverTime()
    const hrNoteOverTime = useHrNoteOverTime()
    const [hrNotes, setHrNotes] = useState<{ [key: string]: string }>({});

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['overtime', id],
        queryFn: async () => {
            const res = await overTimeApi.getDetailOverTime(id ?? '');
            const results = res.data.data;
            results.overTimes = results.overTimes.filter((e: any) => e?.applicationFormItem?.status == true)
            return results;
        },
        enabled: hasId,
    });

    useEffect(() => {
        if (formData?.overTimes) {
            const initNotes: { [key: string]: string } = {};
            formData.overTimes.forEach((item: any) => {
                initNotes[item.id] = item.noteOfHR || "";
            });
            setHrNotes(initNotes);
        }
    }, [formData?.overTimes]);

    const hasPermissionHRMngLeaveRq = useHasPermission(['leave_request.hr_management_leave_request'])
    const isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR = useHasRole([RoleEnum.HR]) && hasPermissionHRMngLeaveRq && formData?.applicationForm?.requestStatus?.id == STATUS_ENUM.WAIT_HR

    const handleSaveModalConfirm = async (type: string) => {
        const payload = {
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note,
            applicationFormId: formData?.applicationForm?.id,
            RequestTypeId: formData?.applicationForm?.requestTypeId
        }

        try {
            if (selectedIds.length > 0 && selectedIds.length != formData?.overTimes?.length) {
                await rejectSomeOverTime.mutateAsync({
                    overTimeIds: selectedIds,
                    note: note,
                    userCodeReject: user?.userCode,
                    userNameReject: user?.userName ?? '',
                    applicationFormCode: id,
                    orgPositionId: user?.orgPositionId
                })
                setStatusModalConfirm('')
                window.location.reload()
                queryClient.invalidateQueries({ queryKey: ['overtime', id] });
            }
            else {
                await approvalOverTime.mutateAsync(payload)
                setStatusModalConfirm('')
                navigate("/approval/pending-approval")
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
        } catch (err) {
            console.log(err);
        }
    }

    //handle selected all
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(formData?.overTimes?.map((item: any) => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    //handle select each item
    const handleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const isAllSelected = formData?.overTimes?.length > 0 && selectedIds.length === formData?.overTimes?.length;

    const hrExportExcelOverTime = useHrExportExcelOverTime();
    const handleExport = async () => {
        await hrExportExcelOverTime.mutateAsync(formData?.applicationForm?.id)
    };

    const handleNoteChange = (id: string, value: string) => {
        setHrNotes((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleHrNote = async (id: string) => {
        const noteText = hrNotes[id];
        if (noteText == '') {
            return
        }

        await hrNoteOverTime.mutateAsync({
            OverTimeId: Number(id),
            UserCode: user?.userCode,
            NoteOfHr: noteText,
            ApplicationFormId: formData?.applicationForm?.id
        })
    };

    if (hasId && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>;
    }
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0 pb-2">{lang == 'vi' ? 'Duyệt tăng ca' : 'Approval overtime'}</h3>
                {
                    isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR && (
                        <Button
                            variant="outline"
                            disabled={hrExportExcelOverTime.isPending}
                            onClick={handleExport}
                            className="text-xs px-2 bg-blue-700 text-white hover:cursor-pointer hover:bg-dark hover:text-white w-full sm:w-auto"
                        >
                            {hrExportExcelOverTime.isPending ? <Spinner className="text-white" size="small"/> : 'Export excel'}
                        </Button>
                    )
                }
            </div>

            <div className="flex mb-3">
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
                formData?.overTimes?.length > 1 && (
                    <div className="select-none flex items-center pl-1">
                        <input 
                            type="checkbox" 
                            id="select-all" 
                            className="w-5 h-5 accent-black rounded cursor-pointer"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="cursor-pointer pl-1">{lang == 'vi' ? 'Chọn tất cả' : 'Selected all'}</label>
                        <span className="mx-3"> | </span>
                        <span>{lang == 'vi' ? 'Đã chọn' : 'Selected'}: <span className="font-bold text-red-700">{selectedIds.length}</span></span>
                    </div>
                )
            }

            <div className="text-left mb-6 border-gray-400 pt-2 w-[100%]">
                {
                    formData?.overTimes?.map((item: any, idx: number) => {
                        return (
                            <div key={idx} className="flex items-start gap-3 mb-4">
                                <div className="flex flex-col items-center justify-start mt-1">
                                    {
                                        formData?.overTimes?.length > 1 && (
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 accent-black rounded cursor-pointer mb-2" 
                                                value={item?.id}
                                                checked={selectedIds.includes(item?.id)}
                                                onChange={() => handleSelect(item?.id)}
                                            />
                                        )
                                    }
                                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold text-sm mb-2">
                                        {idx + 1}
                                    </span>
                                </div>

                                <div className="flex-grow border border-gray-200 p-4 rounded-lg shadow-sm bg-white">
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
                                    {
                                        isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR && (
                                            <div className="mt-2">
                                                <label htmlFor={`note_of_hr_${idx}`} className="font-bold text-[13px]">{lang == 'vi' ? 'HR ghi chú' : 'HR Note'}: </label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    className="border px-2 py-1 w-[30%] rounded-[3px] text-[13px]" 
                                                    id={`note_of_hr_${idx}`} 
                                                    onChange={(e) => handleNoteChange(item.id, e.target.value)} 
                                                    value={hrNotes[item.id] || ""}
                                                />
                                                <button
                                                    disabled={hrNoteOverTime.isPending}
                                                    onClick={() => handleHrNote(item.id)}
                                                    className="ml-1 bg-green-400 hover:bg-green-500 p-1.5 rounded-[3px] text-[13px] cursor-pointer"
                                                >
                                                    {hrNoteOverTime.isPending ? <Spinner className="text-white" size="small"/> : lang == 'vi' ? 'Xác nhận' : 'Save'}
                                                </button>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            <div>
                <Label className='mb-1'>{t('overtime.list.note')}</Label>
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
                                {lang == 'vi' ? 'Đăng ký' : 'Register'}
                            </Button>
                        ) : (
                            <>
                                {
                                    selectedIds.length == 0 && (
                                        <Button
                                            onClick={() => setStatusModalConfirm('approval')}
                                            disabled={approvalOverTime.isPending}
                                            className="px-4 py-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                                        >
                                            {lang == 'vi' ? 'Duyệt' : 'Approval'}
                                        </Button>
                                    )
                                }
                                <Button
                                    onClick={() => setStatusModalConfirm('reject')}
                                    disabled={rejectSomeOverTime.isPending || approvalOverTime.isPending}
                                    className="flex items-center justify-center hover:cursor-pointer px-8 py-4 bg-red-600 text-white rounded-[3px] shadow-lg hover:bg-red-700 hover:shadow-xl transform transition-all duration-200 text-base"
                                >
                                    {lang == 'vi' ? 'Từ chối' : 'Reject'}
                                </Button>
                            </>
                        )
                    }

                </div>
            </div>
            <HistoryApproval historyApplicationForm={formData?.applicationForm?.historyApplicationForms}/>
        </div>
    )
}
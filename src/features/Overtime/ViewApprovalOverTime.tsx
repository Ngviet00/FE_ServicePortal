/* eslint-disable @typescript-eslint/no-explicit-any */
import ModalConfirm from "@/components/ModalConfirm"
import HistoryApproval from "../Approval/Components/HistoryApproval"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { StatusApplicationFormEnum, ViewApprovalProps } from "@/lib"
import { Spinner } from "@/components/ui/spinner"
import overTimeApi, { useApprovalOverTime, useHrExportExcelOverTime, useHrNoteOverTime, useRejectSomeOverTime, useResolvedTaskOverTime } from "@/api/overTimeApi"
import DotRequireComponent from "@/components/DotRequireComponent"
import orgUnitApi from "@/api/orgUnitApi"

export default function ViewApprovalOverTime({id, mode}: ViewApprovalProps) {
    const { t } = useTranslation('hr')
    const lang = useTranslation().i18n.language.split('-')[0]
    const [note, setNote] = useState("")
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const { user } = useAuthStore()
    const approvalOverTime = useApprovalOverTime()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const hasId = !!id
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const rejectSomeOverTime = useRejectSomeOverTime()
    const resolvedOverTime = useResolvedTaskOverTime()

    const hrNoteOverTime = useHrNoteOverTime()
    const [hrNotes, setHrNotes] = useState<{ [key: number]: string }>({});

    const [infoOverTime, setInfoOverTime] = useState<any|null>(null)

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['overtime', id],
        queryFn: async () => {
            const res = await overTimeApi.getDetailOverTime(id ?? '');
            const results = res.data.data;
            if (mode != 'view') {
                results.overTimes = results.overTimes.filter((e: any) => e.ApplicationFormItemStatus == true)
            }
            return results;
        },
        enabled: hasId,
    });

    useEffect(() => {
        if (formData) {
            const ifOt = JSON.parse(formData?.applicationForm?.metaData)
            setInfoOverTime(ifOt)
        }
    }, [formData])

    useEffect(() => {
        if (formData?.overTimes) {
            const initNotes: { [key: number]: string } = {};
            formData.overTimes.forEach((item: any) => {
                initNotes[item.Id] = item.NoteOfHR || "";
            });
            setHrNotes(initNotes);
        }
    }, [formData?.overTimes]);

    const handleSaveModalConfirm = async (type: string) => {
        const payload = {
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note,
            applicationFormId: formData?.applicationForm?.id,
            RequestTypeId: formData?.applicationForm?.requestTypeId,
            RequestStatusId: formData?.applicationForm?.requestStatusId,
        }

        setStatusModalConfirm('')

        try {
            if (type == 'resolved') {
                await resolvedOverTime.mutateAsync(payload);

                if (formData?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned) {
                    navigate('/approval/assigned-tasks')
                } else {
                    navigate('/approval/pending-approval')
                }
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
            else if (selectedIds.length > 0 && selectedIds.length != formData?.overTimes?.length) {
                await rejectSomeOverTime.mutateAsync({
                    applicationFormItemIds: selectedIds,
                    note: note,
                    userCodeReject: user?.userCode,
                    userNameReject: user?.userName ?? '',
                    applicationFormCode: id,
                    orgPositionId: user?.orgPositionId,
                    applicationFormId: formData?.applicationForm?.id,
                })
                queryClient.invalidateQueries({ queryKey: ['overtime', id] });
                setSelectedIds([])
            }
            else {
                await approvalOverTime.mutateAsync(payload)
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
            setSelectedIds(formData?.overTimes?.map((item: any) => item?.ApplicationFormItemId));
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

    const handleNoteChange = (id: number, value: string) => {
        setHrNotes((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleHrNote = async (id: number) => {
        const noteText = hrNotes[id];
        if (noteText == '') {
            return
        }

        await hrNoteOverTime.mutateAsync({
            OverTimeId: id,
            UserCode: user?.userCode,
            NoteOfHr: noteText,
            ApplicationFormId: formData?.applicationForm?.id
        })
    };

    const { data: unitCompanys = [] } = useQuery({ 
        queryKey: ['get-unit-company'], 
        queryFn: async () => { 
            const res = await orgUnitApi.getUnitCompany();
            return res.data.data;
        }
    });

    const { data: typeOverTimes = [] } = useQuery({ 
        queryKey: ['get-type-overtimes'], 
        queryFn: async () => { 
            const res = await overTimeApi.getTypeOverTime();
            return res.data.data; 
        }
    });

    const { data: departments = [] } = useQuery({ 
        queryKey: ['get-all-department'], 
        queryFn: async () => { 
            const res = await orgUnitApi.GetAllDepartment(); 
            return res.data.data;
        }
    })

    if (hasId && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>;
    }
    
    if (!formData) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0 pb-2">{lang == 'vi' ? 'Duyệt tăng ca' : 'Approval overtime'}</h3>
                {
                    [StatusApplicationFormEnum.Assigned, StatusApplicationFormEnum.Complete].includes(formData?.applicationForm?.requestStatusId) && (
                        <Button
                            variant="outline"
                            disabled={hrExportExcelOverTime.isPending}
                            onClick={handleExport}
                            className="text-base p-4 bg-blue-600 text-white hover:cursor-pointer hover:bg-dark hover:text-white w-full sm:w-auto"
                        >
                            {hrExportExcelOverTime.isPending ? <Spinner className="text-white" size="small"/> : lang == 'vi' ? 'Xuất excel' : 'Export excel' }
                        </Button>
                    )
                }
            </div>

            <div className="flex flex-col md:flex-row md:justify-start mb-0">
                <div className="mb-4 mr-15">
                    <label className="block mb-2 font-semibold text-gray-700">{t('overtime.list.unit')} <DotRequireComponent/></label>
                    <div className="flex space-x-4">
                        {
                            unitCompanys?.map((item: any) => (
                                <label key={item?.id} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        disabled
                                        type="radio" 
                                        className="accent-black cursor-pointer" 
                                        name="unit"
                                        value={item?.id} 
                                        checked={infoOverTime?.unit?.id == item?.id}
                                    />
                                    <span>{item?.name}</span>
                                </label>
                            ))
                        }
                    </div>
                </div>

                <div className="mb-4 mr-15">
                    <label className="block mb-2 font-semibold text-gray-700">{t('overtime.list.type_overtime')} <DotRequireComponent/></label>
                    <div className="flex space-x-4">
                        {
                            typeOverTimes?.map((item: any) => {
                                return (
                                    <label key={item?.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input 
                                            disabled
                                            type="radio" 
                                            className="accent-black cursor-pointer" 
                                            name="type_overtime" 
                                            value={item?.id} 
                                            checked={infoOverTime?.type_overtime?.id == item?.id}
                                        />
                                        <span>{lang == 'vi' ? item?.name : item?.nameE}</span>
                                    </label>
                                )
                            })
                        }
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:space-x-8 items-start md:mt-0">
                    <div className="mb-4 md:mb-0">
                        <label className="block mb-2 font-semibold text-gray-700">{t('overtime.list.date_register')} <DotRequireComponent/></label>
                        <span className="text-center font-bold">{infoOverTime?.date_register}</span>
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">{t('overtime.list.department')} <DotRequireComponent/></label>
                        <select
                            disabled
                            className={`bg-gray-50 border cursor-pointer border-gray-500 rounded px-3 py-1`}
                            value={infoOverTime?.department?.id}
                        >
                            <option value="">--{lang == 'vi' ? 'Chọn' : 'Select'}--</option>
                            {
                                departments?.map((item: any, idx: number) => {
                                    return (
                                        <option key={idx} value={item?.id ?? ''}>{item?.name}</option>
                                    )
                                })
                            }
                        </select>
                    </div>
                </div>
            </div>
            {
                mode != 'view' && formData?.applicationForm?.requestStatusId != StatusApplicationFormEnum.Assigned && formData?.overTimes?.length > 1 && (
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
                                {
                                    mode != 'view' && formData?.applicationForm?.requestStatusId != StatusApplicationFormEnum.Assigned && 
                                    <div className="flex flex-col items-center justify-start mt-1">
                                        {
                                            formData?.overTimes?.length > 1 && (
                                                <input 
                                                    type="checkbox" 
                                                    className="w-5 h-5 accent-black rounded cursor-pointer mb-2" 
                                                    value={item?.ApplicationFormItemId}
                                                    checked={selectedIds.includes(item?.ApplicationFormItemId)}
                                                    onChange={() => handleSelect(item?.ApplicationFormItemId)}
                                                />
                                            )
                                        }
                                        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold text-sm mb-2">
                                            {idx + 1}
                                        </span>
                                    </div>
                                }                                

                                <div className={`flex-grow border border-gray-200 p-4 rounded-lg shadow-sm ${item?.ApplicationFormItemStatus ? 'bg-white' : 'bg-red-50'} `}>
                                    {
                                        item?.ApplicationFormItemStatus == false && <span className="text-purple-500 font-bold italic">
                                            {lang == 'vi' ? 'không được duyệt' : 'Rejected'}
                                        </span>
                                    }
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] leading-relaxed">
                                        <span className="text-gray-700">
                                            {t('overtime.list.usercode')}: <strong className="text-red-600">{item?.UserCode ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.username')}: <strong className="text-red-600">{item?.UserName ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.position')}: <strong className="text-red-600">{item?.Position ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.from_hour')}: <strong className="text-red-600">{item?.FromHour ?? "--"}(h)</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.to_hour')}: <strong className="text-red-600">{item?.ToHour ?? "--"}(h)</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.number_hour')}: <strong className="text-red-600">{item?.NumberHour ?? "--"}(h)</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t('overtime.list.note')}: <strong className="text-red-600">{item?.Note ?? "--"}</strong>
                                        </span>
                                    </div>
                                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                        {

                                            ((item?.NoteOfHR != null && item?.NoteOfHR != '') || (mode != 'view' && formData?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned)) && 
                                            <label
                                                htmlFor={`note_of_hr_${idx}`}
                                                className="font-bold text-[13px] mb-1 sm:mb-0 sm:w-auto"
                                            >
                                                {lang === 'vi' ? 'HR ghi chú' : 'HR Note'}:
                                            </label>
                                        }
                                        {
                                            (mode != 'view' && formData?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned) && (
                                                <>
                                                    <input
                                                        required
                                                        type="text"
                                                        id={`note_of_hr_${idx}`}
                                                        className="border px-2 py-1 w-full sm:w-[30%] rounded-[3px] text-[13px]"
                                                        onChange={(e) => handleNoteChange(item?.Id, e.target.value)}
                                                        value={hrNotes[item.Id] || ""}
                                                    />

                                                    <button
                                                        disabled={hrNoteOverTime.isPending}
                                                        onClick={() => handleHrNote(item.Id)}
                                                        className="mt-2 sm:mt-0 sm:ml-1 bg-green-400 hover:bg-green-500 p-1.5 rounded-[3px] text-[13px] cursor-pointer disabled:opacity-50"
                                                    >
                                                        {hrNoteOverTime.isPending ? (
                                                            <Spinner className="text-white" size="small" />
                                                        ) : lang === 'vi' ? 'Xác nhận' : 'Save'}
                                                    </button>
                                                </>
                                            )
                                        }
                                        {
                                            mode == 'view' && item?.NoteOfHR != null && item?.NoteOfHR != '' && <div className="text-[15px]">
                                                <span className="font-normal text-gray-800">
                                                    <strong className="text-red-600">{item?.NoteOfHR ?? "--"}</strong>
                                                </span>
                                            </div>
                                        }
                                    </div>
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

            <div className="flex justify-end">
                {
                    formData?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned ?
                    (
                        mode != 'view' &&
                            <button
                                onClick={() => setStatusModalConfirm('resolved')}
                                disabled={resolvedOverTime.isPending}
                                className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                            >
                                {lang == 'vi' ? 'Đóng' : 'Closed'}
                            </button>
                    ) : [StatusApplicationFormEnum.Complete, StatusApplicationFormEnum.Reject].includes(formData?.applicationForm?.requestStatusId) ? (null) : (
                            mode != 'view' && <>
                            <button
                                onClick={() => setStatusModalConfirm('reject')}
                                disabled={rejectSomeOverTime.isPending || approvalOverTime.isPending}
                                className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-5 bg-red-600 text-white font-semibold rounded-sm shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                            >
                                {lang == 'vi' ? 'Từ chối' : 'Reject'}
                            </button>
                            {
                                selectedIds.length == 0 && 
                                <button
                                    onClick={() => setStatusModalConfirm('approval')}
                                    disabled={approvalOverTime.isPending}
                                    className="cursor-pointer w-full sm:w-auto py-3 px-5 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400"
                                >
                                    {lang == 'vi' ? 'Duyệt đơn' : 'Approval'}
                                </button>
                            }
                        </>
                    )
                }
            </div>
            <div>
                <span className="font-bold text-black">
                    {lang === 'vi' ? 'Quy trình' : 'Approval flow'}:
                </span>{' '}
                {formData?.defineAction
                    .map((item: any, idx: number) => (
                        <span key={idx} className="font-bold text-orange-700">
                            ({idx + 1}) {item?.Name ?? item?.UserCode ?? 'HR'}
                            {idx < formData.defineAction?.length - 1 ? ', ' : ''}
                        </span>
                    ))}
            </div>
            <HistoryApproval historyApplicationForm={formData?.applicationForm?.historyApplicationForms}/>
        </div>
    )
}
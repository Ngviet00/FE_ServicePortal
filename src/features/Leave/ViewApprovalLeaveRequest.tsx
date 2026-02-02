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
import leaveRequestApi, { useApprovalLeaveRq, useHrExportExcelLeaveRequest, useHrNote, useRejectSomeLeaves, useResolvedTaskLeaveRequest } from "@/api/leaveRequestApi"
import { StatusApplicationFormEnum, ViewApprovalProps } from "@/lib"
import { formatDate } from "@/lib/time"
import { Spinner } from "@/components/ui/spinner"

const ViewApprovalLeaveRequest = ({id, mode}: ViewApprovalProps) => {
    const { t } = useTranslation('createLeaveOther')
    const lang = useTranslation().i18n.language.split('-')[0]
    const [note, setNote] = useState("")
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const { user } = useAuthStore()
    const approval = useApprovalLeaveRq()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const hasId = !!id
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const rejectSomeLeaves = useRejectSomeLeaves()
    const hrNote = useHrNote()
    const [hrNotes, setHrNotes] = useState<{ [key: number]: string }>({});
    const resolvedTask = useResolvedTaskLeaveRequest()
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['leaveRequestForm', id],
        queryFn: async () => {
            const res = await leaveRequestApi.getLeaveByAppliationFormCode(id ?? '');
            const results = res.data.data;
            if (mode != 'view') {
                results.leaveRequests = results.leaveRequests.filter((e: any) => e.applicationFormItemStatus == true)
            }
            return results;
        },
        enabled: hasId,
    });

    useEffect(() => {
        if (formData?.leaveRequests) {
            const initNotes: { [key: string]: string } = {};
            formData.leaveRequests.forEach((item: any) => {
                initNotes[item.id] = item.noteOfHR || "";
            });
            setHrNotes(initNotes);
        }
    }, [formData?.leaveRequests]);

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
                await resolvedTask.mutateAsync(payload);

                if (formData?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned) {
                    navigate('/approval/assigned-tasks')
                } else {
                    navigate('/approval/pending-approval')
                }
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
            else if (selectedIds.length > 0 && selectedIds.length != formData?.overTimes?.length) {
                await rejectSomeLeaves.mutateAsync({
                    applicationFormItemIds: selectedIds,
                    note: note,
                    userCodeReject: user?.userCode,
                    userNameReject: user?.userName ?? '',
                    applicationFormCode: id,
                    orgPositionId: user?.orgPositionId,
                    applicationFormId: formData?.applicationForm?.id,
                })
                queryClient.invalidateQueries({ queryKey: ['leaveRequestForm', id] });
                setSelectedIds([])
            }
            else {
                await approval.mutateAsync(payload)
                navigate("/approval/pending-approval")
                queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
            }
            
        } catch (err) {
            console.log(err);
        }
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(formData?.leaveRequests?.map((item: any) => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const isAllSelected = formData?.leaveRequests?.length > 0 && selectedIds.length === formData?.leaveRequests?.length;

    const hrExportExcelLeaveRequest = useHrExportExcelLeaveRequest();
    const handleExport = async () => {
        await hrExportExcelLeaveRequest.mutateAsync(formData?.applicationForm?.id)
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

        await hrNote.mutateAsync({
            LeaveRequestId: Number(id),
            UserCode: user?.userCode,
            NoteOfHr: noteText,
            ApplicationFormId: formData?.applicationForm?.id
        })
    };

    if (hasId && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>;
    }
    
    if (!formData) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0 pb-2">
                    {lang == 'vi' ? `Duyệt nghỉ phép` : `Approval leave request`}
                    <span className="text-red-500 pl-2">{formData?.leaveRequests?.some((e: any) => e.isUrgent == true) ? (lang == 'vi' ? '(Nghỉ phép đột xuất)' : '(Emergency)') : '' }</span>
                </h3>
                {
                    [StatusApplicationFormEnum.Assigned, StatusApplicationFormEnum.Complete].includes(formData?.applicationForm?.requestStatusId) && (
                        <Button
                            variant="outline"
                            disabled={hrExportExcelLeaveRequest.isPending}
                            onClick={handleExport}
                            className="text-base p-4 bg-blue-600 text-white hover:cursor-pointer hover:bg-dark hover:text-white w-full sm:w-auto"
                        >
                            {hrExportExcelLeaveRequest.isPending ? <Spinner className="text-white" size="small"/> : lang == 'vi' ? 'Xuất excel' : 'Export excel' }
                        </Button>
                    )
                }
            </div>
            {
                mode != 'view' && formData?.applicationForm?.requestStatusId != StatusApplicationFormEnum.Assigned && formData?.leaveRequests?.length > 1 && (
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
                    formData?.leaveRequests?.map((item: any, idx: number) => {
                        return (
                            <div key={idx} className="flex items-start gap-3 mb-4">
                                {
                                    mode != 'view' && formData?.applicationForm?.requestStatusId != StatusApplicationFormEnum.Assigned && 
                                    <div className="flex flex-col items-center justify-start mt-1">
                                        {
                                            formData?.leaveRequests?.length > 1 && (
                                                <input 
                                                    type="checkbox" 
                                                    className="w-5 h-5 accent-black rounded cursor-pointer mb-2" 
                                                    value={item?.applicationFormItemId}
                                                    checked={selectedIds.includes(item?.applicationFormItemId)}
                                                    onChange={() => handleSelect(item?.applicationFormItemId)}
                                                />
                                            )
                                        }
                                        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold text-sm mb-2">
                                            {idx + 1}
                                        </span>
                                    </div>
                                }
                                <div className={`flex-grow border border-gray-200 p-4 rounded-lg shadow-sm ${item?.applicationFormItemStatus ? 'bg-white' : 'bg-red-50'} `}>
                                    {
                                        item?.applicationFormItemStatus == false && <span className="text-purple-500 font-bold italic">
                                            {lang == 'vi' ? 'không được duyệt' : 'Rejected'}
                                        </span>
                                    }
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[15px] leading-relaxed">
                                        <span className="text-gray-700">
                                            {t("usercode")}: <strong className="text-red-600">{item?.userCode ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t("name")}: <strong className="text-red-600">{item?.userName ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t("department")}: <strong className="text-red-600">{item?.departmentName ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t("position")}: <strong className="text-red-600">{item?.position ?? "--"}</strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t("type_leave")}: <strong className="text-red-600">
                                                {`${lang == "vi" ? item?.typeLeaveName : item?.typeLeaveNameE ?? "--"}__${
                                                    item?.typeLeaveCode ?? "--"
                                                }`}
                                            </strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t("time_leave")}: <strong className="text-red-600">
                                            {lang == "vi" ? item?.timeLeaveName : item?.timeLeaveNameE ?? "--"}
                                            </strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t("from_date")}: <strong className="text-red-600">
                                            {formatDate(item?.fromDate, "yyyy-MM-dd HH:mm") ?? "--"}
                                            </strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t("to_date")}: <strong className="text-red-600">
                                            {formatDate(item?.toDate, "yyyy-MM-dd HH:mm") ?? "--"}
                                            </strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {t("reason")}: <strong className="text-red-600">
                                            {item?.reason}
                                            </strong>
                                        </span>
                                        <span className="text-gray-700">
                                            {lang == 'vi' ? 'Ngày vào công ty' : 'Date join company'}: <strong className="text-red-600">
                                            {formatDate(item?.dateJoinCompany, "yyyy-MM-dd") ?? "--" }
                                            </strong>
                                        </span>
                                        {/* <span className="text-gray-700 flex items-start">
                                            {lang == 'vi' ? 'Yêu cầu khẩn cấp' : 'Urgent request'}: <input type="checkbox" className="w-5 h-5 ml-1 accent-black" checked={item?.isUrgent} disabled />
                                        </span> */}
                                        <span className="text-gray-700 flex items-center">
                                            {lang == 'vi' ? 'Ảnh' : 'Image'}: 
                                            {
                                                item?.files?.map((f: any) => (
                                                    <img
                                                        key={f?.id}
                                                        src={`${import.meta.env.VITE_API_URL}/vote/get-file/${f.id}`}
                                                        alt={f.fileName}
                                                        className="w-11 h-11 object-cover rounded-md border cursor-pointer mx-1"
                                                        onClick={() =>
                                                            setPreviewImage(`${import.meta.env.VITE_API_URL}/vote/get-file/${f.id}`)
                                                        }
                                                    />
                                                ))
                                            }
                                        </span>
                                    </div>
                                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                        {
                                            ((item?.noteOfHR != null && item?.noteOfHR != '') || (mode != 'view' && formData?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned)) && 
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
                                                        onChange={(e) => handleNoteChange(item?.id, e.target.value)}
                                                        value={hrNotes[item.id] || ""}
                                                    />

                                                    <button
                                                        disabled={hrNote.isPending}
                                                        onClick={() => handleHrNote(item.id)}
                                                        className="mt-2 sm:mt-0 sm:ml-1 bg-green-400 hover:bg-green-500 p-1.5 rounded-[3px] text-[13px] cursor-pointer disabled:opacity-50"
                                                    >
                                                        {hrNote.isPending ? (
                                                            <Spinner className="text-white" size="small" />
                                                        ) : lang === 'vi' ? 'Xác nhận' : 'Save'}
                                                    </button>
                                                </>
                                            )
                                        }
                                        {
                                            mode == 'view' && item?.noteOfHR != null && item?.noteOfHR != '' && <div className="text-[15px]">
                                                <span className="font-normal text-gray-800">
                                                    <strong className="text-red-600">{item?.noteOfHR ?? "--"}</strong>
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
                <Label className='mb-1'>{lang == 'vi' ? 'Ghi chú' : 'Note'}</Label>
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
                                disabled={resolvedTask.isPending}
                                className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                            >
                                {lang == 'vi' ? 'Đóng' : 'Closed'}
                            </button>
                    ) : [StatusApplicationFormEnum.Complete, StatusApplicationFormEnum.Reject].includes(formData?.applicationForm?.requestStatusId) ? (null) : (
                            mode != 'view' && <>
                            <button
                                onClick={() => setStatusModalConfirm('reject')}
                                disabled={rejectSomeLeaves.isPending || approval.isPending}
                                className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-5 bg-red-600 text-white font-semibold rounded-sm shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                            >
                                {lang == 'vi' ? 'Từ chối' : 'Reject'}
                            </button>
                            {
                                selectedIds.length == 0 && 
                                <button
                                    onClick={() => setStatusModalConfirm('approval')}
                                    disabled={approval.isPending}
                                    className="cursor-pointer w-full sm:w-auto py-3 px-5 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400"
                                >
                                    {lang == 'vi' ? 'Duyệt đơn' : 'Approval'}
                                </button>
                            }
                        </>
                    )
                }
            </div>
            <div className="mb-0">
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
            <div>
                {previewImage && <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-999" onClick={() => setPreviewImage(null)}>
                    <img
                        src={previewImage}
                        alt="preview"
                        className="max-h-[90vh] max-w-[90vw] rounded-md shadow-lg"
                        />
                    </div>
                }
            </div>
        </div>
    )
}

export default ViewApprovalLeaveRequest;
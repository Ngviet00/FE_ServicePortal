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
import leaveRequestApi, { useHrExportExcelLeaveRequest, useHrNote, useRejectSomeLeaves } from "@/api/leaveRequestApi"
import { useApproval } from "@/api/approvalApi"
import useHasRole from "@/hooks/useHasRole"
import { RoleEnum, STATUS_ENUM } from "@/lib"
import useHasPermission from "@/hooks/useHasPermission"
import { formatDate } from "@/lib/time"
import { Spinner } from "@/components/ui/spinner"

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
        title: 'Duyệt đơn nghỉ phép',
        export_excel: 'Xuất excel',
        selected: 'Đã chọn',
        selected_all: 'Chọn tất cả'
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
        title: 'Approve leave application',
        export_excel: 'Export excel',
        selected: 'Selected',
        selected_all: 'Select all'
    }
}

const DetailWaitApprovalLeaveRq = () => {
    const lang = useTranslation().i18n.language.split('-')[0]
    const [note, setNote] = useState("")
    const { t } = useTranslation()
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const { user } = useAuthStore()
    const approval = useApproval()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const hasId = !!id
    const tLocal = dict[lang as keyof typeof dict] || dict.en;
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const rejectSomeLeaves = useRejectSomeLeaves()
    const hrNote = useHrNote()
    const [hrNotes, setHrNotes] = useState<{ [key: string]: string }>({});

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['leaveRequestForm', id],
        queryFn: async () => {
            const res = await leaveRequestApi.getLeaveByAppliationFormCode(id ?? '');
            const results = res.data.data;
            results.leaveRequests = results.leaveRequests.filter((e: any) => e?.applicationFormItem?.status == true)
            return res.data.data;
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

    const hasPermissionHRMngLeaveRq = useHasPermission(['leave_request.hr_management_leave_request'])
    const isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR = 
        useHasRole([RoleEnum.HR]) && 
        hasPermissionHRMngLeaveRq && 
        formData?.applicationForm?.requestStatus?.id == STATUS_ENUM.WAIT_HR

    const handleSaveModalConfirm = async (type: string) => {
        const payload = {
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note,
            LeaveRequestId: formData?.id,
            urlFrontend: window.location.origin,
            applicationFormId: formData?.applicationForm?.id,
            RequestTypeId: formData?.applicationForm?.requestTypeId
        }

        try {
            if (selectedIds.length > 0 && selectedIds.length != formData?.leaveRequests?.length) {
                await rejectSomeLeaves.mutateAsync({
                    leaveIds: selectedIds,
                    note: note,
                    userCodeReject: user?.userCode,
                    userNameReject: user?.userName ?? '',
                    applicationFormCode: id,
                    orgPositionId: user?.orgPositionId
                })
                setStatusModalConfirm('')
                window.location.reload()
                queryClient.invalidateQueries({ queryKey: ['leaveRequestForm', id] });
            }
            else {
                await approval.mutateAsync(payload)
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
            setSelectedIds(formData?.leaveRequests?.map((item: any) => item.id));
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

    const isAllSelected = formData?.leaveRequests?.length > 0 && selectedIds.length === formData?.leaveRequests?.length;

    const hrExportExcelLeaveRequest = useHrExportExcelLeaveRequest();
    const handleExport = async () => {
        await hrExportExcelLeaveRequest.mutateAsync(formData?.applicationForm?.id)
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
    
    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0 pb-2">{tLocal.title}</h3>
                {
                    isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR && (
                        <Button
                            variant="outline"
                            disabled={hrExportExcelLeaveRequest.isPending}
                            onClick={handleExport}
                            className="text-xs px-2 bg-blue-700 text-white hover:cursor-pointer hover:bg-dark hover:text-white w-full sm:w-auto"
                        >
                            {hrExportExcelLeaveRequest.isPending ? <Spinner className="text-white" size="small"/> : tLocal.export_excel}
                        </Button>
                    )
                }
            </div>
            {
                formData?.leaveRequests?.length > 1 && (
                    <div className="select-none flex items-center pl-1">
                        <input 
                            type="checkbox" 
                            id="select-all" 
                            className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="cursor-pointer pl-1">{tLocal.selected_all}</label>
                        <span className="mx-3"> | </span>
                        <span>{tLocal.selected}: <span className="font-bold text-red-700">{selectedIds.length}</span></span>
                    </div>
                )
            }

            <div className="text-left mb-6 border-gray-400 pt-2 w-[100%]">
                {
                    formData?.leaveRequests?.map((item: any, idx: number) => {
                        return (
                            <div key={idx} className="flex items-start gap-3 mb-4">
                                <div className="flex flex-col items-center justify-start mt-1">
                                    {
                                        formData?.leaveRequests?.length > 1 && (
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 accent-blue-600 rounded cursor-pointer mb-2" 
                                                value={item?.id}
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => handleSelect(item.id)}
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
                                    {
                                        isHrAndHRPermissionMngLeaverqAndLeaveIsWaitHR && (
                                            <div className="mt-1">
                                                <label htmlFor={`note_of_hr_${idx}`} className="font-bold text-[13px]">HR ghi chú: </label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    className="border px-2 py-1 w-[30%] rounded-[3px] text-[13px]" 
                                                    id={`note_of_hr_${idx}`} 
                                                    onChange={(e) => handleNoteChange(item.id, e.target.value)} 
                                                    value={hrNotes[item.id] || ""}
                                                />
                                                <button
                                                    disabled={hrNote.isPending}
                                                    onClick={() => handleHrNote(item.id)}
                                                    className="ml-1 bg-green-400 hover:bg-green-500 p-1.5 rounded-[3px] text-[13px] cursor-pointer"
                                                >
                                                    Xác nhận
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
                <Label className='mb-1'>{t('note')}</Label>
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
                                            disabled={approval.isPending}
                                            className="px-4 py-2 bg-blue-700 text-white rounded-[3px] shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all duration-200 text-base hover:cursor-pointer"
                                        >
                                            {t('approval')}
                                        </Button>
                                    )
                                }
                                <Button
                                    onClick={() => setStatusModalConfirm('reject')}
                                    disabled={rejectSomeLeaves.isPending || approval.isPending}
                                    className="flex items-center justify-center hover:cursor-pointer px-8 py-4 bg-red-600 text-white rounded-[3px] shadow-lg hover:bg-red-700 hover:shadow-xl transform transition-all duration-200 text-base"
                                >
                                    {t('reject')}
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

export default DetailWaitApprovalLeaveRq
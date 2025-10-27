/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage, ShowToast } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import leaveRequestApi, { useCreateLeaveRequest, useUpdateLeaveRq } from "@/api/leaveRequestApi";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import typeLeaveApi, { ITypeLeave } from "@/api/typeLeaveApi";
import { Checkbox } from "@/components/ui/checkbox";
import userConfigApi from "@/api/userConfigApi";
import LeaveRqFormComponent from "./Components/LeaveRqFormComponent";
import RadioGroup, { RadioOption } from "@/components/RadioGroup";
import ExcelUploader from "@/components/ExcelUploader";

export default function LeaveRequestFormForOthers() {
    const { t } = useTranslation('createLeaveOther')
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate();

    const createLeaveRequest = useCreateLeaveRequest()
    const useUpdateLeaveRequest = useUpdateLeaveRq()

    const [checkReceiveEmail, setCheckReceiveEmail] = useState(false)

    const [selectedRadio, setSelectedRadio] = useState<string>("normal")
    const options: RadioOption[] = [
        { label: lang == 'vi' ? 'Thủ công' : 'Manual', value: "normal" },
        { label: lang == 'vi' ? 'Excel' : 'Excel', value: "excel" },
    ];
    
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    
    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['leaveRequestForm', id],
        queryFn: async () => {
            const res = await leaveRequestApi.getLeaveByAppliationFormCode(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    const mode = isEdit ? 'edit' : 'create';
    const initialFormData = isEdit ? formData?.leaveRequests : {};

    const handleFormSubmit = async (data: any) => {
        try {
            if (isEdit) {
                const payload = data.leaveRequests.map((item: any) => ({
                    Id: item.id,
                    UserCode: item.user_code ?? "",
                    UserName: item.name ?? "",
                    DepartmentId: item.departmentId ?? null,
                    Position: item.position ?? "",
                    FromDate: item.from_date ? item.from_date.replace(" ", "T") + ":00+07:00" : null,
                    ToDate: item.to_date ? item.to_date.replace(" ", "T") + ":00+07:00" : null,
                    TypeLeaveId: item.type_leave ?? null,
                    TimeLeaveId: item.time_leave ?? null,
                    Reason: item.reason ?? ""
                }));

                await useUpdateLeaveRequest.mutateAsync({ id, data: payload });
            }
            else {
                const formData = new FormData();
                formData.append("EmailCreated", user?.email ?? "");
                formData.append("OrgPositionId", String(user?.orgPositionId ?? ""));
                formData.append("UserCodeCreated", user?.userCode ?? "");
                formData.append("UserNameCreated", user?.userName ?? "");

                data.leaveRequests.map((data: any, index: number) => {
                    formData.append(`CreateListLeaveRequests[${index}].UserCode`, data.user_code ?? "");
                    formData.append(`CreateListLeaveRequests[${index}].UserName`, data.name ?? "");
                    formData.append(`CreateListLeaveRequests[${index}].DepartmentId`, data.departmentId ?? "");
                    formData.append(`CreateListLeaveRequests[${index}].Position`, data.position ?? "");
                    formData.append(`CreateListLeaveRequests[${index}].FromDate`, data.from_date ? data.from_date.replace(" ", "T") + ":00+07:00" : "");
                    formData.append(`CreateListLeaveRequests[${index}].ToDate`, data.to_date ? data.to_date.replace(" ", "T") + ":00+07:00" : "");
                    formData.append(`CreateListLeaveRequests[${index}].TypeLeaveId`, data.type_leave ?? "");
                    formData.append(`CreateListLeaveRequests[${index}].TimeLeaveId`, data.time_leave ?? "");
                    formData.append(`CreateListLeaveRequests[${index}].Reason`, data.reason ?? "");
                    if (data.Image) {
                        formData.append(`CreateListLeaveRequests[${index}].Image`, data.Image);
                    }
                })
                await createLeaveRequest.mutateAsync(formData);
            }
            navigate("/leave/leave-registered");
        } catch (err) {
            console.error(err);
            ShowToast(getErrorMessage(err), "error");
        }
    };

    const { data: typeLeaves } = useQuery<ITypeLeave[], Error>({
        queryKey: ['get-all-type-leave'],
        queryFn: async () => {
            const res = await typeLeaveApi.getAll({});
            return res.data.data;
        },
    });

    const { data: receiveEmail } = useQuery({
        queryKey: ['get-email-by-usercode-and-key'],
        queryFn: async () => {
            const res = await userConfigApi.getConfigByUsercodeAndkey({ userCode: user?.userCode, key: "RECEIVE_MAIL_LEAVE_REQUEST" });
            return res.data.data;
        },
        enabled: mode == 'create'
    });

    useEffect(() => {
        if (receiveEmail) {
            setCheckReceiveEmail(receiveEmail.value == "true")
        } else {
            setCheckReceiveEmail(true); 
        }
    }, [receiveEmail])
    
    const handleCheckChange = async (checked: boolean) => {
        try {
            await userConfigApi.saveOrUpdate({
                userCode: user?.userCode,
                key: "RECEIVE_MAIL_LEAVE_REQUEST",
                value: checked ? "true" : "false",
            });
            setCheckReceiveEmail(checked)
            ShowToast(lang == 'vi' ? "Cập nhật thành công" : "Success")
        } catch (error) {
            ShowToast(getErrorMessage(error), "error")
        }
    }

    const handleFormSubmitByExcel = async (file: File) => {
        try {
            const formData = new FormData();

            formData.append("EmailCreated", user?.email ?? '');
            formData.append("OrgPositionId", String(user?.orgPositionId ?? '0'));
            formData.append("UserCodeCreated", user?.userCode ?? '');
            formData.append("UserNameCreated", user?.userName ?? '');
            formData.append("file", file);

            await createLeaveRequest.mutateAsync(formData);

            return true;
        } catch (error) {
            console.error("Upload Excel error:", error);
            return false;
        }
    };

    if (isEdit && isFormDataLoading) {
        return <div className="p-4 text-center">{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>;
    }

    return (
        <div className="p-1 space-y-6 leave-request-form">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                <div className="flex flex-col gap-2 w-full md:w-auto"> 
                    <div className="flex flex-wrap items-center">
                        <h3 className="font-bold text-xl md:text-2xl mr-4">
                            <span>{ isEdit ? t('title_update') : t('sub_title') } </span>
                        </h3>
                        {
                            mode == 'create' && (
                                <div className="flex items-center mt-2 md:mt-0">
                                    <Checkbox
                                        checked={checkReceiveEmail}
                                        onCheckedChange={(checked) => handleCheckChange(!!checked)}
                                        id="receive-mail"
                                        className="w-5 h-5 md:w-6 md:h-6 hover:cursor-pointer"
                                    />
                                    <label
                                        htmlFor="receive-mail"
                                        className="ml-2 text-sm md:text-base font-medium leading-tight hover:cursor-pointer"
                                    >
                                        {lang == 'vi' ? 'Nhận thông báo qua email' : 'Receive notifications via email'}
                                    </label>
                                </div>
                            )
                        }
                    </div>
                </div>

                <div>
                    <Button 
                        onClick={() => navigate("/leave")} 
                        className="w-full md:w-auto hover:cursor-pointer mr-1 mb-1"
                    >
                        { lang == 'vi' ? 'Đơn nghỉ phép của tôi' : 'My Leave Requests'}
                    </Button>
                    <Button 
                        onClick={() => navigate("/leave/leave-registered")} 
                        className="w-full md:w-auto hover:cursor-pointer"
                    >
                        { lang == 'vi' ? 'Danh sách đơn đã đăng ký' : 'Registered Leave Requests'}
                    </Button>
                </div>

            </div>
            
            {
                mode == 'create' && (
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-1"> 
                        <RadioGroup
                            label={lang == 'vi' ? 'Chọn loại đăng ký' : 'Select type register'}
                            options={options}
                            value={selectedRadio}
                            onChange={setSelectedRadio}
                        />
                        <div className="mt-2 lg:mt-0 lg:ml-4"> 
                            <div className="bg-red-400 p-2 text-sm text-white rounded-[3px] w-full lg:w-auto">
                                ** {
                                    lang == 'vi'
                                        ? 'Lưu ý, chỉ nên nhập dữ liệu đăng ký cho chính mình hoặc thành viên cùng tổ'
                                        : 'Note, you should only enter registration data for yourself or member of your team, organization.'
                                }
                            </div>
                        </div>
                    </div>
                )
            }
            {
                selectedRadio == "normal" ? (
                    <div> 
                        <LeaveRqFormComponent 
                            mode={mode}
                            formData={initialFormData}
                            typeLeaves={typeLeaves}
                            onSubmit={handleFormSubmit}
                            isPending={createLeaveRequest.isPending || useUpdateLeaveRequest.isPending}
                        />
                    </div>
                ) : (
                    <ExcelUploader
                        templateFileUrl={`/template_excel/template_nghi_phep_di_tre_ve_som.xlsx`}
                        onSubmit={handleFormSubmitByExcel}
                        isPending={createLeaveRequest.isPending}
                    />
                )
            }
        </div>
    );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage, ShowToast } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import leaveRequestApi, { CreateLeaveRequestDetail, useCreateLeaveRequest, useUpdateLeaveRq } from "@/api/leaveRequestApi";
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

    const useUpdateLeaveRequest = useUpdateLeaveRq();
    const [checkReceiveEmail, setCheckReceiveEmail] = useState(false)
    const [selectedRadio, setSelectedRadio] = useState<string>("normal")

    const options: RadioOption[] = [
        { label: "Đăng ký", value: "normal" },
        { label: "Đăng ký bằng excel", value: "excel" },
    ];
    
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    
    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['leaveRequestForm', id],
        queryFn: async () => {
            const res = await leaveRequestApi.getById(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    const mode = isEdit ? 'edit' : 'create';
    const initialFormData = isEdit ? formData : {};

    const handleFormSubmit = async (data: any) => {
        try {
            if (isEdit) {
                const payload = data.leaveRequests.map((data: any) => formatSingleLeaveRequest(data))[0]
                if (payload == undefined) {
                    ShowToast(lang == 'vi' ? 'Dữ liệu bị lỗi, liên hệ team IT' : 'Data is error, contact to IT Team', 'error')
                    return
                }
                await useUpdateLeaveRequest.mutateAsync({ id: id, data: payload})
            }
            else {
                const payload = {
                    EmailCreated: user?.email,
                    OrgPositionId: user?.orgPositionId,
                    UserCodeCreated: user?.userCode,
                    CreatedBy: user?.userName,
                    CreateLeaveRequestDto: data.leaveRequests.map((data: any) => formatSingleLeaveRequest(data)) 
                };
                await createLeaveRequest.mutateAsync(payload);
            }
            navigate("/leave");
        } catch (err) {
            console.log(err);
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

    const formatSingleLeaveRequest = (values: any): CreateLeaveRequestDetail => ({
        UserCode: values.user_code ?? null,
        UserName: values?.name ?? "",
        DepartmentId: values.departmentId,
        Position: values.position,
        FromDate: values.from_date.replace(" ", "T") + ":00+07:00",
        ToDate: values.to_date.replace(" ", "T") + ":00+07:00",
        TypeLeaveId: parseInt(values.type_leave),
        TimeLeaveId: parseInt(values.time_leave),
        Reason: values.reason,
    });
    
    const handleCheckChange = async (checked: boolean) => {
        try {
            await userConfigApi.saveOrUpdate({
                userCode: user?.userCode,
                key: "RECEIVE_MAIL_LEAVE_REQUEST",
                value: checked ? "true" : "false",
            });
            setCheckReceiveEmail(checked)
            ShowToast("Success")
        } catch (error) {
            ShowToast(getErrorMessage(error), "error")
        }
    }

    const handleFormSubmitByExcel = async (file: File) => {
        const formData = new FormData();

        formData.append("EmailCreated", user?.email ?? '');
        formData.append("OrgPositionId", String(user?.orgPositionId ?? '0'));
        formData.append("UserCodeCreated", user?.email ?? '');
        formData.append("CreatedBy", user?.userName ?? '');
        formData.append("fileExcel", file)

        try {
            await leaveRequestApi.create(formData);
            ShowToast("Success", "success")
            return true

        } catch (err) {
            ShowToast(getErrorMessage(err), "error")
            return false
        }
    };

    if (isEdit && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>;
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4 leave-request-form">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
                <div className="flex flex-col gap-2">
                    <div className="flex">
                        <h3 className="font-bold text-xl md:text-2xl">
                            <span>{ t('sub_title') } </span>
                        </h3>
                        {
                            mode == 'create' && (
                                <div className="flex items-center ml-5">
                                    <Checkbox
                                        checked={checkReceiveEmail}
                                        onCheckedChange={(checked) => handleCheckChange(!!checked)}
                                        id="receive-mail"
                                        className="w-[20px] h-[20px] md:w-[25px] md:h-[25px] hover:cursor-pointer"
                                    />
                                    <label
                                        htmlFor="receive-mail"
                                        className="ml-2 text-sm md:text-base font-medium leading-none hover:cursor-pointer"
                                    >
                                        {lang == 'vi' ? 'Nhận thông báo qua email' : 'Receive notifications via email'}
                                    </label>
                                </div>
                            )
                        }
                    </div>
                </div>

                <Button onClick={() => navigate("/leave")} className="w-full md:w-auto hover:cursor-pointer">
                    { t('list_leave') }
                </Button>
            </div>
            
            <div className="flex">
                <RadioGroup
                    label="Chọn loại đăng ký"
                    options={options}
                    value={selectedRadio}
                    onChange={setSelectedRadio}
                />
                <div>
                    <div className="bg-red-400 inline-block p-1 text-sm text-white rounded-[3px]">
                        **Lưu ý, chỉ nên nhập dữ liệu đăng ký cho chính mình hoặc thành viên cùng tổ
                    </div>
                </div>
            </div>
            {
                selectedRadio == "normal" ? (
                    <div className="w-[100%]">
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
                    />
                )
            }
        </div>
    );
}
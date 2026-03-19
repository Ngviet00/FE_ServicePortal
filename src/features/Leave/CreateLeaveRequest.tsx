/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getErrorMessage, ShowToast, TIME_LEAVE } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import leaveRequestApi, { useCreateLeaveRequest, useUpdateLeaveRq } from "@/api/leaveRequestApi";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import typeLeaveApi, { ITypeLeave } from "@/api/typeLeaveApi";
import { Checkbox } from "@/components/ui/checkbox";
import userConfigApi from "@/api/userConfigApi";
import FullscreenLoader from "@/components/FullscreenLoader";
import { z } from "zod";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DotRequireComponent from "@/components/DotRequireComponent";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import { Trash2, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import moment from "moment";
import React from "react";

export const userLeaveRequestSchema = z.object({
    id: z.number().nullable().optional(),
    userCode: z.string().nonempty({ message: "Bắt buộc." }),
    userName: z.string().nonempty({ message: "Bắt buộc." }),
    department: z.string().nonempty({ message: "Bắt buộc." }),
    departmentId: z.number({ invalid_type_error: "Must be a number" }),
    position: z.string().nonempty({ message: "Bắt buộc." }),
    dateJoinCompany: z.string().nonempty({ message: "Bắt buộc." }),
    availableAnnualLeave: z.number(),
    totalDays: z.number(),

    fromDate: z.string().nonempty({ message: "Bắt buộc." }),
    toDate: z.string().nonempty({ message: "Bắt buộc." }),

    typeLeave: z.string().nonempty({ message: "Bắt buộc." }),

    startPeriod: z.string().nonempty({ message: "Bắt buộc." }),
    endPeriod: z.string().nonempty({ message: "Bắt buộc." }),

    startSession: z.string().nonempty({ message: "Bắt buộc." }),
    endSession: z.string().nonempty({ message: "Bắt buộc." }),

    reason: z.string().nonempty({ message: "Bắt buộc." }),
    image: z.instanceof(File).nullable().optional(),
    existingImgs: z.string().nullable().optional(),
})
export const leaveSchema = z.object({
    userLeaveRequest: z.array(userLeaveRequestSchema)
})
export type LeaveRequestForm = z.infer<typeof leaveSchema>;

export default function CreateLeaveRequest() {
    const { t } = useTranslation('createLeaveOther')
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore((state) => state.user)
    const navigate = useNavigate();
    const createLeaveRequest = useCreateLeaveRequest()
    const updateLeaveRequest = useUpdateLeaveRq()
    const [checkReceiveEmail, setCheckReceiveEmail] = useState(false)
    const [selfRegister, setSelfRegister] = useState(false)
    const lastUserCodesRef = useRef<Record<number, string>>({})
    const [isSearchingUser, setIsSearchingUser] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const todayStr = moment().format('YYYY-MM-DD');
    const next3DaysStr = moment().add(3, 'days').format('YYYY-MM-DD');

    const form = useForm<LeaveRequestForm>({
        resolver: zodResolver(leaveSchema),
        defaultValues: { userLeaveRequest: [
            {
                id: null,
                userCode: '',
                userName: '',
                department: '',
                departmentId: -1,
                position: '',
                dateJoinCompany: '',
                fromDate: todayStr,
                toDate: todayStr,
                startPeriod: '1', //1 công
                endPeriod: '1', //1 công
                startSession: '1', //cả ngày
                endSession: '1', //cả ngày
                availableAnnualLeave: 0,
                totalDays: 0,
                reason: '',
                typeLeave: ''
            }
        ] }
    });
    const { control, watch, handleSubmit,  setValue, getValues, reset, formState: { errors } } = form;
    const { fields, append, remove } = useFieldArray({ control, name: "userLeaveRequest" });

    const { data: typeLeaves } = useQuery<ITypeLeave[], Error>({
        queryKey: ['get-all-type-leave'],
        queryFn: async () => {
            const res = await typeLeaveApi.getAll({});
            return res.data.data;
        },
        select: (data) => data.filter(item => item.typeGroup === 'USER')
    });

    const { data: receiveEmail } = useQuery({
        queryKey: ['get-email-by-usercode-and-key'],
        queryFn: async () => {
            const res = await userConfigApi.getConfigByUsercodeAndkey({ userCode: user?.userCode, key: "RECEIVE_MAIL_LEAVE_REQUEST" });
            return res.data.data;
        },
        enabled: false// mode == 'create'
    });

    useEffect(() => {
        if (receiveEmail) {
            setCheckReceiveEmail(receiveEmail.value == "true")
        } else {
            setCheckReceiveEmail(true); 
        }
    }, [receiveEmail])
    
    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['leaveRequestForm', id],
        queryFn: async () => {
            const res = await leaveRequestApi.getLeaveByAppliationFormCode(id ?? '');
            return res.data.data;
        },
        enabled: isEdit,
    });

    const { data: myUserInfoLeave } = useQuery({
        queryKey: ['my-leave-profile', user?.userCode],
        queryFn: async () => {
            const res = await leaveRequestApi.SearchUserForRegister({
                usercode: user?.userCode ?? '',
                userCodeRegister: user?.userCode ?? '',
                type: 'MNG_LEAVE_REQUEST',
                requestType: 'LEAVE'
            })
            return res.data.data
        },
        enabled: !isEdit
    });

    useEffect(() => {
        if (myUserInfoLeave && !myUserInfoLeave.hasError) {
            reset({
                userLeaveRequest: [
                    {
                        id: myUserInfoLeave?.id,
                        userCode: myUserInfoLeave?.userCode ?? '',
                        userName: myUserInfoLeave?.userName ?? '',
                        department: myUserInfoLeave?.departmentName ?? '',
                        departmentId: myUserInfoLeave?.departmentId ?? '',
                        position: myUserInfoLeave?.unitNameV ?? '',
                        dateJoinCompany: myUserInfoLeave?.entryDate ?? '',
                        availableAnnualLeave: myUserInfoLeave?.available,
                        fromDate: todayStr,
                        toDate: todayStr,
                        startPeriod: '1',
                        endPeriod: '1',
                        startSession: 'ALL',
                        endSession: 'ALL',
                        totalDays: 0,
                        reason: '',
                        typeLeave: ''
                    }
                ]
            })
        }
    }, [myUserInfoLeave, reset, todayStr])

    const watchedRequests = watch("userLeaveRequest");
    
    const getDynamicAvailableAnnualLeave = (userCode: string) => {
        const allRequests = watch("userLeaveRequest") || [];
    
        const firstRow = allRequests.find(r => r.userCode === userCode && r.availableAnnualLeave !== undefined);
        const baseAvailable = Number(firstRow?.availableAnnualLeave || 0);
        const totalDeductedInForm = allRequests.reduce((sum, row) => {
            const type = typeLeaves?.find(t => t.id.toString() === row.typeLeave?.toString());
            if (row.userCode === userCode && ['AL', 'ALM'].includes(type?.code ?? '')) {
                return sum + Number(row.totalDays || 0);
            }
            return sum;
        }, 0);

        return baseAvailable - totalDeductedInForm;
    };

    const handleAddRow = () => {
        append({
            id: null,
            userCode: '',
            userName: '',
            department: '',
            departmentId: -1,
            position: '',
            typeLeave: '',
            fromDate: todayStr,
            toDate: todayStr,
            startPeriod: '1',
            endPeriod: '1',
            startSession: '1',
            endSession: '1',
            reason: '',
            dateJoinCompany: '',
            availableAnnualLeave: -1,
            totalDays: 0
        })
    };

    const handleCheckSeftRegister = (value: boolean) => {
        setSelfRegister(value)
        if (!value) {
            reset({
                userLeaveRequest: [
                    {
                        id: myUserInfoLeave?.id,
                        userCode: myUserInfoLeave?.userCode ?? '',
                        userName: myUserInfoLeave?.userName ?? '',
                        department: myUserInfoLeave?.departmentName ?? '',
                        departmentId: myUserInfoLeave?.departmentId ?? '',
                        position: myUserInfoLeave?.unitNameV ?? '',
                        dateJoinCompany: myUserInfoLeave?.entryDate ?? '',
                        availableAnnualLeave: myUserInfoLeave?.available,
                        fromDate: todayStr,
                        toDate: todayStr,
                        startPeriod: '1',
                        endPeriod: '1',
                        startSession: '1',
                        endSession: '1',
                        totalDays: 0,
                        reason: '',
                        typeLeave: ''
                    }
                ]
            })
            lastUserCodesRef.current = {};
        }
    }

    const handleFindUser = async (userCode: string, index: number) => {
        userCode = userCode.trim();

        if (userCode === lastUserCodesRef.current[index]) {
            return
        }

        if (!userCode) {
            setValue(`userLeaveRequest.${index}.userCode`, "");
            setValue(`userLeaveRequest.${index}.userName`, "");
            setValue(`userLeaveRequest.${index}.department`, "",);
            setValue(`userLeaveRequest.${index}.departmentId`, -1);
            setValue(`userLeaveRequest.${index}.position`, "");
            setValue(`userLeaveRequest.${index}.dateJoinCompany`, "");
            setValue(`userLeaveRequest.${index}.availableAnnualLeave`, -1);
            setValue(`userLeaveRequest.${index}.totalDays`, 0);
            setValue(`userLeaveRequest.${index}.typeLeave`, '');
            lastUserCodesRef.current[index] = "";
            return;
        }

        lastUserCodesRef.current[index] = userCode;

        try {
            setIsSearchingUser(true);
            const fetchData = await leaveRequestApi.SearchUserForRegister({
                userCodeRegister: user?.userCode ?? "",
                usercode: userCode,
                type: 'MNG_LEAVE_REQUEST',
                requestType: 'LEAVE'
            });
            const result = fetchData?.data?.data;
            setValue(`userLeaveRequest.${index}.userName`, result?.userName ?? "", {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.department`, result?.departmentName ?? "", {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.departmentId`, result?.departmentId ?? -1, {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.position`, result?.unitNameV ?? "", {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.dateJoinCompany`, result?.entryDate ?? '', {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.availableAnnualLeave`, result?.available ?? '');
        } catch (err) {
            ShowToast(getErrorMessage(err), "error");
            setValue(`userLeaveRequest.${index}.userName`, '', {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.department`, '', {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.departmentId`, -1, {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.position`, '', {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.dateJoinCompany`, '', {shouldValidate: true});
            setValue(`userLeaveRequest.${index}.availableAnnualLeave`, -1);
            setValue(`userLeaveRequest.${index}.totalDays`, 0);
            setValue(`userLeaveRequest.${index}.typeLeave`, '');
        } finally {
            setIsSearchingUser(false);
        }
    }
    
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

    const onSubmit: SubmitHandler<LeaveRequestForm> = async (data) => {
        const userUsageMap = data.userLeaveRequest.reduce((acc: any, item: any) => {
            const selectedType = typeLeaves?.find((t: any) => t.id == item.typeLeave);
            const isAnnualLeave = selectedType?.code === 'AL' || selectedType?.code === 'ALM';
            
            if (isAnnualLeave) {
                acc[item.userCode] = (acc[item.userCode] || 0) + Number(item.totalDays || 0);
            }
            return acc;
        }, {});

        const errorRequestIndex = data.userLeaveRequest.findIndex((item: any) => {
            const selectedType = typeLeaves?.find((t: any) => t.id == item.typeLeave);
            const isAnnualLeave = selectedType?.code === 'AL' || selectedType?.code === 'ALM';

            if (isAnnualLeave) {
                const baseAvailable = Number(item.availableAnnualLeave || 0);
                const totalDeductedForThisUser = userUsageMap[item.userCode] || 0;

                return totalDeductedForThisUser > baseAvailable;
            }
            return false;
        });

        if (errorRequestIndex !== -1) {
            const rowNumber = errorRequestIndex + 1;
            ShowToast(lang === 'vi' ? `Dòng số ${rowNumber}: Tổng phép đăng ký vượt quá số phép còn lại!` : `Row ${rowNumber}: Total leave exceeds available!`, 'error');
            return;
        }
        
        ShowToast('ok')
        console.log(data);

        // const fd = new FormData()
        // fd.append('OrgPositionIdUserCreatedForm', String(user?.orgPositionId ?? ''))
        // fd.append('UserCodeCreatedForm', user?.userCode ?? '')
        // fd.append('UserNameCreatedForm', user?.userName ?? '')
        // fd.append('DepartmentIdUserCreatedForm', String(user?.departmentId ?? '-1'))

        // data?.userLeaveRequest?.forEach((item, index) => {
        //     fd.append(`CreateListLeaveRequests[${index}].Id`, String(item?.id ?? ''));
        //     fd.append(`CreateListLeaveRequests[${index}].UserCode`, item?.userCode);
        //     fd.append(`CreateListLeaveRequests[${index}].UserName`, item?.userName);
        //     fd.append(`CreateListLeaveRequests[${index}].DepartmentId`, String(item?.departmentId ?? -1));
        //     fd.append(`CreateListLeaveRequests[${index}].Position`, item?.position);
        //     fd.append(`CreateListLeaveRequests[${index}].FromDate`, item?.fromDate);
        //     fd.append(`CreateListLeaveRequests[${index}].ToDate`, item?.toDate);
        //     fd.append(`CreateListLeaveRequests[${index}].DateJoinCompany`, item?.dateJoinCompany);
        //     fd.append(`CreateListLeaveRequests[${index}].TypeLeaveId`, item?.typeLeave);
        //     fd.append(`CreateListLeaveRequests[${index}].TimeLeaveId`, item?.timeLeave);
        //     fd.append(`CreateListLeaveRequests[${index}].Reason`, item?.reason);
        //     fd.append(`CreateListLeaveRequests[${index}].IsUrgent`, String(item?.isUrgent));

        //     item.existingImgs?.forEach((img, i) => {
        //         fd.append(
        //             `CreateListLeaveRequests[${index}].ExistingImgIds[${i}]`,
        //             img?.id?.toString()
        //         );
        //     });

        //     item?.images?.forEach(file => {
        //         fd.append(`CreateListLeaveRequests[${index}].Images`, file);
        //     });
        // });

        // if (isEdit) {
        //     await updateLeaveRequest.mutateAsync({id: id, data: fd})
        // } else {
        //     await createLeaveRequest.mutateAsync(fd);
        // }

        // navigate("/leave/leave-registered");
    }

    // useEffect(() => {
    //     if (formData) {
    //         const userLeaveRequest = (formData.leaveRequests ?? []).map(
    //             (e: any) => ({
    //                 id: e?.id ?? null,
    //                 userCode: e?.userCode ?? '',
    //                 userName: e?.userName ?? '',
    //                 department: e?.departmentName ?? '',
    //                 departmentId: e?.departmentId ?? -1,
    //                 position: e?.position ?? '',
    //                 fromDate: e?.fromDate?.replace('T', ' ').slice(0,16) ?? `${new Date().toISOString().slice(0, 10)} 08:00`,
    //                 toDate: e?.toDate?.replace('T', ' ').slice(0,16) ?? `${new Date().toISOString().slice(0, 10)} 17:00`,
    //                 dateJoinCompany: e?.dateJoinCompany,
    //                 typeLeave: e?.typeLeaveId?.toString(),
    //                 timeLeave: e?.timeLeaveId?.toString(),
    //                 reason: e?.reason,
    //                 isUrgent: e?.isUrgent,
    //                 existingImgs: e?.files ?? []
    //             })
    //         );
    //         reset({
    //             userLeaveRequest
    //         })
    //     }        
    // }, [formData, reset])

    // useEffect(() => {
    //     if (!isEdit) {
    //         reset({
    //             userLeaveRequest: [
    //                 {
    //                     userCode: user?.userCode ?? '',
    //                     userName: user?.userName ?? '',
    //                     department: user?.departmentName ?? '',
    //                     departmentId: user?.departmentId ?? -1,
    //                     position: user?.unitNameV,
    //                     fromDate: `${normalMinDate} 08:00`,
    //                     toDate: `${normalMinDate} 17:00`,
    //                     dateJoinCompany: user?.dateJoinCompany ?? new Date().toISOString().split("T")[0],
    //                     typeLeave: '',
    //                     timeLeave: '',
    //                     reason: '',
    //                     images: [],
    //                     isUrgent: false
    //                 }
    //             ]
    //         });

    //         lastUserCodesRef.current = {};
    //     }
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [isEdit]);

    const calculateAnnualLeaveDeducted = async (index: number) => {
        const rowData = getValues(`userLeaveRequest.${index}`);
        const { userCode, typeLeave, fromDate, toDate, startPeriod, endPeriod } = rowData;

        const selectedType = typeLeaves?.find(t => t.id.toString() === typeLeave?.toString());
        const typeCode = selectedType?.code;

        if (['AL', 'ALM'].includes(typeCode ?? '') && fromDate && toDate && userCode) {
            try {
                const res = await leaveRequestApi.getListHolidayOfUser({
                    userCode: userCode,
                    fromDate: fromDate,
                    toDate: toDate
                });
                
                const offDaysList: string[] = res.data.data || []; 

                const startDayStr = moment(fromDate).format('YYYY-MM-DD');
                const endDayStr = moment(toDate).format('YYYY-MM-DD');
                
                const diffDays = moment(toDate).diff(moment(fromDate), 'days') + 1;

                const isStartOff = offDaysList.includes(startDayStr);
                const isEndOff = offDaysList.includes(endDayStr);

                const startDayVal = isStartOff ? 0 : (startPeriod == '1' ? 1 : 0.5);
                const endDayVal = isEndOff ? 0 : (endPeriod == '1' ? 1 : 0.5);

                let totalDeducted = 0;

                if (diffDays === 1) {
                    totalDeducted = endDayVal;
                } else {
                    let middleDaysCount = 0;
                    
                    for (let i = 1; i < diffDays - 1; i++) {
                        const currentDayStr = moment(fromDate).add(i, 'days').format('YYYY-MM-DD');
                        
                        if (!offDaysList.includes(currentDayStr)) {
                            middleDaysCount++;
                        }
                    }
                    
                    totalDeducted = middleDaysCount + startDayVal + endDayVal;
                }
                setValue(`userLeaveRequest.${index}.totalDays`, Math.max(0, totalDeducted));
            } catch (error) {
                ShowToast(getErrorMessage(error), 'error');
                setValue(`userLeaveRequest.${index}.totalDays`, 0);
            }
        } else {
            setValue(`userLeaveRequest.${index}.totalDays`, 0);
        }
    }

    const handleTypeLeaveChange = async (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        const selectedValue = e.target.value;
        const selectedTypeLeave = typeLeaves?.find(t => t.id.toString() === selectedValue);
        const codeTypeLeaveSelected = selectedTypeLeave?.code;
        const valueDate = (codeTypeLeaveSelected === 'AL' || codeTypeLeaveSelected === 'W') ? next3DaysStr : todayStr;

        setValue(`userLeaveRequest.${index}.typeLeave`, selectedValue)
        setValue(`userLeaveRequest.${index}.fromDate`, `${valueDate} 00:00`)
        setValue(`userLeaveRequest.${index}.toDate`, `${valueDate} 00:00`)

        await calculateAnnualLeaveDeducted(index)
    }

    const handleFromDateChange = async (dateStr: string, index: number) => {
        const toDate = getValues(`userLeaveRequest.${index}.toDate`);
        const typeLeave = getValues(`userLeaveRequest.${index}.typeLeave`);
        const selectedTypeLeave = typeLeaves?.find(t => t.id.toString() === typeLeave?.toString());

        setValue(`userLeaveRequest.${index}.fromDate`, dateStr);

        if (toDate && moment(dateStr).isAfter(moment(toDate))) {
            setValue(`userLeaveRequest.${index}.toDate`, dateStr);
        }

        if (['AL', 'ALM'].includes(selectedTypeLeave?.code ?? '')) {
            await calculateAnnualLeaveDeducted(index);
        }
    };

    const handleToDateChange = async (dateStr: string, index: number) => {
        const fromDate = getValues(`userLeaveRequest.${index}.fromDate`);
        const typeLeave = getValues(`userLeaveRequest.${index}.typeLeave`);
        const selectedTypeLeave = typeLeaves?.find(t => t.id.toString() === typeLeave?.toString());

        let finalToDate = dateStr;

        if (fromDate && moment(dateStr).isBefore(moment(fromDate))) {
            ShowToast("Ngày kết thúc không được nhỏ hơn ngày bắt đầu", 'error');
            finalToDate = fromDate;
            setValue(`userLeaveRequest.${index}.toDate`, fromDate);
        } else {
            setValue(`userLeaveRequest.${index}.toDate`, dateStr);
        }

        if (fromDate && finalToDate.split(' ')[0] === fromDate.split(' ')[0]) {
            const currentTimeTo = getValues(`userLeaveRequest.${index}.startPeriod`);
            setValue(`userLeaveRequest.${index}.startPeriod`, currentTimeTo);
        }

        if (['AL', 'ALM'].includes(selectedTypeLeave?.code ?? '')) {
            await calculateAnnualLeaveDeducted(index);
        }
    };

    if (isEdit && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Loading' : 'Đang tải'}...</div>;
    }

    if (isEdit && !formData) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
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
                            !isEdit && (
                                <div className="flex items-center mt-2 md:mt-0">
                                    <Checkbox
                                        checked={checkReceiveEmail}
                                        onCheckedChange={(checked) => handleCheckChange(!!checked)}
                                        id="receive-mail"
                                        className="w-5 h-5 md:w-6 md:h-6 hover:cursor-pointer border border-gray-700"
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
                    <Button onClick={() => navigate("/leave")} className="w-full md:w-auto hover:cursor-pointer mr-1 mb-1 bg-black hover:bg-black text-white">{ lang == 'vi' ? 'Đơn nghỉ phép của tôi' : 'My Leave Requests'}</Button>
                    <Button onClick={() => navigate("/leave/leave-registered")} className="w-full md:w-auto hover:cursor-pointer bg-black hover:bg-black text-white"> { lang == 'vi' ? 'Danh sách đơn đã đăng ký' : 'Registered Leave Requests'}</Button>
                </div>
            </div>

            <div className="flex justify-between items-center my-2">
                <div className="flex">
                    <div className="flex items-center">
                        <input id="cb_self_register" onChange={(e) => handleCheckSeftRegister(e.target.checked)} checked={selfRegister} type="checkbox"  className="h-5 w-5 accent-black cursor-pointer"/>
                        <label htmlFor="cb_self_register" className="select-none cursor-pointer ml-1">{lang == 'vi' ? 'Đăng ký nghỉ cho người khác' : 'Request leave for someone else'}</label>
                    </div>
                    <div className="ml-5">
                        {
                            !isEdit && selfRegister && <button type="button" onClick={handleAddRow} className="px-4 py-2 mb-1 mr-1 cursor-pointer bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center">
                                {lang == 'vi' ? 'Thêm người nghỉ' : 'Add'}
                            </button>
                        }
                    </div>
                </div>
                <div>
                    {
                        isEdit ? (
                            <button form="batch-leave-form" type="submit" disabled={updateLeaveRequest.isPending}  className="px-4 py-2 mb-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-sm rounded disabled:bg-gray-400 flex items-center justify-center">
                                {updateLeaveRequest.isPending ? <Spinner/> : lang == 'vi' ? 'Cập nhật' : 'Update'}
                            </button>
                        ) : (
                            <button form="batch-leave-form" type="submit" disabled={createLeaveRequest.isPending} className="px-6 py-2 mb-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-base rounded disabled:bg-gray-400 flex items-center justify-center">
                                {createLeaveRequest.isPending ? <Spinner/> : lang == 'vi' ? 'Xác nhận' : 'Save'}
                            </button>
                        )
                    }
                </div>
            </div>

            {isSearchingUser && <FullscreenLoader />}

            <form id="batch-leave-form" onSubmit={handleSubmit(onSubmit, (errors) => {console.log("Submit bị chặn vì lỗi:", errors)})}>
                <div className="bg-white"> 
                    {fields.map((_field, index) => {
                        const isDisabledUserCode = (!isEdit && !selfRegister);

                        const currentTypeLeave = watch(`userLeaveRequest.${index}.typeLeave`);
                        const currentUserName = watch(`userLeaveRequest.${index}.userName`);
                        const currentUserCode = watch(`userLeaveRequest.${index}.userCode`);
                        const typeLeaveSeleceted = typeLeaves?.find(t => t.id.toString() === currentTypeLeave);
                        const codeTypeLeave = typeLeaveSeleceted?.code

                        const isAL = typeLeaveSeleceted?.code == 'AL'

                        const isNext3Day = isAL
                        const isAnnualLeave = codeTypeLeave == 'AL' || codeTypeLeave == 'ALM'

                        const currentFromDate = watch(`userLeaveRequest.${index}.fromDate`);
                        const currentToDate = watch(`userLeaveRequest.${index}.toDate`);
                        const isSameDate = currentFromDate && currentToDate && currentFromDate.split(' ')[0] === currentToDate.split(' ')[0];

                        const deduceDay = watch(`userLeaveRequest.${index}.totalDays`);

                        const remainingAfterThisRow = getDynamicAvailableAnnualLeave(currentUserCode);

                        return (
                            <div key={_field.id} className="bg-white mb-4 border border-gray-200 rounded-lg p-3">
                                <div className="mb-1 grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap gap-1 items-end">
                                    <h2 className="font-bold text-xl text-red-600  mb-1 block">
                                        {`#` + (index + 1)}
                                    </h2>

                                    {/* usercode */}
                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[105px]">
                                        <label className={`block mb-1 text-sm font-medium`}>{t("usercode")} <DotRequireComponent /></label>
                                        <Controller
                                            control={control}
                                            name={`userLeaveRequest.${index}.userCode`}
                                            render={({ field }) => (
                                                <input
                                                    type="text"
                                                    disabled={isDisabledUserCode}
                                                    className={`border border-gray-300 rounded text-sm px-2 py-1 w-full h-[38px] ${isDisabledUserCode ? 'bg-gray-50' : ''} ${errors?.userLeaveRequest?.[index]?.userCode ? 'border border-red-300 bg-red-100' : ''}`}
                                                    placeholder={t("usercode")}
                                                    {...field}
                                                    {...control.register(`userLeaveRequest.${index}.userCode`, {
                                                        onBlur: (e) => handleFindUser(e.target.value, index)
                                                    })}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* username */}
                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[160px]">
                                        <label className={`block mb-1 text-sm font-medium`}>
                                            {t("name")} <DotRequireComponent />
                                        </label>
                                        <input
                                            {...control.register(`userLeaveRequest.${index}.userName`)}
                                            disabled
                                            placeholder={t("name")}
                                            className={` p-2 text-sm border rounded border-gray-300 bg-gray-50 w-full ${errors?.userLeaveRequest?.[index]?.userName ? 'border border-red-300 bg-red-100' : ''}`}
                                        />
                                    </div>
                                    
                                    {/* department */}
                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[150px]">
                                        <label className={`block mb-1 text-sm font-medium`}>
                                            {t("department")} <DotRequireComponent />
                                        </label>
                                        <input
                                            {...control.register(`userLeaveRequest.${index}.department`)}
                                            disabled
                                            placeholder={t("department")}
                                            className={` p-2 text-sm border rounded border-gray-300 bg-gray-50 w-full ${errors?.userLeaveRequest?.[index]?.department ? 'border border-red-300 bg-red-100' : ''}`}
                                        />
                                    </div>

                                    {/* position */}
                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[150px]">
                                        <label className={`block mb-1 text-sm font-medium`}>
                                            {t("position")} <DotRequireComponent />
                                        </label>
                                        <input
                                            {...control.register(`userLeaveRequest.${index}.position`)}
                                            placeholder={t("position")}
                                            className={`p-2 text-sm border rounded w-full ${errors?.userLeaveRequest?.[index]?.position ? 'border border-red-300 bg-red-100' : ''} border-gray-300`}
                                        />
                                    </div>

                                    {/* 1. Loại phép */}
                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[255px]">
                                        <label className={`block mb-1 text-sm font-medium`}>
                                            {t("type_leave")} <DotRequireComponent />
                                        </label>
                                        <select
                                            {...control.register(`userLeaveRequest.${index}.typeLeave`)}
                                            onChange={(e) => handleTypeLeaveChange(e, index)}
                                            className={`p-2 text-sm border rounded hover:cursor-pointer w-full border-gray-300 ${errors?.userLeaveRequest?.[index]?.typeLeave ? 'border-red-300 bg-red-100' : ''}`}
                                        >
                                            <option value="">{t("choose")}</option>
                                            {typeLeaves?.map(item => {
                                                const isDisabled = false //?? (item.code == 'AL' || item.code === 'ALM') && remainingAfterThisRow <= 0;
                                                return (
                                                    <option key={item.id} value={item.id} disabled={isDisabled} className={`${isDisabled ? 'text-gray-300' : ''} text-sm`}>
                                                        {(lang === "vi" ? item.name : item.nameE)}_{item.code}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    {/* from date */}
                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[135px]">
                                        <label className={`block mb-1 text-sm font-medium`}>
                                            {t("from_date")} <DotRequireComponent />
                                        </label>
                                        <DateTimePicker
                                            disabled={codeTypeLeave == '' || codeTypeLeave == undefined ? true : false}
                                            enableTime={isAnnualLeave || codeTypeLeave == 'ND' ? false : true}
                                            minDate={isNext3Day ? next3DaysStr : todayStr}
                                            dateFormat={isAnnualLeave || codeTypeLeave == 'ND' ? 'Y-m-d' : 'Y-m-d H:i'}
                                            initialDateTime={getValues(`userLeaveRequest.${index}.fromDate`)}
                                            onChange={(_selectedDates, dateStr) => handleFromDateChange(dateStr, index)}
                                            className={` text-sm border rounded border-gray-300 p-2 w-full disabled:bg-gray-200`}
                                        />
                                    </div>

                                    {/* time leave from */}
                                    {
                                        !isSameDate && codeTypeLeave != 'ND' && (
                                            <>
                                                <div className="flex flex-col w-full sm:w-full lg:max-w-[110px]">
                                                    <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                                        {t("time_leave")} <DotRequireComponent />
                                                    </label>
                                                    <select
                                                        {...control.register(`userLeaveRequest.${index}.startPeriod`, {
                                                            onChange: (e) => {
                                                                const selectedValue = e.target.value;
                                                                const selectedItem = TIME_LEAVE.find(item => item.value === selectedValue);
                                                                if (selectedItem) {
                                                                    setValue(`userLeaveRequest.${index}.startSession`, selectedItem?.session?.toString());
                                                                }
                                                                calculateAnnualLeaveDeducted(index);
                                                            }
                                                        })}
                                                        className={`p-2 text-sm border rounded hover:cursor-pointer w-full border-gray-300 ${errors?.userLeaveRequest?.[index]?.startPeriod ? 'border border-red-300 bg-red-100' : ''}`}
                                                    >
                                                        {TIME_LEAVE.map((item, idx: number) => (
                                                            <option key={idx} value={item.value}>
                                                                {lang == 'vi' ? item.label : item.labelE}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div><span>-</span></div>
                                            </>
                                        )
                                    }

                                    {/* to date */}
                                    <div className="flex flex-col w-full sm:w-full lg:max-w-[135px]">
                                        <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                            {t("to_date")} <DotRequireComponent />
                                        </label>
                                        <DateTimePicker
                                            disabled={codeTypeLeave == '' || codeTypeLeave == undefined ? true : false}
                                            enableTime={isAnnualLeave || codeTypeLeave == 'ND' ? false : true}
                                            minDate={getValues(`userLeaveRequest.${index}.fromDate`) || todayStr}
                                            dateFormat={isAnnualLeave || codeTypeLeave == 'ND' ? 'Y-m-d' : 'Y-m-d H:i'}
                                            initialDateTime={getValues(`userLeaveRequest.${index}.toDate`)}
                                            onChange={(_selectedDates, dateStr) => handleToDateChange(dateStr, index)}
                                            className={` text-sm border rounded border-gray-300 p-2 w-full disabled:bg-gray-200`}
                                        />
                                    </div>

                                    {/* time leave to */}
                                    {
                                        codeTypeLeave != 'ND' && (
                                            <div className="flex flex-col w-full sm:w-full lg:max-w-[120px]">
                                                <label className={`block mb-1 text-sm font-medium ${index !== 0 ? "xl:hidden" : ""} `}>
                                                    {t("time_leave")} <DotRequireComponent />
                                                </label>
                                                <select
                                                    disabled={watchedRequests[index]?.typeLeave == ''}
                                                    {...control.register(`userLeaveRequest.${index}.endPeriod`, {
                                                        onChange: (e) => {
                                                            const selectedValue = e.target.value;
                                                            const selectedItem = TIME_LEAVE.find(item => item.value === selectedValue);
                                                            if (selectedItem) {
                                                                setValue(`userLeaveRequest.${index}.endSession`, selectedItem?.session?.toString());
                                                            }
                                                            calculateAnnualLeaveDeducted(index)
                                                        }
                                                    })}
                                                    className={`p-2 text-sm disabled:bg-gray-200 border rounded hover:cursor-pointer w-full border-gray-300 ${errors?.userLeaveRequest?.[index]?.endPeriod ? 'border border-red-300 bg-red-100' : ''}`}
                                                >
                                                    {TIME_LEAVE.map((item, idx: number) => (
                                                        <option key={idx} value={item.value}>
                                                            {lang == 'vi' ? item.label : item.labelE}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )
                                    }

                                    <div className="flex items-end">
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>  {
                                                    remove(index);
                                                    lastUserCodesRef.current[index] = '';
                                                }}
                                                className="bg-black text-white rounded p-2 hover:bg-gray-700 transition hover:cursor-pointer"
                                                title={t("delete")}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {
                                        isAnnualLeave &&   
                                        <div className="text-sm italic text-red-500 font-bold">
                                            {lang == 'vi' ? 'Phép trừ' : 'Deduce day'}: {deduceDay}
                                        </div>
                                    }
                                </div>

                                {/* Lý do nghỉ */}
                                <div className="flex-1 pl-7">
                                    <label className={`block mb-1 text-sm font-medium`}>
                                        {lang == 'vi' ? 'Lý do nghỉ' : 'Reason for leave'} <DotRequireComponent />
                                    </label>
                                    <input
                                        {...control.register(`userLeaveRequest.${index}.reason`)}
                                        placeholder={lang == 'vi' ? 'Lý do nghỉ' : 'Reason for leave'}
                                        className={`p-2 text-sm border rounded w-full border-gray-300 ${errors?.userLeaveRequest?.[index]?.reason ? 'border border-red-300 bg-red-100' : ''}`}
                                    />
                                </div>
                                
                                {/* số phép năm và ảnh */}
                                <div className="flex">
                                    <div className="mt-1">
                                        {
                                            currentUserName != '' && <div className={`text-sm font-bold italic pl-7 ${remainingAfterThisRow > 0 ? 'text-blue-600' : remainingAfterThisRow == 0 ? 'text-yellow-600' : 'text-red-500'} `}>
                                                {lang == 'vi' ? 'Phép năm còn' : 'Remaining annual leave'}: {remainingAfterThisRow}
                                            </div>
                                        }
                                    </div>
                                    <div className="pl-9 mt-2 flex">
                                        <div>
                                            <Controller
                                                name={`userLeaveRequest.${index}.image` as const}
                                                control={control}
                                                render={({ field }) => {
                                                    const currentFile = field.value;
                                                    const existingPath = watch(`userLeaveRequest.${index}.existingImgs`);
                                                    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const files = e.target.files;
                                                        if (!files || files.length === 0) return;
                                                        field.onChange(files[0]);
                                                        setValue(`userLeaveRequest.${index}.existingImgs`, null);
                                                        e.target.value = "";
                                                    };

                                                    return (
                                                        <div className="flex gap-2 pl-9">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn bg-blue-500 p-1.5 rounded-sm text-sm text-white cursor-pointer hover:bg-blue-600 shadow-sm"
                                                                    onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                                                                >
                                                                    {lang === 'vi' ? 'Chọn ảnh' : 'Upload image'}
                                                                </button>
                                                                <input
                                                                    id={`file-upload-${index}`}
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={handleFileChange}
                                                                    className="hidden"
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {existingPath && !currentFile && (
                                                                    <div className="relative w-17 h-17">
                                                                        <img
                                                                            src={`${import.meta.env.VITE_API_URL}${existingPath}`}
                                                                            className="w-full h-full object-cover rounded-md border-2 border-gray-200 cursor-zoom-in"
                                                                            onClick={() => setPreviewImage(`${import.meta.env.VITE_API_URL}${existingPath}`)}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="cursor-pointer absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-md"
                                                                            onClick={() => setValue(`userLeaveRequest.${index}.existingImgs`, null)}
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                {currentFile instanceof File && (
                                                                    <SingleImagePreview 
                                                                        file={currentFile} 
                                                                        onRemove={() => field.onChange(null)} 
                                                                        onPreview={(url) => setPreviewImage(url)} 
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
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
            </form>
        </div>
    );
}

const SingleImagePreview = ({ file, onRemove, onPreview }: { 
    file: File, 
    onRemove: () => void, 
    onPreview: (url: string) => void 
}) => {
    const url = React.useMemo(() => URL.createObjectURL(file), [file]);

    React.useEffect(() => {
        return () => URL.revokeObjectURL(url);
    }, [url]);

    return (
        <div className="relative group w-17 h-17">
            <img
                src={url}
                className="w-full h-full object-cover rounded-md border-2 border-blue-400 cursor-zoom-in"
                onClick={() => onPreview(url)}
            />
            <button
                type="button"
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-md hover:scale-110"
                onClick={onRemove}
            >
                <X size={14} />
            </button>
        </div>
    );
};
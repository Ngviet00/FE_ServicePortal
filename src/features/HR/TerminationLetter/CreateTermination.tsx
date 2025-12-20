/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage, ShowToast } from '@/lib';
import userApi from '@/api/userApi';
import FullscreenLoader from '@/components/FullscreenLoader';
import terminationLetterApi, { useCreateTerminationLetter, useUpdateTerminationLetter } from '@/api/HR/terminationLetterApi';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from "react-router-dom";

export const ReasonsTerminationSchema = z.object({
    reason_contractExpired: z.boolean().optional(),
    reason_expulsion: z.boolean().optional(),
    reason_dismiss: z.boolean().optional(),

    reason_absent: z.boolean().optional(),
    reason_absent_text: z.string().optional(),

    reason_failedProbation: z.boolean().optional(),
    reason_disciplinary: z.boolean().optional(),
    reason_contractExpireNotRenew: z.boolean().optional(),
    reason_otherReason: z.boolean().optional(),
})
.refine((r) => {
    const checkboxValues = [
        r.reason_contractExpired, r.reason_expulsion, r.reason_dismiss, r.reason_absent, r.reason_failedProbation, r.reason_disciplinary, r.reason_contractExpireNotRenew, r.reason_otherReason
    ];
    const anyCheckboxChecked = checkboxValues.some(v => v === true);
    return anyCheckboxChecked;
}, {
    message: "Vui lòng chọn ít nhất 1 lý do hoặc nhập ghi chú",
    path: ["_form"],
});

export const HandoverTerminationSchema = z.object({
    handover_uniform: z.boolean().optional(),
    handover_id_card: z.boolean().optional(),
    handover_other_checked: z.boolean().optional(),
    handover_other1: z.string().optional(),
    handover_other2: z.string().optional(),
    handover_other3: z.string().optional(),
});

export const TerminationFormSchema = z.object({
    userCode: z.string().min(1, "Bắt buộc nhập"),
    userName: z.string().min(1, "Bắt buộc nhập"),
    department: z.string().min(1, "Bắt buộc nhập"),
    departmentId: z.number(),
    orgPositionId: z.number().optional(),
    position: z.string().min(1, "Bắt buộc nhập"),
    unit: z.string().min(1, "Bắt buộc nhập"),
    dateJoinCompany: z.string().min(1, "Bắt buộc nhập"),
    lastWorkingDate: z.string().min(1, "Bắt buộc nhập"),
    contractTerminationDate: z.string().min(1, "Bắt buộc nhập"),
    reasons: ReasonsTerminationSchema,
    handover: HandoverTerminationSchema,
});

export type TTerminationLetterForm = z.infer<typeof TerminationFormSchema>;

const CreateTermination: React.FC = () => {
    const { t } = useTranslation('hr')
    const user = useAuthStore(u => u.user)
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const [searchParams] = useSearchParams();
    const userCodeFromParam = searchParams.get("usercode");
    const createTerminationLetter = useCreateTerminationLetter()
    const updateTerminationLetter = useUpdateTerminationLetter()
    const { 
        register, 
        handleSubmit, 
        watch, 
        formState: { errors },
        setValue, 
        getValues,
        reset,
        formState: { isSubmitting } 
    } = useForm<TTerminationLetterForm>({
        resolver: zodResolver(TerminationFormSchema),
        defaultValues: {
            userCode: '',
            userName: '',
            department: '',
            departmentId: 0, 
            orgPositionId: 0,
            position: '',
            unit: '',
            dateJoinCompany: new Date().toISOString().split("T")[0],
            lastWorkingDate: new Date().toISOString().split("T")[0],
            contractTerminationDate: new Date().toISOString().split("T")[0],
            reasons: {
                reason_contractExpired: false,
                reason_expulsion: false,
                reason_dismiss: false,
                reason_absent: false,
                reason_failedProbation: false,
                reason_disciplinary: false,
                reason_contractExpireNotRenew: false,
                reason_otherReason: false,
                reason_absent_text: new Date().toISOString().split("T")[0],
            },
            handover: {
                handover_uniform: false,
                handover_id_card: false,
                handover_other_checked: false,
                handover_other1: '',
                handover_other2: '',
                handover_other3: '',
            }
        }
    });

    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const { data: formDataDetail, isLoading: isLoadingFormDataDetail } = useQuery({
        queryKey: ['termination-letter-detail', id],
        queryFn: async () => {
            try {
                const res = await terminationLetterApi.getByApplicationFormCode(id ?? '');
                return res.data.data;
            } catch {
                return
            }
        },
        enabled: isEdit,
    });

    useEffect(() => {
        if (formDataDetail) {
            const handOverParse = JSON.parse(formDataDetail?.terminationLetter?.handOver ?? "{}");
            const reasonParse = JSON.parse(formDataDetail?.terminationLetter?.reason ?? "{}");

            reset({
                userCode: formDataDetail?.terminationLetter?.userCode ?? '',
                userName: formDataDetail?.terminationLetter?.userName ?? '',
                department: formDataDetail?.terminationLetter?.departmentName ?? '',
                departmentId: formDataDetail?.terminationLetter?.departmentId ?? 0,
                position: formDataDetail?.terminationLetter?.position ?? '',
                unit: formDataDetail?.terminationLetter?.unit ?? '',
                dateJoinCompany: formDataDetail?.terminationLetter?.dateJoinCompany,
                lastWorkingDate: formDataDetail?.terminationLetter?.lastWorkingDate,
                contractTerminationDate: formDataDetail?.terminationLetter?.contractTerminationDate,
                reasons: {
                    reason_contractExpired: reasonParse?.reason_contractExpired,
                    reason_expulsion: reasonParse?.reason_expulsion,
                    reason_dismiss: reasonParse?.reason_dismiss,
                    reason_absent: reasonParse?.reason_absent,
                    reason_failedProbation: reasonParse?.reason_failedProbation,
                    reason_disciplinary: reasonParse?.reason_disciplinary,
                    reason_contractExpireNotRenew: reasonParse?.reason_contractExpireNotRenew,
                    reason_otherReason: reasonParse?.reason_otherReason,
                    reason_absent_text: reasonParse?.reason_absent_text,
                },
                handover: {
                    handover_uniform: handOverParse?.handover_uniform,
                    handover_id_card: handOverParse?.handover_id_card,
                    handover_other_checked: handOverParse?.handover_other_checked,
                    handover_other1: handOverParse?.handover_other1,
                    handover_other2: handOverParse?.handover_other2,
                    handover_other3: handOverParse?.handover_other3,
                }
            });
        }
    }, [formDataDetail, reset])
    
    const handoverOtherChecked = watch("handover.handover_other_checked");
    const absentWatch = watch("reasons.reason_absent");

    const onSubmit: SubmitHandler<TTerminationLetterForm> = async (data) => {
        if (user?.orgPositionId == null || user?.orgPositionId <= 0) {
            ShowToast(lang == 'vi' ? 'Chưa được thiết lập vị trí, liên hệ HR' : 'Org position not set, contact HR', 'error')
            return
        }

        const payload = {
            UserCodeCreatedForm: user?.userCode ?? '',
            UserNameCreatedForm: user?.userName ?? '',
            OrgPositionIdUserCreatedForm: user?.orgPositionId ?? -1,
            UserCode: data.userCode,
            UserName: data.userName,
            DepartmentName: data.department,
            DepartmentId: data.departmentId,
            Position: data.position,
            OrgPositionId: data.orgPositionId ?? -1,
            Unit: data.unit,
            DateJoinCompany: data.dateJoinCompany,
            LastWorkingDate: data.lastWorkingDate,
            ContractTerminationDate: data.contractTerminationDate,
            Reason: JSON.stringify(data.reasons),
            HandOver: JSON.stringify(data.handover)
        }

        if (isEdit) {
            await updateTerminationLetter.mutateAsync({
                id: formDataDetail?.terminationLetter?.id,
                data: payload
            });
        } else {
            await createTerminationLetter.mutateAsync(payload);
        }

        navigate('/termination');
    };
  
    const CheckboxItem: React.FC<{ name: keyof TTerminationLetterForm['reasons'] | keyof TTerminationLetterForm['handover'], label: string, isParent?: boolean }> = ({ name, label, isParent }) => {
        const isReason = name.startsWith('reason');
        const fieldName = isReason ? `reasons.${name}` : `handover.${name}`;
        const isDisabled = false
        const isChecked = watch(fieldName as any) || false;

        return (
            <div className="flex items-center space-x-2">
                <input
                    id={name}
                    type="checkbox"
                    {...register(fieldName as any)}
                    checked={isDisabled ? isChecked : false} 
                    disabled={isDisabled} 
                    className={`form-checkbox accent-black h-5 w-5 rounded ${isDisabled ? 'text-gray-400 border-gray-300' : 'text-indigo-600 border-gray-300'} cursor-pointer`}
                />
                <label htmlFor={name} className={`${isParent ? 'text-base' : 'text-sm'} font-medium text-gray-700 select-none cursor-pointer`}>{label}</label>
            </div>
        );
    };

    const previousUserCodeValueRef = useRef('')
    const [isSearchingUser, setIsSearchingUser] = useState(false)
    const handleFindUser = async () => {
        const value = getValues('userCode')
        await findUserByCode(value);
    }

    useEffect(() => {
        if (userCodeFromParam && userCodeFromParam != null && userCodeFromParam != '') {
            setValue('userCode', userCodeFromParam);
            findUserByCode(userCodeFromParam);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userCodeFromParam]);

    const findUserByCode = async (userCode: string) => {
        if (userCode === previousUserCodeValueRef.current) return;

        previousUserCodeValueRef.current = userCode;

        if (!userCode.trim()) {
            setValue('userCode', '');
            setValue('userName', '');
            setValue('department', '');
            setValue('departmentId', 0);
            setValue('position', '');
            setValue('unit', '');
            setValue('dateJoinCompany', new Date().toISOString().split("T")[0]);
            return;
        }

        try {
            setIsSearchingUser(true);

            const fetchData = await userApi.SearchUserCombineViClockAndWebSystem(userCode);
            const result = fetchData?.data?.data;

            if (!result?.userCode) {
                ShowToast(
                    lang === 'vi' ? 'Không tìm thấy người dùng' : 'User not found',
                    'error'
                );
                return;
            }

            if (!result?.orgPositionId) {
                setValue('userName', result?.userName);
                setValue('department', '');
                setValue('departmentId', 0);
                setValue('position', '');
                setValue('unit', '');
                setValue('dateJoinCompany', new Date().toISOString().split("T")[0]);

                ShowToast(
                    lang === 'vi'
                        ? 'Chưa được thiết lập vị trí, liên hệ với HR'
                        : 'Org position not set yet, contact HR',
                    'error'
                );
                return;
            }

            setValue('userName', result.userName, { shouldValidate: true });
            setValue('department', result.departmentName, { shouldValidate: true });
            setValue('departmentId', result.departmentId);
            setValue('position', result.unitNameV, { shouldValidate: true });
            setValue('unit', result.companyName, { shouldValidate: true });
            setValue('orgPositionId', result.orgPositionId);
            setValue('dateJoinCompany', result.dateJoinCompany);
        }
        catch (err) {
            ShowToast(getErrorMessage(err), "error");
        }
        finally {
            setIsSearchingUser(false);
        }
    };

    if (isEdit && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }
    
    if (isEdit && isLoadingFormDataDetail) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

  
    return (
        <div className="p-1 pl-1 pt-0 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-y-3 gap-x-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('termination.create.title')}</h3>
                <div>
                    <Button 
                        onClick={() => navigate("/termination")} 
                        className="w-full md:w-auto hover:cursor-pointer"
                    >
                        {t('termination.list.title')}
                    </Button>
                </div>
            </div>
            {isSearchingUser && <FullscreenLoader />}
            <div>
                <form onSubmit={handleSubmit(onSubmit,(errors) => {
                        console.log("⛔ Submit bị chặn vì lỗi:", errors);
                    })} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.usercode')}</label>
                            <input
                                disabled={isEdit}
                                {...register("userCode")}
                                onBlur={handleFindUser}
                                type='text'
                                placeholder={t('termination.create.usercode')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm ${isEdit ? 'bg-gray-50' : ''} ${errors.userCode ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.username')}</label>
                            <input
                                {...register("userName")}
                                disabled
                                type='text'
                                placeholder={t('termination.create.username')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm bg-gray-50 border-gray-300 ${errors.userName ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.department')}</label>
                            <input
                                {...register("department")}
                                disabled
                                type='text'
                                placeholder={t('termination.create.department')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm bg-gray-50 border-gray-300 ${errors.department ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.position')}</label>
                            <input
                                {...register("position")}
                                type='text'
                                placeholder={t('termination.create.position')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm border-gray-300 focus:border-blue-500 ${errors.position ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.unit')}</label>
                            <input
                                disabled
                                {...register("unit")}
                                type='text'
                                placeholder={t('termination.create.unit')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm bg-gray-50 border-gray-300 ${errors.unit ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.date_join_company')}</label>
                            <DateTimePicker
                                disabled
                                {...register("dateJoinCompany")}
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={getValues(`dateJoinCompany`)}
                                onChange={(_selectedDates, dateStr) => setValue("dateJoinCompany", dateStr)}
                                className={`dark:bg-[#454545] bg-gray-50 text-sm border rounded-md border-gray-300 p-2 w-full`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.last_working_date')}</label>
                            <DateTimePicker
                                {...register("lastWorkingDate")}
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={getValues(`lastWorkingDate`)}
                                onChange={(_selectedDates, dateStr) => setValue("lastWorkingDate", dateStr)}
                                className={`dark:bg-[#454545] text-sm border rounded-md border-gray-300 p-2 w-full`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('termination.create.contract_expire_date')}</label>
                            <DateTimePicker
                                {...register("contractTerminationDate")}
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={getValues(`contractTerminationDate`)}
                                onChange={(_selectedDates, dateStr) => setValue("contractTerminationDate", dateStr)}
                                className={`dark:bg-[#454545] text-sm border rounded-md border-gray-300 p-2 w-full`}
                            />
                        </div>
                    </div>
                    <div className={`${errors.reasons ? 'bg-red-50 border border-red-300' : 'bg-white border border-gray-200'} p-4 mt-4 rounded-lg shadow-sm transition-all duration-300`}>
                        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4 text-gray-800">
                            {t('termination.create.reason')} 
                            <span className='text-base italic text-red-500 ml-2'>
                                {errors.reasons ? lang === 'vi' ? '(Bắt buộc)' : '(Required)' : ''}
                            </span>
                        </h2>
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-10`}>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_contractExpired" label={`${t('termination.create.contract_expired')}`} isParent={true} />
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_expulsion" label={`${t('termination.create.expulsion')}`} isParent={true}/>
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_dismiss" label={`${t('termination.create.dismiss')}`} isParent={true} />
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_failedProbation" label={`${t('termination.create.failed_probation')}`} isParent={true} />
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_disciplinary" label={`${t('termination.create.disciplinary')}`} isParent={true}/>
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_contractExpireNotRenew" label={`${t('termination.create.contract_expireNotRenew')}`} isParent={true} />
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_otherReason" label={`${t('termination.create.other_reason')}`} isParent={true} />
                            </div>
                            <div className="flex items-start flex-col">
                                <CheckboxItem name="reason_absent" label={`${t('termination.create.absent')}`} isParent={true} />
                                {
                                    absentWatch &&
                                    <div className="mt-2 w-full max-w-xs">
                                        <DateTimePicker
                                            {...register("reasons.reason_absent_text")}
                                            enableTime={false}
                                            dateFormat="Y-m-d"
                                            initialDateTime={getValues(`reasons.reason_absent_text`)}
                                            onChange={(_selectedDates, dateStr) => setValue("reasons.reason_absent_text", dateStr)}
                                            className={`dark:bg-[#454545] text-sm border rounded-md border-gray-300 p-2 w-full`}
                                        />
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='p-4 pt-0 border border-gray-200 rounded-lg shadow-sm bg-white'>
                        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4 text-gray-800">{t('resignation.create.handover')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10">
                            <div className="flex flex-col space-y-3">
                                <CheckboxItem name="handover_uniform" label={t('resignation.create.uniform')} />
                                <CheckboxItem name="handover_id_card" label={t('resignation.create.ID_card')} />
                            </div>
                            <div className="flex flex-col space-y-3">
                                <div className="flex items-start space-x-4">
                                    <div className='flex flex-col w-full'>
                                        <CheckboxItem name="handover_other_checked" label={t('resignation.create.other')} />
                                        <div className='mt-2 pl-6 space-y-2'>
                                            <input 
                                                type="text" 
                                                {...register("handover.handover_other1")}
                                                disabled={!handoverOtherChecked} 
                                                className={`w-full border-b border-dotted border-gray-500 focus:border-solid focus:outline-none p-0.5 text-sm ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : 'bg-transparent'}`}
                                                placeholder="1."
                                            />
                                            <input 
                                                type="text" 
                                                {...register("handover.handover_other2")}
                                                disabled={!handoverOtherChecked} 
                                                className={`w-full border-b border-dotted border-gray-500 focus:border-solid focus:outline-none p-0.5 text-sm ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : 'bg-transparent'}`}
                                                placeholder="2."
                                            />
                                            <input 
                                                type="text" 
                                                {...register("handover.handover_other3")}
                                                disabled={!handoverOtherChecked} 
                                                className={`w-full border-b border-dotted border-gray-500 focus:border-solid focus:outline-none p-0.5 text-sm ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : 'bg-transparent'}`}
                                                placeholder="3."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="cursor-pointer w-full sm:w-auto py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {t('resignation.create.confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTermination;
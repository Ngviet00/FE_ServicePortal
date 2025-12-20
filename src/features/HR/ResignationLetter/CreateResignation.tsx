import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import userApi from '@/api/userApi';
import { ShowToast } from '@/lib';
import resignationLetterApi, { useCreateResignationLetter, useUpdateResignationLetter } from '@/api/HR/resignationLetterApi';

export const ReasonsResignationSchema = z.object({
    reason_contractExpired: z.boolean().optional(),
    reason_notContract: z.boolean().optional(),

    reason_parent3_checked:z.boolean().optional(),
    reason_sick: z.boolean().optional(),
    reason_newJob: z.boolean().optional(),
    reason_study: z.boolean().optional(),
    reason_goHome: z.boolean().optional(),
    reason_family: z.boolean().optional(),
    reason_unsuitable: z.boolean().optional(),

    reason_parent4_checked:z.boolean().optional(),
    reason_poorBenefits: z.boolean().optional(),
    reason_highPressure: z.boolean().optional(),
    reason_poorEnvironment: z.boolean().optional(),
    reason_lowSalary: z.boolean().optional(),

    reason_note: z.string().optional(),
})
.refine((r) => {
    const checkboxValues = [
        r.reason_contractExpired,
        r.reason_notContract, r.reason_sick, r.reason_newJob, r.reason_study, r.reason_goHome, r.reason_family, r.reason_unsuitable,
        r.reason_poorBenefits, r.reason_highPressure, r.reason_poorEnvironment, r.reason_lowSalary,
    ];
    const anyCheckboxChecked = checkboxValues.some(v => v === true);
    return anyCheckboxChecked;
}, {
    message: "Vui lòng chọn ít nhất 1 lý do hoặc nhập ghi chú",
    path: ["_form"],
});

export const HandOverResignationSchema = z.object({
    handover_uniform: z.boolean().optional(),
    handover_id_card: z.boolean().optional(),
    handover_other_checked: z.boolean().optional(),
    handover_other1: z.string().optional(),
    handover_other2: z.string().optional(),
    handover_other3: z.string().optional(),
});

export const ResignationFormSchema = z.object({
    userCode: z.string().min(1, "Bắt buộc nhập"),
    userName: z.string().min(1, "Bắt buộc nhập"),
    department: z.string().min(1, "Bắt buộc nhập"),
    departmentId: z.number(),
    orgPositionId: z.number().optional(),
    position: z.string().min(1, "Bắt buộc nhập"),
    unit: z.string().min(1, "Bắt buộc nhập"),
    dateJoinCompany: z.string().min(1, "Bắt buộc nhập"),
    lastWorkingDate: z.string().min(1, "Bắt buộc nhập"),
    reasons: ReasonsResignationSchema,
    handover: HandOverResignationSchema,
});

export type TResignationForm = z.infer<typeof ResignationFormSchema>;

const CreateResignation: React.FC = () => {
    const { t } = useTranslation('hr')
    const user = useAuthStore(u => u.user)
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const { 
        register, 
        handleSubmit, 
        watch, 
        formState: { errors },
        setValue, 
        getValues,
        reset,
        formState: { isSubmitting } 
    } = useForm<TResignationForm>({
        resolver: zodResolver(ResignationFormSchema),
        defaultValues: {
            userCode: '',
            userName: '',
            department: '',
            departmentId: 0, 
            orgPositionId: 0,
            position: '',
            unit: '',
            dateJoinCompany: new Date().toISOString().split('T')[0],
            lastWorkingDate: new Date().toISOString().split("T")[0],
            reasons: {
                reason_parent3_checked: false,
                reason_parent4_checked: false,
                reason_contractExpired: false,
                reason_notContract: false,
                reason_sick: false,
                reason_newJob: false,
                reason_study: false,
                reason_goHome: false,
                reason_family: false,
                reason_unsuitable: false,
                reason_poorBenefits: false,
                reason_highPressure: false,
                reason_poorEnvironment: false,
                reason_lowSalary: false,
                reason_note: ''
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
        queryKey: ['resignation-letter-detail', id],
        queryFn: async () => {
            try {
                const res = await resignationLetterApi.getByApplicationFormCode(id ?? '');
                return res.data.data;
            } catch {
                return
            }
        },
        enabled: isEdit,
    });

    useEffect(() => {
        if (formDataDetail) {
            const handOverParse = JSON.parse(formDataDetail?.resignationLetter?.handOver ?? "{}");
            const reasonParse = JSON.parse(formDataDetail?.resignationLetter?.reason ?? "{}");

            reset({
                userCode: formDataDetail?.resignationLetter?.userCode ?? '',
                userName: formDataDetail?.resignationLetter?.userName ?? '',
                department: formDataDetail?.resignationLetter?.departmentName ?? '',
                departmentId: formDataDetail?.resignationLetter?.departmentId ?? 0,
                position: formDataDetail?.resignationLetter?.position ?? '',
                unit: formDataDetail?.resignationLetter?.unit ?? '',
                dateJoinCompany: formDataDetail?.resignationLetter?.dateJoinCompany,
                lastWorkingDate: formDataDetail?.resignationLetter?.lastWorkingDate,
                reasons: {
                    reason_contractExpired: reasonParse?.reason_contractExpired ?? false,
                    reason_notContract: reasonParse?.reason_notContract ?? false,
                    reason_sick: reasonParse?.reason_sick ?? false,
                    reason_newJob: reasonParse?.reason_newJob ?? false,
                    reason_study: reasonParse?.reason_study ?? false,
                    reason_goHome: reasonParse?.reason_goHome ?? false,
                    reason_family: reasonParse?.reason_family ?? false,
                    reason_unsuitable: reasonParse?.reason_unsuitable ?? false,
                    reason_poorBenefits: reasonParse?.reason_poorBenefits ?? false,
                    reason_highPressure: reasonParse?.reason_highPressure ?? false,
                    reason_poorEnvironment: reasonParse?.reason_poorEnvironment ?? false,
                    reason_lowSalary: reasonParse?.reason_lowSalary ?? false,
                    reason_note: reasonParse?.reason_note ?? '',
                },
                handover: {
                    handover_uniform: handOverParse?.handover_uniform ?? false,
                    handover_id_card: handOverParse?.handover_id_card ?? false,
                    handover_other_checked: handOverParse?.handover_other_checked ?? false,
                    handover_other1: handOverParse?.handover_other1 ?? '',
                    handover_other2: handOverParse?.handover_other2 ?? '',
                    handover_other3: handOverParse?.handover_other3 ?? '',
                }
            });
        }
    }, [formDataDetail, reset])

    const { data: userDetail  } = useQuery({
        queryKey: ['get-user-info-resignation', user?.userCode],
        queryFn: async () => {
            const fetchData = await userApi.SearchUserCombineViClockAndWebSystem(user?.userCode ?? '');
            return fetchData?.data?.data;
        },
        enabled: !!user?.userCode && !isEdit
    });

    useEffect(() => {
        if (userDetail) {
            reset({
                userCode: userDetail.userCode,
                userName: userDetail.userName,
                department: userDetail.departmentName ?? '',
                departmentId: userDetail.departmentId ?? 0,
                position: userDetail.unitNameV ?? '',
                unit: userDetail.companyName ?? '',
                orgPositionId: userDetail.orgPositionId ?? null,
                dateJoinCompany: userDetail?.dateJoinCompany,
                lastWorkingDate: new Date().toISOString().split("T")[0],
            });
        }
    }, [reset, userDetail]);
    
    const handoverOtherChecked = watch("handover.handover_other_checked");

    const createResignation = useCreateResignationLetter()
    const updateResignation = useUpdateResignationLetter()
    const onSubmit: SubmitHandler<TResignationForm> = async (data) => {
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
            Reason: JSON.stringify(data.reasons),
            HandOver: JSON.stringify(data.handover)
        }

        if (isEdit) {
            await updateResignation.mutateAsync({
                id: formDataDetail?.resignationLetter?.id,
                data: payload
            });
        } else {
            await createResignation.mutateAsync(payload);
        }

        navigate('/resignation')
    };
  
    const CheckboxItem: React.FC<{ name: keyof TResignationForm['reasons'] | keyof TResignationForm['handover'], label: string, isParent?: boolean }> = ({ name, label, isParent }) => {
        const isReason = name.startsWith('reason');
        const fieldName = isReason ? `reasons.${name}` : `handover.${name}`;
        const isDisabled = name == 'reason_parent3_checked' || name == 'reason_parent4_checked'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isChecked = watch(fieldName as any) || false;

        return (
            <div className="flex items-center space-x-2">
                <input
                    id={name}
                    type="checkbox"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...register(fieldName as any)}
                    checked={isDisabled ? isChecked : false} 
                    disabled={isDisabled} 
                    className={`form-checkbox accent-black h-5 w-5 rounded ${isDisabled ? 'text-gray-400 border-gray-300' : 'text-indigo-600 border-gray-300'} cursor-pointer`}
                />
                <label htmlFor={name} className={`${isParent ? 'text-base' : 'text-sm'} font-medium text-gray-700 select-none cursor-pointer`}>{label}</label>
            </div>
        );
    };

    if (isEdit && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }
    
    if (isEdit && isLoadingFormDataDetail) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }
  
    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-3">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('resignation.create.title')}</h3>
                <div>
                    <Button onClick={() => navigate("/resignation")} className="w-full md:w-auto hover:cursor-pointer">
                        {t('resignation.list.title')}
                    </Button>
                </div>
            </div>
            <div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-1">
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.usercode')}</label>
                            <div className="relative">
                                <input
                                    disabled={true}
                                    {...register("userCode")}
                                    type='text'
                                    placeholder={t('resignation.create.usercode')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.userCode ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.username')}</label>
                            <div className="relative">
                                <input
                                    {...register("userName")}
                                    disabled
                                    type='text'
                                    placeholder={t('resignation.create.username')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.userName ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.department')}</label>
                            <div className="relative">
                                <input
                                    {...register("department")}
                                    disabled
                                    type='text'
                                    placeholder={t('resignation.create.department')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.department ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.position')}</label>
                            <div className="relative">
                                <input
                                    {...register("position")}
                                    type='text'
                                    placeholder={t('resignation.create.position')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm  ${errors.position ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.date_join_company')}</label>
                            <div className="relative">
                                <DateTimePicker
                                    {...register("dateJoinCompany")}
                                    enableTime={false}
                                    dateFormat="Y-m-d"
                                    disabled
                                    initialDateTime={getValues(`dateJoinCompany`)}
                                    onChange={(_selectedDates, dateStr) =>
                                        setValue("dateJoinCompany", dateStr)
                                    }
                                    className={`dark:bg-[#454545] text-sm border rounded bg-gray-50 border-gray-300 p-2 w-full`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('resignation.create.last_day_employment')}</label>
                            <div className="relative">
                                <DateTimePicker
                                    {...register("lastWorkingDate")}
                                    enableTime={false}
                                    dateFormat="Y-m-d"
                                    initialDateTime={getValues(`lastWorkingDate`)}
                                    onChange={(_selectedDates, dateStr) =>
                                        setValue("lastWorkingDate", dateStr)
                                    }
                                    className={`dark:bg-[#454545] text-sm border rounded border-gray-300 p-2 w-full`}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={`${errors.reasons ? 'bg-red-50 border border-red-300' : 'bg-white border border-gray-200'} p-4 mt-4 rounded-lg shadow-sm transition-all duration-300`}>
                        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2">
                            {t('resignation.create.reason')} <span className='text-base italic text-red-500'>{errors.reasons ? lang == 'vi' ? '(Bắt buộc)' : '(Required)' : ''}</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-x-10 mb-2">
                            <div className="flex items-start">
                                <CheckboxItem name="reason_contractExpired" label={`1. ${t('resignation.create.contract_expire')}`} isParent={true} />
                            </div>
                            <div className="flex items-start">
                                <CheckboxItem name="reason_notContract" label={`2. ${t('resignation.create.non_renew_contract')}`} isParent={true}/>
                            </div>
                        </div>
                        
                        <div className="mb-2">
                            <div className="flex items-start mb-2">
                                <CheckboxItem name="reason_parent3_checked" label={`3. ${t('resignation.create.personal_reason')}`} isParent={true} />
                            </div>
                            <div className="grid grid-cols-2 gap-x-10 gap-y-2 pl-8 border-l border-gray-300 ml-2 py-2">
                                <CheckboxItem name="reason_sick" label={t('resignation.create.sick')} />
                                <CheckboxItem name="reason_newJob" label={t('resignation.create.new_employment')} />
                                <CheckboxItem name="reason_study" label={t('resignation.create.further_studies')} />
                                <CheckboxItem name="reason_goHome" label={t('resignation.create.return_hometown')} />
                                <CheckboxItem name="reason_family" label={t('resignation.create.family_matter')} />
                                <CheckboxItem name="reason_unsuitable" label={t('resignation.create.unsuitable_work')} />
                            </div>
                        </div>
                
                        <div className="mb-2">
                            <div className="flex items-start mb-1">
                                <CheckboxItem name="reason_parent4_checked" label={`4. ${t('resignation.create.other_reason')}`} isParent={true} />
                            </div>

                            <div className="grid grid-cols-2 gap-x-10 gap-y-2 pl-8 border-l border-gray-300 ml-2 py-2">
                                <CheckboxItem name="reason_poorBenefits" label={t('resignation.create.poor_benifit')} />
                                <CheckboxItem name="reason_highPressure" label={t('resignation.create.high_pressure')} />
                                <CheckboxItem name="reason_poorEnvironment" label={t('resignation.create.unfavorable_working_environment')} />
                                <CheckboxItem name="reason_lowSalary" label={t('resignation.create.low_salary')} />
                            </div>
                        </div>
                
                        <div className="mb-2">
                            <div className="flex items-start mb-1">
                                <div className='ml-2 w-full'>
                                    <p className="font-semibold mb-1 text-gray-700">{`5. ${t('resignation.create.additional_remarks')}`}</p>
                                    <textarea
                                        {...register("reasons.reason_note")}
                                        className="w-full h-16 p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder={lang == 'vi' ? 'Lý do bổ sung' : 'Additional remarks'}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='p-4 pt-0 border border-gray-200 rounded-lg shadow-sm bg-white'>
                        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 my-2">{t('resignation.create.handover')}</h2>
                        <div className="grid grid-cols-2 gap-x-10">
                            <div className="flex flex-col space-y-3">
                                <CheckboxItem name="handover_uniform" label={t('resignation.create.uniform')} />
                                <CheckboxItem name="handover_id_card" label={t('resignation.create.ID_card')} />
                            </div>
                            <div className="flex flex-col space-y-3">
                                <div className="flex items-start space-x-4">
                                    <CheckboxItem name="handover_other_checked" label={t('resignation.create.other')} />
                                    <div className='flex flex-col w-64'>
                                        <input 
                                            type="text" 
                                            {...register("handover.handover_other1")}
                                            disabled={!handoverOtherChecked} 
                                            className={`border-b border-dotted border-gray-500 focus:border-solid focus:outline-none mb-1 p-0.5 ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : ''}`}
                                            placeholder="1."
                                        />
                                        <input 
                                            type="text" 
                                            {...register("handover.handover_other2")}
                                            disabled={!handoverOtherChecked} 
                                            className={`border-b border-dotted border-gray-500 focus:border-solid focus:outline-none mb-1 p-0.5 ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : ''}`}
                                            placeholder="2."
                                        />
                                        <input 
                                            type="text" 
                                            {...register("handover.handover_other3")}
                                            disabled={!handoverOtherChecked} 
                                            className={`border-b border-dotted border-gray-500 focus:border-solid focus:outline-none mb-1 p-0.5 ${!handoverOtherChecked ? 'bg-gray-100 text-gray-400' : ''}`}
                                            placeholder="3."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className=" flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="cursor-pointer w-full sm:w-auto py-3 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400"
                        >
                            {t('resignation.create.confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateResignation;
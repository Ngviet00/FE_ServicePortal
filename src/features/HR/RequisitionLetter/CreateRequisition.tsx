/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ShowToast } from '@/lib';
import { useQuery } from '@tanstack/react-query';
import requisitionLetterApi, { useCreateRequisitionLetter, useUpdateRequisitionLetter } from '@/api/HR/requisitionApi';

export const ReasonSchema = z.object({
    reason_expand: z.boolean().optional(),
    reason_replace: z.boolean().optional(),
    reason_temporary: z.boolean().optional(),
    reason_hr_reserve: z.boolean().optional(),
});

export const MarriageSchema = z.object({
    marriage_marriage: z.boolean().optional(),
    marriage_unmarriage: z.boolean().optional(),
    marriage_un_important: z.boolean().optional(),
});

export const EducationSchema = z.object({
    education_primary: z.boolean().optional(),
    education_secondary: z.boolean().optional(),
    education_hightschool: z.boolean().optional(),
});

export const RequisitionFormSchema = z.object({
    department: z.string().min(1, "Bắt buộc nhập"),
    positionAdditional: z.string().min(1, "Bắt buộc nhập"),
    additionalPeople: z.string().min(1, "Bắt buộc nhập"),
    dateRequired: z.string().min(1, "Bắt buộc nhập"),

    reasons: ReasonSchema,
    marriage: MarriageSchema,

    expertise: z.boolean().optional(),
    education: EducationSchema,

    language: z.boolean().optional(),
    english: z.object({
        acceptable: z.boolean().optional(),
        normal: z.boolean().optional(),
        good: z.boolean().optional(),
    }),
    japanese: z.object({
        acceptable: z.boolean().optional(),
        normal: z.boolean().optional(),
        good: z.boolean().optional(),
    }),
    chinese: z.object({
        acceptable: z.boolean().optional(),
        normal: z.boolean().optional(),
        good: z.boolean().optional(),
    }),

    experience: z.string().optional(),
    personality: z.string().optional(),
    skills: z.string().optional(), 

    descriptionJob: z.string().optional(),
});

export type TRequisitionLetterForm = z.infer<typeof RequisitionFormSchema>;

const CreateRequisition: React.FC = () => {
    const { t } = useTranslation('hr')
    const user = useAuthStore(u => u.user)
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const createRequisitionLetter = useCreateRequisitionLetter()
    const updateRequisitionLetter = useUpdateRequisitionLetter()
    const { 
        register, 
        handleSubmit, 
        watch, 
        formState: { errors },
        setValue, 
        getValues,
        reset,
        formState: { isSubmitting } 
    } = useForm<TRequisitionLetterForm>({
        resolver: zodResolver(RequisitionFormSchema),
        defaultValues: {
            department: user?.departmentName || '',
            positionAdditional: '',
            additionalPeople: '1',
            dateRequired: new Date().toISOString().split("T")[0],
            reasons: {
                reason_expand: false,
                reason_replace: false,
                reason_temporary: false,
                reason_hr_reserve: false,
            },
            marriage: {
                marriage_marriage: false,
                marriage_unmarriage: false,
                marriage_un_important: false,
            },
            expertise: false,
            education: {
                education_primary: false,
                education_secondary: false,
                education_hightschool: false,
            },
            language: false,
            english: {
                acceptable: false,
                normal: false,
                good: false,
            },
            japanese: {
                acceptable: false,
                normal: false,
                good: false,
            },
            chinese: {
                acceptable: false,
                normal: false,
                good: false,
            },
            experience: '',
            personality: '',
            skills: '',
            descriptionJob: '',
        }
    });

    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const { data: formDataDetail, isLoading: isLoadingFormDataDetail } = useQuery({
        queryKey: ['requisition-letter-detail', id],
        queryFn: async () => {
            try {
                const res = await requisitionLetterApi.getByApplicationFormCode(id ?? '');
                return res.data.data;
            } catch {
                return
            }
        },
        enabled: isEdit,
    });
    
    useEffect(() => {
        if (formDataDetail) {
            const reasonParse = JSON.parse(formDataDetail?.requisitionLetter?.reason ?? "{}");
            const marriageParse = JSON.parse(formDataDetail?.requisitionLetter?.getMarriage ?? "{}");
            const educationParse = JSON.parse(formDataDetail?.requisitionLetter?.education ?? "{}");
            const englishParse = JSON.parse(formDataDetail?.requisitionLetter?.english ?? "{}");
            const chineseParse = JSON.parse(formDataDetail?.requisitionLetter?.chinese ?? "{}");
            const japaneseParse = JSON.parse(formDataDetail?.requisitionLetter?.japanese ?? "{}");

            reset({
                department: formDataDetail?.requisitionLetter?.departmentNameRequest || '',
                positionAdditional: formDataDetail?.requisitionLetter?.positionAdditional || '',
                additionalPeople: String(formDataDetail?.requisitionLetter?.additionalPeople || '1'),
                dateRequired: formDataDetail?.requisitionLetter?.dateRequired || '',
                reasons: {
                    reason_expand: reasonParse?.reason_expand || false,
                    reason_replace: reasonParse?.reason_replace || false,
                    reason_temporary: reasonParse?.reason_temporary || false,
                    reason_hr_reserve: reasonParse?.reason_hr_reserve || false,
                },
                marriage: {
                    marriage_marriage: marriageParse?.marriage_marriage || false,
                    marriage_unmarriage: marriageParse?.marriage_unmarriage || false,
                    marriage_un_important: marriageParse?.marriage_un_important || false,
                },
                expertise: formDataDetail?.requisitionLetter?.expertise || false,
                education: {
                    education_primary: educationParse?.education_primary || false,
                    education_secondary: educationParse?.education_secondary || false,
                    education_hightschool: educationParse?.education_hightschool || false,
                },
                language: formDataDetail?.requisitionLetter?.language || false,
                english: {
                    acceptable: englishParse?.acceptable || false,
                    normal: englishParse?.normal || false,
                    good: englishParse?.good || false,
                },
                japanese: {
                    acceptable: japaneseParse?.acceptable || false,
                    normal: japaneseParse?.normal || false,
                    good: japaneseParse?.good || false,
                },
                chinese: {
                    acceptable: chineseParse?.acceptable || false,
                    normal: chineseParse?.normal || false,
                    good: chineseParse?.good || false,
                },
                experience: formDataDetail?.requisitionLetter?.experience || '',
                personality: formDataDetail?.requisitionLetter?.personality || '',
                skills: formDataDetail?.requisitionLetter?.skills || '',
                descriptionJob: formDataDetail?.requisitionLetter?.descriptionJob || '',
            });
        }
    }, [formDataDetail, reset])

    const onSubmit: SubmitHandler<TRequisitionLetterForm> = async (data) => {
        if (user?.orgPositionId == null || user?.orgPositionId <= 0) {
            ShowToast(lang == 'vi' ? 'Chưa được thiết lập vị trí, liên hệ HR' : 'Org position not set, contact HR', 'error')
            return
        }

        const payload = {
            UserCodeCreatedForm: user?.userCode ?? '',
            UserNameCreatedForm: user?.userName ?? '',
            OrgPositionIdUserCreatedForm: user?.orgPositionId ?? -1,
            DepartmentNameRequest: data.department,
            Language: data.language ?? false,
            PositionAdditional: data.positionAdditional,
            AdditionalPeople: Number(data.additionalPeople),
            DateRequired: data.dateRequired,
            Reason: JSON.stringify(data.reasons),
            GetMarriage: JSON.stringify(data.marriage),
            Expertise: data.expertise ?? false,
            Education: JSON.stringify(data.education),
            English: JSON.stringify(data.english),
            Japanese: JSON.stringify(data.japanese),
            Chinese: JSON.stringify(data.chinese),
            Experience: data.experience ?? '',
            Personality: data.personality ?? '',
            Skills: data.skills ?? '',
            DescriptionJob: data.descriptionJob ?? '',
        }

        if (isEdit) {
            await updateRequisitionLetter.mutateAsync({
                id: formDataDetail?.requisitionLetter?.id,
                data: payload
            });
        } else {
            await createRequisitionLetter.mutateAsync(payload);
        }

        navigate('/requisition');
    };
  
    const CheckboxItem: React.FC<{ name: string, label: string, isParent?: boolean }> = ({ name, label, isParent }) => {
        const isChecked = watch(name as any) || false;
        return (
            <div className="flex items-center space-x-2 mb-1">
                <input
                    id={name}
                    type="checkbox"
                    {...register(name as any)}
                    checked={isChecked} 
                    className={`form-checkbox accent-black h-5 w-5 rounded text-indigo-600 border-gray-300} cursor-pointer`}
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
        <div className="p-1 pl-1 pt-0 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-y-3 gap-x-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('requisition.create.title')}</h3>
                <div>
                    <Button 
                        onClick={() => navigate("/requisition")} 
                        className="w-full md:w-auto hover:cursor-pointer"
                    >
                        {t('requisition.list.title')}
                    </Button>
                </div>
            </div>
            <div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('requisition.create.department')}</label>
                            <input
                                {...register("department")}
                                type='text'
                                placeholder={t('requisition.create.department')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm border-gray-300 ${errors.department ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('requisition.create.position_additional')}</label>
                            <input
                                {...register("positionAdditional")}
                                type='text'
                                placeholder={t('requisition.create.position_additional')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm border-gray-300 ${errors.positionAdditional ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('requisition.create.additional_people')}</label>
                            <input
                                {...register("additionalPeople")}
                                type="text"
                                inputMode="numeric"
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, "");

                                    if (value !== "") {
                                        const num = Number(value);
                                        if (num > 500) value = "500";
                                    }

                                    e.target.value = value;
                                }}
                                placeholder={t('requisition.create.additional_people')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm border-gray-300 focus:border-blue-500 ${errors.additionalPeople ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('requisition.create.date_required')}</label>
                            <DateTimePicker
                                {...register("dateRequired")}
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={getValues(`dateRequired`)}
                                onChange={(_selectedDates, dateStr) => setValue("dateRequired", dateStr)}
                                className={`dark:bg-[#454545] text-sm border rounded-md border-gray-300 p-2 w-full`}
                            />
                        </div>
                    </div>
                    <div className={`bg-white transition-all duration-300 mb-2 flex **flex-wrap** **sm:justify-between** border-b border-gray-300 pb-4 pt-2`}>
                        <div className="w-full mb-4 sm:w-auto"> 
                            <div>
                                <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                    {t('requisition.create.reason')} 
                                    <span className='text-base italic text-red-500 ml-2'>
                                        {errors.reasons ? lang === 'vi' ? '(Bắt buộc)' : '(Required)' : ''}
                                    </span>
                                </h2>
                                <div className={`flex items-start flex-wrap`}>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="reasons.reason_expand" label={`${t('requisition.create.expand')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="reasons.reason_replace" label={`${t('requisition.create.replace')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="reasons.reason_temporary" label={`${t('requisition.create.temporary')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="reasons.reason_hr_reserve" label={`${t('requisition.create.hr_reserve')}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full mb-4 sm:w-auto mx-5">
                            <div>
                                <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                    {t('requisition.create.marriage')} 
                                </h2>
                                <div className={`flex items-start flex-wrap`}>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="marriage.marriage_marriage" label={`${t('requisition.create.marriage')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="marriage.marriage_unmarriage" label={`${t('requisition.create.unmarried')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="marriage.marriage_un_important" label={`${t('requisition.create.no_important_marriage')}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full mb-4 sm:w-auto">
                            <div>
                                <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                    {t('requisition.create.education')}
                                </h2>
                                <div className={`flex items-start flex-wrap`}>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="education.education_primary" label={`${t('requisition.create.primary_school')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="education.education_secondary" label={`${t('requisition.create.middle_school')}`} />
                                    </div>
                                    <div className="flex items-start mr-3">
                                        <CheckboxItem name="education.education_hightschool" label={`${t('requisition.create.high_school')}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`bg-white transition-all duration-300 mb-3 flex **flex-wrap** **sm:justify-between** border-b border-gray-300 pb-4`}>
                        <div className='w-full mb-4 sm:w-auto flex content-center items-center'>
                            <h2 className="text-lg font-bold border-gray-300 text-gray-800 mr-2">
                                {t('requisition.create.expertise')}
                            </h2>
                            <CheckboxItem name="expertise" label={``} />
                        </div>
                        
                        <div className='w-full mb-4 sm:w-auto flex content-center items-center sm:mx-10'>
                            <h2 className="text-lg font-bold border-gray-300 text-gray-800 mr-2">
                                {t('requisition.create.language')}
                            </h2>
                            <CheckboxItem name="language" label={``} />
                        </div>
                        
                        <div className="w-full mb-4 sm:w-auto">
                            <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                {t('requisition.create.english')}
                            </h2>
                            <div className={`flex items-start flex-wrap`}>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="english.acceptable" label={`${t('requisition.create.acceptable')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="english.normal" label={`${t('requisition.create.normal')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="english.good" label={`${t('requisition.create.good')}`} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full mb-4 sm:w-auto sm:mx-10">
                            <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                {t('requisition.create.japanese')}
                            </h2>
                            <div className={`flex items-start flex-wrap`}>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="japanese.acceptable" label={`${t('requisition.create.acceptable')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="japanese.normal" label={`${t('requisition.create.normal')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="japanese.good" label={`${t('requisition.create.good')}`} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full mb-4 sm:w-auto">
                            <h2 className="text-lg font-bold border-gray-300 pb-2 mb-1 text-gray-800">
                                {t('requisition.create.chinese')}
                            </h2>
                            <div className={`flex items-start flex-wrap`}>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="chinese.acceptable" label={`${t('requisition.create.acceptable')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="chinese.normal" label={`${t('requisition.create.normal')}`} />
                                </div>
                                <div className="flex items-start mr-3">
                                    <CheckboxItem name="chinese.good" label={`${t('requisition.create.good')}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-600 mb-1">{t('requisition.create.experience')}</label>
                            <input
                                {...register("experience")}
                                type='text'
                                placeholder={t('requisition.create.experience')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm border-gray-300 ${errors.experience ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-600 mb-1">{t('requisition.create.personality')}</label>
                            <input
                                {...register("personality")}
                                type='text'
                                placeholder={t('requisition.create.personality')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm border-gray-300 ${errors.personality ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-600 mb-1">{t('requisition.create.skills')}</label>
                            <input
                                {...register("skills")}
                                type='text'
                                placeholder={t('requisition.create.skills')}
                                className={`w-full p-2 border rounded-md transition duration-150 ease-in-out text-sm border-gray-300 focus:border-blue-500 ${errors.skills ? 'border-red-500 bg-red-50' : ''}`}
                            />
                        </div>
                    </div>
                    <div className='mb-0'>
                        <label className="block text-sm font-medium text-gray-600 mb-1">{t('requisition.create.description_job')}</label>
                        <textarea 
                            {...register("descriptionJob")} 
                            className='border p-2 w-full border-gray-300 rounded-sm text-sm' 
                            rows={3} 
                            placeholder={t('requisition.create.description_job')}/>
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

export default CreateRequisition;
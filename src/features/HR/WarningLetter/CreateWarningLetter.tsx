import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage, ShowToast } from '@/lib';
import userApi from '@/api/userApi';
import FullscreenLoader from '@/components/FullscreenLoader';
import { useTranslation } from 'react-i18next';
import unionApi from '@/api/unionApi';
import warningLetterApi, { useCreateWarningLetter, useUpdateWarningLetter } from '@/api/HR/warningLetterApi';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';

const defaultValues = {
    userCode: '',
    userName: '',
    department: '', //department name
    departmentId: 0, 
    orgPositionId: 0,
    position: '',
    unit: '',
    reason: '',
    dateWarningLetter: new Date().toISOString().split('T')[0],
    verbalReprimand: false,
    suspensionWithoutPay: false,
    writtenDisciplinaryNotice: false,
    jobReassignmentWithSalaryReduction: false,
    dateFromverbalReprimandAndSuspensionWithoutPay: new Date().toISOString().split('T')[0],
    dateToverbalReprimandAndSuspensionWithoutPay: new Date().toISOString().split('T')[0],
    dateFromWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: new Date().toISOString().split('T')[0],
    dateToWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: new Date().toISOString().split('T')[0],
    memberUnion: ''
};

const formSchema = z.object({
    userCode: z.string().min(1, "Bắt buộc nhập"),
    userName: z.string().min(1, "Bắt buộc nhập"),
    department: z.string().min(1, "Bắt buộc nhập"),
    departmentId: z.number(),
    orgPositionId: z.number(),
    position: z.string().min(1, "Bắt buộc nhập"),
    unit: z.string().min(1, "Bắt buộc nhập"),
    reason: z.string().min(1, "Bắt buộc nhập"),
    dateWarningLetter: z.string(),
    verbalReprimand: z.boolean(),
    suspensionWithoutPay: z.boolean(),
    writtenDisciplinaryNotice: z.boolean(),
    jobReassignmentWithSalaryReduction: z.boolean(),
    dateFromverbalReprimandAndSuspensionWithoutPay: z.string(),
    dateToverbalReprimandAndSuspensionWithoutPay: z.string(),
    dateFromWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: z.string(),
    dateToWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: z.string(),
    memberUnion: z.string().min(1, "Bắt buộc nhập"),
})
.refine(
    (data) =>
        data.verbalReprimand ||
        data.suspensionWithoutPay ||
        data.writtenDisciplinaryNotice ||
        data.jobReassignmentWithSalaryReduction,
    {
        message: "Phải chọn ít nhất 1 hình thức kỷ luật",
        path: ["verbalReprimand"],
    }
);

type IFormSchema = z.infer<typeof formSchema>;

const CreateWarningLetter: React.FC = () => {
    const { t } = useTranslation('hr')
    const navigate = useNavigate()
    const user = useAuthStore(u => u.user)
    const lang = useTranslation().i18n.language.split('-')[0]
    const [memberUnions, setMemberUnions] = useState<{userCode: string, userName: string}[]>([])
    
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const { register, handleSubmit, watch, setValue, reset, getValues, formState: { errors } } =
    useForm<IFormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const { data: formDataDetail, isLoading: isLoadingFormDataDetail } = useQuery({
        queryKey: ['warning-letter-detail', id],
        queryFn: async () => {
            try {
                const res = await warningLetterApi.getByApplicationFormCode(id ?? '');
                return res.data.data;
            } catch {
                return
            }
        },
        enabled: isEdit,
    });

    useEffect(() => {
        if (formDataDetail?.warningLetter?.departmentId > 0) {
            const load = async () => {
                try {
                    const res = await unionApi.getMemberUnionByDepartment(formDataDetail?.warningLetter?.departmentId);
                    setMemberUnions(res.data.data);
                } catch {
                    setMemberUnions([]);
                }
            };
            load();
        }
    }, [formDataDetail]);

    useEffect(() => {
        if (formDataDetail && memberUnions.length > 0) {
            reset({
                userCode: formDataDetail?.warningLetter?.userCode ?? '',
                userName: formDataDetail?.warningLetter?.userName ?? '',
                department: formDataDetail?.warningLetter?.departmentName ?? '',
                departmentId: formDataDetail?.warningLetter?.departmentId ?? 0,
                orgPositionId: formDataDetail?.warningLetter?.orgPositionId ?? 0,
                position: formDataDetail?.warningLetter?.position ?? '',
                unit: formDataDetail?.warningLetter?.unit ?? '',
                reason: formDataDetail?.warningLetter?.reason ?? '',
                dateWarningLetter: formDataDetail?.warningLetter?.dateWarningLetter,
                verbalReprimand: formDataDetail?.warningLetter?.verbalReprimand ?? false,
                suspensionWithoutPay: formDataDetail?.warningLetter?.suspensionWithoutPay ?? false,
                writtenDisciplinaryNotice: formDataDetail?.warningLetter?.writtenDisciplinaryNotice ?? false,
                jobReassignmentWithSalaryReduction: formDataDetail?.warningLetter?.jobReassignmentWithSalaryReduction ?? false,
                dateFromverbalReprimandAndSuspensionWithoutPay: formDataDetail?.warningLetter?.dateFromVerbalReprimandAndSuspensionWithoutPay ?? '',
                dateToverbalReprimandAndSuspensionWithoutPay: formDataDetail?.warningLetter?.dateToVerbalReprimandAndSuspensionWithoutPay ?? '',
                dateFromWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: formDataDetail?.warningLetter?.dateFromWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction ?? '',
                dateToWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: formDataDetail?.warningLetter?.dateToWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction ?? '',
                memberUnion: formDataDetail?.warningLetter?.userCodeUnionMemberResponsibility ?? '',
            });
        }
    }, [formDataDetail, reset, memberUnions])

    const createWarningLetter = useCreateWarningLetter()
    const updateWarningLetter = useUpdateWarningLetter()
    const departmentId = watch("departmentId");

    useEffect(() => {
        if (!isEdit && departmentId > 0) {
            const fetchUnionByForm = async () => {
                try {
                    const res = await unionApi.getMemberUnionByDepartment(departmentId);
                    setMemberUnions(res.data.data);
                } catch (err) {
                    console.error(err);
                }
            };

            fetchUnionByForm();
        }
    }, [isEdit, departmentId]);

    const onSubmit = async (data: IFormSchema) => {
        if (user?.orgPositionId == null || user?.orgPositionId <= 0) {
            ShowToast(lang == 'vi' ? 'Chưa được thiết lập vị trí, liên hệ HR' : 'Org position not set, contact HR', 'error')
            return
        }

        const payload = {
            UserCode: data.userCode,
            UserName: data.userName,
            DepartmentName: data.department,
            DepartmentId: data.departmentId,
            Position: data.position,
            OrgPositionId: data.orgPositionId ?? -1,
            Unit: data.unit,
            Reason: data.reason,
            DateWarningLetter: data.dateWarningLetter,
            VerbalReprimand: data.verbalReprimand,
            SuspensionWithoutPay: data.suspensionWithoutPay,
            WrittenDisciplinaryNotice: data.writtenDisciplinaryNotice,
            JobReassignmentWithSalaryReduction: data.jobReassignmentWithSalaryReduction,
            DateFromVerbalReprimandAndSuspensionWithoutPay: data.dateFromverbalReprimandAndSuspensionWithoutPay,
            DateToVerbalReprimandAndSuspensionWithoutPay: data.dateToverbalReprimandAndSuspensionWithoutPay,
            DateFromWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: data.dateFromWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction,
            DateToWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: data.dateToWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction,
            UserCodeUnionMemberResponsibility: data.memberUnion,
            UserCodeCreatedForm: user?.userCode ?? '',
            UserNameCreatedForm: user?.userName ?? '',
            OrgPositionIdUserCreatedForm: user?.orgPositionId ?? -1
        }

        if (isEdit) {
            await updateWarningLetter.mutateAsync({
                id: formDataDetail?.warningLetter?.id,
                data: payload
            });
        } else {
            await createWarningLetter.mutateAsync(payload);
        }

        navigate('/warningletter?type=Registered');
    };

    const previousUserCodeValueRef = useRef('')
    const [isSearchingUser, setIsSearchingUser] = useState(false)

    const handleFindUser = async () => {
        const value = getValues('userCode')
        if (value == previousUserCodeValueRef.current) {
            return
        }
        previousUserCodeValueRef.current = value;
        if (!value.trim()) {
            setValue('userCode', '')
            setValue('userName', '')
            setValue('department', '')
            setValue('departmentId', 0)
            setValue('position', '')
            setValue('unit', '')
            setMemberUnions([])
            setValue('memberUnion', '')
            return
        }
        try {
            setIsSearchingUser(true)
            const fetchData = await userApi.SearchUserCombineViClockAndWebSystem(value)
            const result = fetchData?.data?.data
            if (result?.userCode == null) {
                ShowToast(lang == 'vi' ? 'Không tìm thấy người dùng' : 'User not found', 'error')
                setMemberUnions([])
                setValue('memberUnion', '')
                return
            }
            if (result?.orgPositionId == null) {
                setValue('userName', result?.userName)
                setValue('department', '')
                setValue('departmentId', 0)
                setValue('position', '')
                setValue('unit', '')
                ShowToast(lang == 'vi' ? 'Chưa được thiết lập vị trí, liên hệ với HR' : 'Org position not set yet, contact HR', 'error')
                setMemberUnions([])
                setValue('memberUnion', '')
                return
            }
            setValue('userName', result?.userName, { shouldValidate: true })
            setValue('department', result?.departmentName, { shouldValidate: true })
            setValue('departmentId', result?.departmentId)
            setValue('position', result?.unitNameV, { shouldValidate: true })
            setValue('unit', result?.companyName, { shouldValidate: true })
            setValue('orgPositionId', result?.orgPositionId)
        }
        catch (err) {
            ShowToast(getErrorMessage(err), "error");
        }
        finally {
            setIsSearchingUser(false)
        }
    }

    if (isEdit && !formDataDetail) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }
    
    if (isEdit && isLoadingFormDataDetail) {
        return <div>{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-3">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('warning_letter.create.title')}</h3>
                <div>
                    <Button onClick={() => navigate("/warningletter")} className="w-full md:w-auto hover:cursor-pointer mr-2">
                        {t('warning_letter.list.my_warning_letter')}
                    </Button>
                    <Button onClick={() => navigate("/warningletter?type=Registered")} className="w-full md:w-auto hover:cursor-pointer">
                        {t('warning_letter.list.title')}
                    </Button>
                </div>
            </div>

            {isSearchingUser && <FullscreenLoader />}

            <div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-3">
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.usercode')}</label>
                            <div className="relative">
                                <input
                                    disabled={isEdit}
                                    {...register("userCode")}
                                    onBlur={handleFindUser}
                                    type='text'
                                    placeholder={t('warning_letter.create.usercode')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm ${isEdit ? 'bg-gray-50' : ''} ${errors.userCode ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.username')}</label>
                            <div className="relative">
                                <input
                                    {...register("userName")}
                                    disabled
                                    type='text'
                                    placeholder={t('warning_letter.create.username')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.userName ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.department')}</label>
                            <div className="relative">
                                <input
                                    {...register("department")}
                                    disabled
                                    type='text'
                                    placeholder={t('warning_letter.create.department')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.department ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.position')}</label>
                            <div className="relative">
                                <input
                                    disabled={isEdit}
                                    {...register("position")}
                                    type='text'
                                    placeholder={t('warning_letter.create.position')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm ${isEdit ? 'bg-gray-50' : ''} ${errors.position ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.unit')}</label>
                            <div className="relative">
                                <input
                                    {...register("unit")}
                                    disabled
                                    type='text'
                                    placeholder={t('warning_letter.create.unit')}
                                    className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm bg-gray-50 ${errors.unit ? 'border-red-500 bg-red-50' : ''}`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px] relative">
                            <label className="block text-sm font-medium text-gray-500 mb-1">{t('warning_letter.create.unit')}</label>
                            <div className="relative">
                                <DateTimePicker
                                    {...register("dateWarningLetter")}
                                    enableTime={false}
                                    dateFormat="Y-m-d"
                                    initialDateTime={getValues(`dateWarningLetter`)}
                                    onChange={(_selectedDates, dateStr) =>
                                        setValue("dateWarningLetter", dateStr, { shouldValidate: true })
                                    }
                                    className={`dark:bg-[#454545] text-sm border rounded border-gray-300 p-2 w-full`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='mb-3'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('warning_letter.create.reason')}</label>
                        <textarea
                            {...register("reason")}
                            id="lyDo"
                            rows={3} 
                            placeholder={t('warning_letter.create.reason')}
                            className={`w-full p-2 border rounded-sm transition duration-150 ease-in-out text-sm ${errors.reason ? 'border-red-500 bg-red-50' : ''}`}
                        ></textarea>
                    </div>

                    <div className={`border border-gray-200 py-2 px-4 rounded-xl bg-gray-50 shadow-inner mb-3 ${errors.verbalReprimand ? 'border-red-500 bg-red-50' : ''}`}>
                        <p className="text-lg font-bold text-gray-800 mb-4">{t('warning_letter.create.handling_method')}</p> 
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-3">
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input id='cb1' type="checkbox" {...register("verbalReprimand")} className={`h-5 w-5 accent-black`}/>
                                    <label htmlFor={`cb1`} className="ml-2 block text-base text-gray-700 cursor-pointer select-none">{t('warning_letter.create.verbal_reprimand')}</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" id='cb2' {...register("suspensionWithoutPay")} className={`h-5 w-5 accent-black`}/>
                                    <label htmlFor={`cb2`} className="ml-2 block text-base text-gray-700 cursor-pointer select-none">{t('warning_letter.create.suspension_without_pay')}</label>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input type="checkbox" id='cb3' {...register("writtenDisciplinaryNotice")} className={`h-5 w-5 accent-black`}/>
                                    <label htmlFor={`cb3`} className="ml-2 block text-base text-gray-700 cursor-pointer select-none">{t('warning_letter.create.written_disciplinary_notice')}</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" id='cb4' {...register("jobReassignmentWithSalaryReduction")} className={`h-5 w-5 accent-black`}/>
                                    <label htmlFor={`cb4`} className="ml-2 block text-base text-gray-700 cursor-pointer select-none">{t('warning_letter.create.job_reassignment_with_salary_reduction')}</label>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-gray-200"></div>
                    </div>

                    <div className="w-full relative mb-4">
                        <label htmlFor='unit' className="block text-sm font-medium text-gray-700 mb-1">{t('warning_letter.create.union_member_responsibility')}</label>
                        <div className="relative">
                            <select
                                {...register("memberUnion")}
                                className={`cursor-pointer appearance-none w-full p-2 border border-gray-300 rounded-sm bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm ${errors.memberUnion ? 'border-red-500 bg-red-50' : ''}`}
                            >
                                <option value="">--{t('warning_letter.create.choose')}--</option>
                                {
                                    memberUnions?.map((item: {userCode: string, userName: string}, idx: number) => {
                                        return (
                                            <option value={item?.userCode} key={idx}>{item?.userName}</option>
                                        )
                                    })
                                }
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    
                    <div className=" flex justify-end">
                        <button
                            disabled={createWarningLetter.isPending || updateWarningLetter.isPending}
                            type="submit"
                            className="cursor-pointer w-full sm:w-auto py-3 px-5 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400"
                        >
                            {t('warning_letter.create.confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateWarningLetter;
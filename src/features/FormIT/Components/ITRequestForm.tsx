/* eslint-disable @typescript-eslint/no-explicit-any */
import { ITCategoryInterface } from "@/api/itCategoryApi";
import { IPriority } from "@/api/priorityApi";
import userApi from "@/api/userApi";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import DotRequireComponent from "@/components/DotRequireComponent";
import FullscreenLoader from "@/components/FullscreenLoader";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage, ShowToast } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from 'zod';

interface ITRequestFormProps {
    mode: 'create' | 'edit' | 'view' | 'approval' | 'manager_it_approval' | 'assigned' 
    formData?: any
    onSubmit?: (data: any) => void,
    itCategories?: { id: number, name: string, nameE: string }[],
    priorities?: { id: number, name: string, nameE: string }[],
    isPending?: boolean;
}

const ITRequestForm: React.FC<ITRequestFormProps> = ({ mode, formData, onSubmit, itCategories, priorities, isPending }) => {
    const { t } = useTranslation('formIT')
    const { t: tCommon  } = useTranslation('common')
    const { user } = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const isEdit = mode == 'edit'


    //create
    const previousUserCodeValueRef = useRef('')
    const [isSearchingUser, setIsSearchingUser] = useState(false)

    const ITRequestFormSchema = z.object({
        requester: z.object({
            userCode: z.string().min(1, tCommon('required')),
            name: z.string().min(1, tCommon('required')),
            email: z.string().email('Email không hợp lệ.').min(1, tCommon('required')),
            department: z.string().min(1, tCommon('required')),
            departmentId: z.coerce.number(),
            orgPositionId: z.coerce.number(),
            position: z.string().min(1, tCommon('required')),
        }),
        itRequest: z.object({
            dateRequired: z.string().min(1, tCommon('required')),
            dateCompleted: z.string().min(1, tCommon('required')),
            itCategory: z.array(z.number()).nonempty(tCommon('required')),
            reason: z.string().min(1, tCommon('required')),
            priority: z.coerce.number()
        })
    });

    type ITRequestState = z.infer<typeof ITRequestFormSchema>;
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
        getValues,
        setValue,
    } = useForm<ITRequestState>({
        resolver: zodResolver(ITRequestFormSchema),
        defaultValues: {
            requester: {
                userCode: formData?.userCodeRequestor ?? '',
                name: formData?.userNameRequestor ?? '',
                email: formData?.email ?? '',
                department: formData?.orgUnit?.name ?? '',
                departmentId: formData?.orgUnit?.id ?? -1,
                orgPositionId: user?.orgPositionId,
                position: formData?.position ?? ''
            },
            itRequest: {
                dateRequired: formData?.requestDate ?? new Date().toISOString().split('T')[0],
                dateCompleted: formData?.requiredCompletionDate ?? new Date().toISOString().split('T')[0],
                itCategory: formData?.itFormCategories?.map((item: {itCategoryId: number}) => item.itCategoryId) ?? [],
                reason: formData?.reason ?? '',
                priority: formData?.priorityId ?? 1,
            }
        },
    });

    const onInternalSubmit = (data: any) => {
        if (onSubmit) {
            onSubmit(data);
        }
    };

    const onCancel = () => {
        if (isEdit) {
            navigate("/form-it")
        }
        else {
            reset()
        }
    }

    const handleFindUser = async () => {
        const value = getValues('requester.userCode')

        if (value == previousUserCodeValueRef.current) {
            return
        }

        previousUserCodeValueRef.current = value;

        if (!value.trim()) {
            setValue('requester.name', '')
            setValue('requester.department', '')
            setValue('requester.email', '')
            return
        }

        try {
            setIsSearchingUser(true)
            await new Promise(resolve => setTimeout(resolve, 300));
            const fetchData = await userApi.SearchUserCombineViClockAndWebSystem(value)
            const result = fetchData?.data?.data

            if (result == null || result == undefined || result?.userCode == null) {
                ShowToast("Not found user", "error")
                setValue('requester.name', '', { shouldValidate: true })
                setValue('requester.department', '', { shouldValidate: true })
                setValue('requester.email', '', { shouldValidate: true })

                return
            }

            if (result?.orgPositionId == null || result?.departmentId == null) {
                ShowToast("Chưa được thiết lập vị trí phòng ban, liên hệ HR", "error")
                setValue('requester.name', result?.nvHoTen, { shouldValidate: true })
                setValue('requester.department', '', { shouldValidate: true })
                return
            }

            setValue('requester.name', result?.nvHoTen, { shouldValidate: true })
            setValue('requester.department', result?.departmentName, { shouldValidate: true })
            setValue('requester.departmentId', result?.departmentId, { shouldValidate: true })
            setValue('requester.email', result?.email ?? '', { shouldValidate: true })
        }
        catch (err) {
            ShowToast(getErrorMessage(err), "error");
        }
        finally {
            setIsSearchingUser(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onInternalSubmit)} className="flex flex-col gap-6">

            {isSearchingUser && <FullscreenLoader />}

            <div className="space-y-6">
                <div>
                    <h2 className="mb-2 text-lg font-semibold text-[#007cc0]">{t('create.text_info_user_request')}</h2>
                    <hr className="mb-4 border-gray-200" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="form-group">
                            <label htmlFor="requester.employeeId" className="block text-sm font-medium text-gray-700">
                                {tCommon('usercode')}<DotRequireComponent />
                            </label>
                            <input
                                disabled={isEdit}
                                {...register('requester.userCode')}
                                onBlur={handleFindUser}
                                type="text"
                                id="requester.userCode"
                                placeholder={tCommon('usercode')}
                                className={`${errors.requester?.userCode ? 'border-red-500' : 'border-gray-300'} ${isEdit ? 'bg-gray-100' : ''} mt-1 w-full p-2 rounded-md text-sm border select-none`}
                            />
                            {errors.requester?.userCode && <p className="text-red-500 text-xs mt-1">{errors.requester.userCode.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="requester.name" className="block text-sm font-medium text-gray-700">
                                {tCommon('name')}<DotRequireComponent />
                            </label>
                            <input
                                {...register('requester.name')}
                                disabled={true}
                                type="text"
                                id="requester.name"
                                placeholder={tCommon('name')}
                                className={`${errors.requester?.name ? 'border-red-500' : 'border-gray-300'} bg-gray-100 mt-1 w-full p-2 rounded-md text-sm border`}
                            />
                            {errors.requester?.name && <p className="text-red-500 text-xs mt-1">{errors.requester.name.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="requester.department" className="block text-sm font-medium text-gray-700">
                                {tCommon('department')}<DotRequireComponent />
                            </label>
                            <input
                                {...register('requester.department')}
                                disabled={true}
                                type="text"
                                id="requester.department"
                                placeholder={tCommon('department')}
                                className={`${errors.requester?.department ? 'border-red-500' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border bg-gray-100`}
                            />
                            {errors.requester?.department && <p className="text-red-500 text-xs mt-1">{errors.requester.department.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="requester.position" className="block text-sm font-medium text-gray-700">
                                {t('create.position')}<DotRequireComponent />
                            </label>
                            <input
                                {...register('requester.position')}
                                type="text"
                                id="requester.position"
                                placeholder={t('create.position')}
                                className={`${errors.requester?.position ? 'border-red-500' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border`}
                            />
                            {errors.requester?.position && <p className="text-red-500 text-xs mt-1">{errors.requester.position.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="requester.email" className="block text-sm font-medium text-gray-700">
                                Email<DotRequireComponent />
                            </label>
                            <input
                                {...register('requester.email')}
                                type="email"
                                id="requester.email"
                                placeholder="email@vsvn.com.vn"
                                className={`${errors.requester?.email ? 'border-red-500' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border`}
                            />
                            {errors.requester?.email && <p className="text-red-500 text-xs mt-1">{errors.requester.email.message}</p>}
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="mb-2 text-lg font-semibold text-[#007cc0]">{t('create.text_info_request')}</h2>
                    <hr className="mb-4 border-gray-200" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="itRequest.dateRequired" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('create.date_request')}<DotRequireComponent />
                            </label>
                            <Controller
                                name="itRequest.dateRequired"
                                control={control}
                                render={({ field }) => (
                                    <DateTimePicker
                                        enableTime={false}
                                        dateFormat="Y-m-d"
                                        initialDateTime={field.value}
                                        onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                        className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer bg-[#fdfdfd]`}
                                    />
                                )}
                            />
                            {errors.itRequest?.dateRequired && <p className="text-red-500 text-xs mt-1">{errors.itRequest.dateRequired.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="itRequest.dateCompleted" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('create.date_required_completed')}<DotRequireComponent />
                            </label>
                            <Controller
                                name="itRequest.dateCompleted"
                                control={control}
                                render={({ field }) => (
                                    <DateTimePicker
                                        enableTime={false}
                                        dateFormat="Y-m-d"
                                        initialDateTime={field.value}
                                        onChange={(_selectedDates, dateStr) => field.onChange(dateStr)}
                                        className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 p-2 text-sm rounded-[5px] hover:cursor-pointer bg-[#fdfdfd]`}
                                    />
                                )}
                            />
                            {errors.itRequest?.dateCompleted && <p className="text-red-500 text-xs mt-1">{errors.itRequest.dateCompleted.message}</p>}
                        </div>
                    </div>

                    <div className="form-group mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('create.category')}<DotRequireComponent />
                        </label>
                        <Controller
                            name="itRequest.itCategory"
                            control={control}
                            render={({ field }) => (
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {itCategories?.map((item: ITCategoryInterface, idx: number) => {
                                        const checked = field.value?.includes(item?.id ?? -1);
                                        return (
                                            <label
                                                key={idx}
                                                className="w-[48%] flex items-center space-x-2 cursor-pointer select-none"
                                            >
                                                <input
                                                    disabled={isEdit}
                                                    type="checkbox"
                                                    value={item.id}
                                                    checked={checked}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            field.onChange([...field.value, item.id]);
                                                        } else {
                                                            field.onChange(
                                                                field.value.filter((val: number) => val !== item.id)
                                                            );
                                                        }
                                                    }}
                                                    className="border-gray-300 scale-[1.4] accent-black"
                                                />
                                                <span>{item.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        />
                        {errors.itRequest?.itCategory && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.itRequest.itCategory.message}
                            </p>
                        )}
                    </div>

                    <div className="form-group mt-4">
                        <label htmlFor="itRequest.reason" className="block text-sm font-medium text-gray-700">
                            {tCommon('reason')}<DotRequireComponent />
                        </label>
                        <textarea
                            id="itRequest.reason"
                            {...register('itRequest.reason')}
                            placeholder={tCommon('reason')}
                            rows={4}
                            className={`${errors.itRequest?.reason ? 'border-red-500' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border`}
                        ></textarea>
                        {errors.itRequest?.reason && <p className="text-red-500 text-xs mt-1">{errors.itRequest.reason.message}</p>}
                    </div>

                    <div className="form-group mt-4">
                        <label htmlFor="itRequest.priority" className="block text-sm font-medium text-gray-700">
                            {t('create.priority')}
                        </label>
                        <select
                            id="itRequest.priority"
                            {...register('itRequest.priority')}
                            className="mt-1 w-full p-2 rounded-md text-sm border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {
                                priorities?.map((item: IPriority, idx: number) => (
                                    <option value={item.id} key={idx}>{lang == 'vi' ? item.name : item.nameE}</option>
                                ))
                            }
                        </select>
                        {errors.itRequest?.priority && <p className="text-red-500 text-xs mt-1">{errors.itRequest.priority.message}</p>}
                    </div>
                </div>
            </div>

            <div className='flex gap-4 justify-end'>
                <Button
                    type="button"
                    onClick={onCancel}
                    className='px-6 py-2 border bg-white border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer'
                >
                    {tCommon('cancel')}
                </Button>
                <Button
                    disabled={isPending}
                    type='submit'
                    className='px-6 py-2 bg-black border border-transparent rounded-md text-sm font-medium text-white cursor-pointer'
                >
                    {isPending ? <Spinner size="small" className='text-white'/> : tCommon('save')}
                </Button>
            </div>
        </form>
    )
}

export default ITRequestForm;
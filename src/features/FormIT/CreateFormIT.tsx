import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Button } from '@/components/ui/button';

const ITRequestFormSchema = z.object({
    requester: z.object({
        employeeId: z.string().min(1, 'Bắt buộc.'),
        name: z.string().min(1, 'Bắt buộc.'),
        email: z.string().email('Email không hợp lệ.').min(1, 'Email là bắt buộc.'),
        department: z.string().min(1, 'Bắt buộc.'),
    }),
    itRequest: z.object({
        dateRequired: z.string().min(1, 'Bắt buộc.'),
        dateCompleted: z.string().min(1, 'Bắt buộc.'),
        itCategory: z.enum(['server', 'network', 'account', 'other'], {
            required_error: 'Bắt buộc.',
        }),
        itCategoryOther: z.string().optional(),
        reason: z.string().min(1, 'Bắt buộc.'),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
    }),
    }).superRefine((data, ctx) => {
        if (data.itRequest.itCategory === 'other' && !data.itRequest.itCategoryOther) {
            ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Vui lòng nhập lý do khác.',
            path: ['itRequest', 'itCategoryOther'],
        });
    }
});

type ITRequestState = z.infer<typeof ITRequestFormSchema>;

const DotRequireComponent = () => <span className="text-red-500 ml-1">*</span>;

const App = () => {
    const { t } = useTranslation('formIT');
    const { t: tCommon  } = useTranslation('common');

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        control,
        reset,
        setValue 
    } = useForm<ITRequestState>({
        resolver: zodResolver(ITRequestFormSchema),
        defaultValues: {
            requester: {
                employeeId: '',
                name: '',
                email: '',
                department: '',
            },
            itRequest: {
                dateRequired: new Date().toISOString().split('T')[0],
                dateCompleted: new Date().toISOString().split('T')[0],
                itCategory: 'server',
                itCategoryOther: '',
                reason: '',
                priority: 'medium',
            }
        },
    });

    const watchedItCategory = watch('itRequest.itCategory');

    const onSubmit: SubmitHandler<ITRequestState> = (data) => {
        console.log('Form data submitted:', data);
        setTimeout(() => {
            reset();
        }, 3000);
    };

    const onCancel = () => {
        reset();
    };

    //   {submissionStatus === 'success' && (
    //     <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
    //         <span className="block sm:inline">Yêu cầu đã được gửi thành công! Dữ liệu đã được log vào console.</span>
    //     </div>
    // )}

    const watchItCategory = watch('itRequest.itCategory') || []; // Là mảng
        const handleCategoryChange = (value) => {
        const current = watchItCategory || [];
        if (current.includes(value)) {
            // Nếu đã chọn thì bỏ chọn
            const newSelected = current.filter(item => item !== value);
            // cập nhật giá trị
            setValue('itRequest.itCategory', newSelected);
        } else {
            // Nếu chưa chọn thì thêm vào
            setValue('itRequest.itCategory', [...current, value]);
        }
        };

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('create.title')}</h3>
            </div>

            <div className="flex flex-col min-h-screen">
                <div className="w-full max-w-3xl bg-white rounded-xl pl-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <div className="space-y-6">
                            <div>
                            <h2 className="mb-2 text-lg font-semibold text-[#007cc0]">{t('create.text_info_user_request')}</h2>
                            <hr className="mb-4 border-gray-200" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                <label htmlFor="requester.employeeId" className="block text-sm font-medium text-gray-700">
                                    {tCommon('usercode')}<DotRequireComponent />
                                </label>
                                <input
                                    type="text"
                                    id="requester.employeeId"
                                    {...register('requester.employeeId')}
                                    placeholder={tCommon('usercode')}
                                    className={`${errors.requester?.employeeId ? 'border-red-500' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border`}
                                />
                                {errors.requester?.employeeId && <p className="text-red-500 text-xs mt-1">{errors.requester.employeeId.message}</p>}
                                </div>

                                <div className="form-group">
                                <label htmlFor="requester.name" className="block text-sm font-medium text-gray-700">
                                    {tCommon('name')}<DotRequireComponent />
                                </label>
                                <input
                                    type="text"
                                    id="requester.name"
                                    {...register('requester.name')}
                                    placeholder={tCommon('name')}
                                    className={`${errors.requester?.name ? 'border-red-500' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border`}
                                />
                                {errors.requester?.name && <p className="text-red-500 text-xs mt-1">{errors.requester.name.message}</p>}
                                </div>

                                <div className="form-group">
                                <label htmlFor="requester.email" className="block text-sm font-medium text-gray-700">
                                    Email<DotRequireComponent />
                                </label>
                                <input
                                    type="email"
                                    id="requester.email"
                                    {...register('requester.email')}
                                    placeholder="email@vsvn.com.vn"
                                    className={`${errors.requester?.email ? 'border-red-500' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border`}
                                />
                                {errors.requester?.email && <p className="text-red-500 text-xs mt-1">{errors.requester.email.message}</p>}
                                </div>

                                <div className="form-group">
                                <label htmlFor="requester.department" className="block text-sm font-medium text-gray-700">
                                    {tCommon('department')}<DotRequireComponent />
                                </label>
                                <input
                                    type="text"
                                    id="requester.department"
                                    {...register('requester.department')}
                                    placeholder={tCommon('department')}
                                    disabled
                                    className={`${errors.requester?.department ? 'border-red-500' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border cursor-not-allowed`}
                                />
                                {errors.requester?.department && <p className="text-red-500 text-xs mt-1">{errors.requester.department.message}</p>}
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
                            <div className="flex flex-col gap-2 mt-2">
                                <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value="server"
                                    checked={watchItCategory.includes('server')}
                                    onChange={() => handleCategoryChange('server')}
                                    className="border-gray-300 focus:ring-indigo-500 text-indigo-600"
                                />
                                <span>Server</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value="network"
                                    checked={watchItCategory.includes('network')}
                                    onChange={() => handleCategoryChange('network')}
                                    className="border-gray-300 focus:ring-indigo-500 text-indigo-600"
                                />
                                <span>Network</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value="account"
                                    checked={watchItCategory.includes('account')}
                                    onChange={() => handleCategoryChange('account')}
                                    className="border-gray-300 focus:ring-indigo-500 text-indigo-600"
                                />
                                <span>Tài khoản/Mật khẩu</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value="other"
                                    checked={watchItCategory.includes('other')}
                                    onChange={() => handleCategoryChange('other')}
                                    className="border-gray-300 focus:ring-indigo-500 text-indigo-600"
                                />
                                <span>Khác</span>
                                </label>
                            </div>
                            {errors.itRequest?.itCategory && <p className="text-red-500 text-xs mt-1">{errors.itRequest.itCategory.message}</p>}
                            </div>
                            {/* <div className="form-group mt-4">
                                <label htmlFor="itRequest.itCategory" className="block text-sm font-medium text-gray-700">
                                {t('create.category')}<DotRequireComponent />
                                </label>
                                <select
                                id="itRequest.itCategory"
                                {...register('itRequest.itCategory')}
                                className="mt-1 w-full p-2 rounded-md text-sm border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                <option value="server">Server</option>
                                <option value="network">Network</option>
                                <option value="account">Tài khoản/Mật khẩu</option>
                                <option value="other">Khác</option>
                                </select>
                                {errors.itRequest?.itCategory && <p className="text-red-500 text-xs mt-1">{errors.itRequest.itCategory.message}</p>}
                            </div>

                            {watchedItCategory === 'other' && (
                                <div className="form-group mt-4">
                                <label htmlFor="itRequest.itCategoryOther" className="block text-sm font-medium text-gray-700">
                                    {t('create.other_category')}<DotRequireComponent />
                                </label>
                                <input
                                    type="text"
                                    id="itRequest.itCategoryOther"
                                    {...register('itRequest.itCategoryOther')}
                                    placeholder={t('create.ex_other_category')}
                                    className={`${errors.itRequest?.itCategoryOther ? 'border-red-500' : 'border-gray-300'} mt-1 w-full p-2 rounded-md text-sm border`}
                                />
                                {errors.itRequest?.itCategoryOther && <p className="text-red-500 text-xs mt-1">{errors.itRequest.itCategoryOther.message}</p>}
                                </div>
                            )} */}

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
                                <option value="low">{t('create.low')}</option>
                                <option value="medium">{t('create.medium')}</option>
                                <option value="high">{t('create.high')}</option>
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
                                type='submit'
                                className='px-6 py-2 bg-black border border-transparent rounded-md text-sm font-medium text-white cursor-pointer'
                            >
                                {tCommon('save')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default App;

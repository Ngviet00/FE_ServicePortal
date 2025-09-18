import { useTranslation } from 'react-i18next';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import priorityApi from '@/api/priorityApi';
import itCategoryApi from '@/api/itCategoryApi';
import DotRequireComponent from '@/components/DotRequireComponent';
import itFormApi from '@/api/itFormApi';
import { useNavigate, useParams } from 'react-router-dom';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ITRequestForm from './Components/ITRequestForm';

const ViewOnlyFormIT = () => {
    const { t } = useTranslation('formIT');
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>();
    const isAssigned = !!id;
    const lang = useTranslation().i18n.language.split('-')[0]

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['itForm', id],
        queryFn: async () => {
            const res = await itFormApi.getById(id ?? '');
            return res.data.data;
        },
        enabled: isAssigned,
        staleTime: 0
    });

    const { data: priorities = [] } = useQuery({
        queryKey: ['get-all-priority'],
        queryFn: async () => {
            const res = await priorityApi.getAll()
            return res.data.data
        },
    });

    const { data: ItCategories = [] } = useQuery({
        queryKey: ['get-all-it-category'],
        queryFn: async () => {
            const res = await itCategoryApi.getAll()
            return res.data.data
        },
    });

    const { data: ItMembers = [] } = useQuery({
        queryKey: ['get-all-it-member'],
        queryFn: async () => {
            const res = await itFormApi.getMemberITAssigned()
            return res.data.data
        },
    });

    const mode = 'view'
    const initialFormData = isAssigned ? formData : {};

    if (isAssigned && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('list.title_view_form_it')}</h3>
                <Button onClick={() => navigate("/form-it")} className="w-full md:w-auto hover:cursor-pointer">
                    {t('list.title')}
                </Button>
            </div>

            <div className="flex">
                <div className="w-full max-w-3xl bg-white rounded-xl pl-0">
                    <ITRequestForm
                        mode={mode}
                        priorities={priorities} 
                        itCategories={ItCategories}
                        formData={initialFormData}
                    />
                </div>
                <div className='pl-5 border-l-1 ml-5 w-full'>
                    <div className='w-full'>
                        <Label className='mb-1'>{t('create.note')} <span className='italic text-red-500'>(Manager IT)</span></Label>
                        <Textarea 
                            readOnly={true}
                            placeholder={t('create.note')} 
                            value={formData?.noteManagerIT ?? ''} 
                            className={`bg-gray-100 border-gray-300`}
                        />
                    </div>
                    {
                        formData?.applicationFormItem?.applicationForm?.assignedTasks?.length > 0 ? (
                            <div className='w-full mt-5'>
                                <Label className='mb-1'>{t('create.assigned')} </Label>
                                <div className="flex flex-col gap-2 mt-2">
                                    {ItMembers?.map((item: {nvMaNV: string, nvHoTen: string, email: string}, idx: number) => {                                             
                                        const isExist = formData?.applicationFormItem?.applicationForm?.assignedTasks.some((e: { userCode: string; }) => e.userCode === item.nvMaNV)
                                        if (isExist) {
                                            return (
                                                <label key={idx} className="w-[48%] flex items-center space-x-2 cursor-pointer">
                                                    <span><strong>({item.nvMaNV})</strong> {item.nvHoTen}</span>
                                                </label>
                                            );
                                        }                                                        
                                    })}
                                </div>
                            </div>
                        ) : (<></>)
                    }
                    {
                        formData?.targetCompletionDate != null ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('create.target_completion_date')}<DotRequireComponent />
                                    </label>
                                    <DateTimePicker
                                        disabled={true}
                                        key={'target_date'}
                                        enableTime={false}
                                        dateFormat="Y-m-d"
                                        initialDateTime={formData?.targetCompletionDate ?? new Date().toISOString().split('T')[0]}
                                        onChange={() => {}}
                                        className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 bg-gray-100 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('create.actual_completion_date')}<DotRequireComponent />
                                    </label>
                                    <DateTimePicker
                                        disabled={true}
                                        key={'actual_date'}
                                        enableTime={false}
                                        dateFormat="Y-m-d"
                                        onChange={() => {}}
                                        initialDateTime={formData?.actualCompletionDate ?? new Date().toISOString().split('T')[0]}
                                        className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 bg-gray-100 p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                                    />
                                </div>
                            </div>
                        ) : (<></>) 
                    }
                    
                    <HistoryApproval historyApplicationForm={formData?.applicationFormItem?.applicationForm?.historyApplicationForms}/>
                </div>
            </div>
        </div>
    );
};

export default ViewOnlyFormIT;

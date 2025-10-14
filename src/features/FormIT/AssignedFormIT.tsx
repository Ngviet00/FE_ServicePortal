/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@/components/ComponentCustom/Flatpickr';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import priorityApi from '@/api/priorityApi';
import itCategoryApi from '@/api/itCategoryApi';
import { useState } from 'react';
import DotRequireComponent from '@/components/DotRequireComponent';
import { useAuthStore } from '@/store/authStore';
import itFormApi, { useResolvedTaskITForm, useStaffITReferenceToManagerIT } from '@/api/itFormApi';
import { Spinner } from '@/components/ui/spinner';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ITRequestForm from './Components/ITRequestForm';
import ModalConfirm from '@/components/ModalConfirm';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import userApi from '@/api/userApi';
import HistoryApproval from '../Approval/Components/HistoryApproval';
import { STATUS_ENUM } from '@/lib';

const AssignedFormIT = () => {
    const { t } = useTranslation('formIT');
    const { user } = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [targetDate, setTargetDate] = useState<any>(new Date().toISOString().split('T')[0]);
    const [actualDate, setActualDate] = useState<any>(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState("")

    const { id } = useParams<{ id: string }>();
    const isAssigned = !!id;

    const { data: formData, isLoading: isFormDataLoading } = useQuery({
        queryKey: ['itForm', id],
        queryFn: async () => {
            const res = await itFormApi.getById(id ?? '');
            return res.data.data;
        },
        enabled: isAssigned,
    });

    const mode = 'assigned'
    const initialFormData = isAssigned ? formData : {};

    const staffITReferenceToManagerIT = useStaffITReferenceToManagerIT()
    const resolvedTask = useResolvedTaskITForm()
    
    const handleSaveModalConfirm = async () => {
        if (statusModalConfirm == 'reference') {
            await staffITReferenceToManagerIT.mutateAsync({
                UserCode: user?.userCode,
                UserName: user?.userName ?? '',
                ApplicationFormId: formData?.applicationFormItem?.applicationForm?.id,
                OrgPositionId: user?.orgPositionId,
                Note: note
            })
        }
        else {
            await resolvedTask.mutateAsync({
                UserCodeApproval: user?.userCode,
                UserNameApproval: user?.userName ?? '',
                ApplicationFormId: formData?.applicationFormItem?.applicationForm?.id,
                ApplicationFormCode: formData?.applicationFormItem?.applicationForm?.code,
                TargetCompletionDate: targetDate,
                ActualCompletionDate: actualDate
            })
        }

        navigate("/approval/assigned-tasks")
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    };

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
            const res = await userApi.GetMultipleUserViclockByOrgPositionId(9)
            return res.data.data
        },
    });

    if (isAssigned && isFormDataLoading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('create.title')}</h3>
                <Button onClick={() => navigate("/form-it")} className="w-full md:w-auto hover:cursor-pointer">
                    Danh sách đã tạo
                </Button>
            </div>

            {
                formData?.applicationFormItem?.applicationForm?.reference?.code && (
                    <div className='mb-4 mt-2 text-base text-black bg-orange-200 p-2 rounded'>
                        <span>
                            {lang == 'vi' ? 'Đơn IT này liên kết với đơn mua bán' : 'The IT order linked to purchase order'}: <Link className='text-purple-600 font-bold underline' to={`/view/purchase/${formData?.applicationFormItem?.applicationForm?.reference?.code}`}>{formData?.applicationFormItem?.applicationForm?.reference?.code}</Link> 
                        </span>
                    </div>
                )
            }

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />

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
                            value={formData?.noteManagerIT} 
                            className={`bg-gray-100 border-gray-300`}
                        />
                    </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('create.target_completion_date')}<DotRequireComponent />
                            </label>
                            <DateTimePicker
                                key={'target_date'}
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={targetDate ?? new Date().toISOString().split('T')[0]}
                                onChange={(_selectedDates, dateStr) => setTargetDate(dateStr)}
                                className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 ${!isAssigned ? 'bg-gray-100' : ''} p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                            />
                        </div>

                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('create.actual_completion_date')}<DotRequireComponent />
                            </label>
                            <DateTimePicker
                                key={'actual_date'}
                                enableTime={false}
                                dateFormat="Y-m-d"
                                initialDateTime={actualDate ?? new Date().toISOString().split('T')[0]}
                                onChange={(_selectedDates, dateStr) => setActualDate(dateStr)}
                                className={`dark:bg-[#454545] w-full shadow-xs border border-gray-300 ${!isAssigned ? 'bg-gray-100' : ''} p-2 text-sm rounded-[5px] hover:cursor-pointer`}
                            />
                        </div>
                    </div>
                    <div className='w-full mt-5'>
                        <Label className='mb-1'>{t('create.note')} <span className='italic text-red-500'></span></Label>
                        <Textarea 
                            placeholder={t('create.note')} 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                            className={`border-gray-300`}
                        />
                    </div>
                    <div className='flex gap-4 justify-end mt-4'>
                        {
                            formData?.applicationFormItem?.applicationForm?.reference?.requestStatusId != STATUS_ENUM.COMPLETED && (
                                <Button
                                    onClick={() => setStatusModalConfirm('reference')}
                                    disabled={staffITReferenceToManagerIT.isPending}
                                    type='submit'
                                    className='px-6 py-2 bg-green-500 hover:bg-green-600 border border-transparent rounded-md text-sm font-medium text-white cursor-pointer'
                                >
                                    {staffITReferenceToManagerIT.isPending ? <Spinner size="small" className='text-white'/> : lang == 'vi' ? 'Yêu cầu đơn mua bán' : 'Request form purchase'}
                                </Button>
                            )
                        }
                        <Button
                            onClick={() => setStatusModalConfirm('approval')}
                            disabled={resolvedTask.isPending}
                            type='submit'
                            className='px-6 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md text-sm font-medium text-white cursor-pointer'
                        >
                            {resolvedTask.isPending ? <Spinner size="small" className='text-white'/> : lang == 'vi' ? 'Đã xử lý' : 'Resolved'}
                        </Button>
                    </div>
                    <HistoryApproval historyApplicationForm={formData?.applicationFormItem?.applicationForm?.historyApplicationForms}/>
                </div>
            </div>
        </div>
    );
};

export default AssignedFormIT;

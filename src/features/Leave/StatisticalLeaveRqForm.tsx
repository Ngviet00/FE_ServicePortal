import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import MonthYearFlatPickr from '@/components/ComponentCustom/MonthYearFlatPickr';
import { useAuthStore } from '@/store/authStore';
import { RoleEnum, ShowToast, UnitEnum } from '@/lib';
import useHasRole from '@/hooks/useHasRole';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import orgUnitApi, { OrgUnit } from '@/api/orgUnitApi';
import { useGetStatisticLeave } from '@/api/leaveRequestApi';

interface StatisticLeave {
    total: number,
    totalUrgent: number,
    totalNormal: number
}

const StatisticalLeaveRqForm = () => {
    const { user } = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]

    const [month, setMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [department, setDepartment] = useState('');
    const [isCalReject, setIsCalReject] = useState(false)
    const [resultStatistic, setResultStatistic] = useState<StatisticLeave | null>(null);

    const isManagerOrGM = user?.unitId == UnitEnum.Manager || user?.unitId == UnitEnum.GM 
    const isHR = useHasRole([RoleEnum.HR])

    const getStatisticLeave = useGetStatisticLeave()

    const { data: departments = [] } = useQuery({ 
        queryKey: ['get-department-view-statistical'], 
        queryFn: async () => { 
            let res;
            if (isHR || user?.unitId == UnitEnum.GM ) {
                res = await orgUnitApi.GetAllDepartment();
            } else {
                res = await orgUnitApi.GetDepartmentsManagedByOrgPositionManager(user?.orgPositionId ?? -1);
            }
            return res.data.data;
        },
        enabled: isManagerOrGM || isHR
    });

    const handleViewStatistic = async () => {
        if (department == '') {
            ShowToast(lang == 'vi' ? 'Chưa chọn bộ phận' : 'Please select department', 'error')
            return
        }
        const res = await getStatisticLeave.mutateAsync({
            departmentId: Number(department),
            time: month,
            isCalReject
        })
        setResultStatistic(res)
    }

    const total = resultStatistic?.total ?? 0;
    const urgent = resultStatistic?.totalUrgent ?? 0;
    const normal = resultStatistic?.totalNormal ?? 0;

    const urgentPercent =
        total > 0 ? Math.round((urgent / total) * 1000) / 10 : 0;

    const normalPercent =
        total > 0 ? 100 - urgentPercent : 0;

    if (!isManagerOrGM && !isHR) {
        return <Navigate to="/forbidden" replace />;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{lang == 'vi' ? 'Thống kê nghỉ phép' : 'Leave statistics'}</h3>
            </div>

            <div>
                <div className="flex flex-wrap gap-3 items-end mb-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">{lang == 'vi' ? 'Tháng' : 'Month'}</label>
                        <MonthYearFlatPickr
                            value={month}
                            onChange={setMonth}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{lang == 'vi' ? 'Bộ phận' : 'Department'}</label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="border rounded px-3 py-1.5 text-sm cursor-pointer"
                        >
                            <option value="">--{lang == 'vi' ? 'Chọn bộ phận' : 'Choose department'}--</option>
                            {
                                departments?.map((item: OrgUnit, idx: number) => {
                                    return (
                                        <option key={idx} value={item?.id ?? -1}>{item?.name}</option>
                                    )
                                })
                            }
                        </select>
                    </div>

                    <button disabled={getStatisticLeave.isPending} onClick={handleViewStatistic} className="h-9 px-4 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer disabled:bg-gray-400">
                        {lang == 'vi' ? 'Xem' : 'View'}
                    </button>

                    <div className='flex items-center'>
                        <input className='w-5 h-5 cursor-pointer accent-black mr-1' id='cb_cal_reject' type="checkbox" checked={isCalReject} onChange={() => setIsCalReject(prev => !prev)}/>
                        <label className='select-none cursor-pointer' htmlFor="cb_cal_reject">{lang == 'vi' ? 'Tính cả những đơn bị từ chối' : 'Include rejected leave requests'} </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">
                            {lang == 'vi' ? 'Tổng số đơn nghỉ phép' : 'Total number of leave requests'}
                        </div>
                        <div className="text-2xl font-bold">{total}</div>
                    </div>

                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">
                            {lang == 'vi'
                                ? 'Nghỉ phép thông thường'
                                : 'Regular leave requests'}
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                            {normal} ~ <span className="text-gray-500">({normalPercent}%)</span>
                        </div>
                    </div>

                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">
                            {lang == 'vi'
                                ? 'Nghỉ phép khẩn cấp'
                                : 'Emergency leave requests'}
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {urgent} ~ <span className="text-gray-500">({urgentPercent}%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticalLeaveRqForm;
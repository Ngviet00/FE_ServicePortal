/* eslint-disable @typescript-eslint/no-explicit-any */
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    LineElement,
    BarElement,
    ArcElement,
    PointElement,
    Filler,
} from 'chart.js';
import { CircleCheck, Info, Ticket, ClipboardCheck, PackageCheck, CircleX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import itFormApi from '@/api/itFormApi';
import { formatDate } from '@/lib/time';
import { StatusLeaveRequest } from '@/components/StatusLeaveRequest/StatusLeaveRequestComponent';

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement, BarElement, ArcElement, Filler);

const getModernColor = () => {
    return `#4ac6f6`;
};

const StatisticalFormIT = () => {
    const { t } = useTranslation('formIT')
    const lang = useTranslation().i18n.language.split('-')[0]
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

    const { data: statisticalData, isLoading, isError } = useQuery({
        queryKey: ['get-statistical-form-it', selectedYear],
        queryFn: async () => {
            const res = await itFormApi.statistical({year: Number(selectedYear)});
            return res.data.data;
        },
    });

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
    };

    const lineData = useMemo(() => {
        const groupByMonth = statisticalData?.groupByMonth || [];
        const labels = Array.from({ length: 12 }, (_, i) => `${i + 1}-${selectedYear}`);
        const data = groupByMonth.map((item: {total: number}) => item.total)

        return {
            labels: labels,
            datasets: [
                {
                    data: data,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    }, [statisticalData?.groupByMonth, selectedYear]);

    const barData = useMemo(() => {
        const groupByDepartment = statisticalData?.groupByDepartment || [];

        return {
            labels: groupByDepartment.map((item: { name: string }) => item.name),
            datasets: [
                {
                    label: 'Số lượng',
                    data: groupByDepartment.map((item: { total: number }) => item.total),
                    backgroundColor: groupByDepartment.map(() => 
                        getModernColor()
                    ),
                    borderRadius: 4,
                    borderSkipped: false,
                }
            ],
        };
    }, [statisticalData]);

    const doughnutData = useMemo(() => {
        const groupByCategory = statisticalData?.groupByCategory || [];
        return {
            labels: groupByCategory.map((item: { name: string }) => item.name),
            datasets: [
                {
                    data: groupByCategory.map((item: { total: number }) => item.total),
                    backgroundColor: ['#25ee00', '#ff6900', '#0058ff', '#ff00f9', '#ff0042', '#cecc0f'],
                    hoverOffset: 4
                }
            ],
        };
    }, [statisticalData]);
    
    if (isLoading) {
        return <div>{t('statistical.loading')}...</div>;
    }

    if (isError) {
        return <div className='text-red-500'>{t('statistical.error')}</div>;
    }

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('statistical.title')}</h3>
            </div>

            <div className='mt-2'>
                <label className="block mb-2 font-semibold text-sm text-gray-700">{t('statistical.time')}</label>
                <YearSelect onChange={handleYearChange} defaultYear={selectedYear} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                <Link to={`/form-it/all-form-it?year=${selectedYear}`}>
                    <div className="p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                        <Ticket className='text-[#1c398e]' size={35} />
                        <h3 className="text-gray-600 mb-2">{t('statistical.total')}</h3>
                        <div className="text-3xl font-bold text-blue-900" id="totalRequests">{statisticalData?.groupByTotal?.total}</div>
                    </div>
                </Link>
                <Link to={`/form-it/all-form-it?statusId=3&year=${selectedYear}`}>
                    <div className="p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                        <CircleCheck className='text-[#1c398e]' size={35} />
                        <h3 className="text-gray-600 mb-2">{t('statistical.completed')}</h3>
                        <div className="text-3xl font-bold text-blue-900" id="slaCompliance">{statisticalData?.groupByTotal?.complete}</div>
                    </div>
                </Link>
                <Link to={`/form-it/all-form-it?statusId=1&year=${selectedYear}`}>
                    <div className="p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                        <ClipboardCheck className='text-[#1c398e]' size={35}/>
                        <h3 className="text-gray-600 mb-2">{t('statistical.pending')}</h3>
                        <div className="text-3xl font-bold text-blue-900" id="csatScore">{statisticalData?.groupByTotal?.pending}</div>
                    </div>
                </Link>
                <Link to={`/form-it/all-form-it?statusId=7&year=${selectedYear}`}>
                    <div className="p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                        <Info className='text-[#1c398e]' size={35}/>
                        <h3 className="text-gray-600 mb-2">{t('statistical.inprocess')}</h3>
                        <div className="text-3xl font-bold text-blue-900" id="openRequests">{statisticalData?.groupByTotal?.inProcess}</div>
                    </div>
                </Link>
                <Link to={`/form-it/all-form-it?statusId=8&year=${selectedYear}`}>
                    <div className="p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                        <PackageCheck className='text-[#1c398e]' size={35}/>
                        <h3 className="text-gray-600 mb-2">{lang == 'vi' ? 'Chờ xác nhận' : 'Wait confirm'}</h3>
                        <div className="text-3xl font-bold text-blue-900" id="csatScore">{statisticalData?.groupByTotal?.waitConfirm}</div>
                    </div>
                </Link>
                <Link to={`/form-it/all-form-it?statusId=5&year=${selectedYear}`}>
                    <div className="p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                        <CircleX className='text-[#1c398e]' size={35}/>
                        <h3 className="text-gray-600 mb-2">{lang == 'vi' ? 'Từ chối' : 'Reject'}</h3>
                        <div className="text-3xl font-bold text-blue-900" id="csatScore">{statisticalData?.groupByTotal?.reject}</div>
                    </div>
                </Link>
            </div>

            <div className="flex w-full gap-x-10 mb-0">
                <div className="flex-1 flex flex-col items-center p-3 rounded-lg shadow-inner border">
                    <div className='w-full flex justify-between'>
                        <h2 className="mb-5 font-semibold text-lg">{t('statistical.total_request')}</h2>
                    </div>
                    <div className="h-72 w-full">
                        <Line data={lineData} style={{ width: '100%', height: '100%' }}
                            options={{ responsive: true, maintainAspectRatio: false, plugins:{ legend: {display: false}} }} />
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center p-3 rounded-lg shadow-inner border">
                    <div className='w-full flex justify-between'>
                        <h2 className="mb-5 font-semibold text-lg">{t('statistical.total_by_type')}</h2>
                    </div>
                    <div className="h-72 w-full flex justify-center">
                        <Doughnut
                            data={doughnutData}
                            options={{ 
                                responsive: true,
                                maintainAspectRatio: false, 
                                plugins:
                                {
                                    legend: {display: true, position: 'left'},
                                    datalabels: {
                                        font: { weight: "bold", size: 15 },
                                        color: '#002f41', 
                                        anchor: 'center',
                                        align: 'center',
                                    }
                                } 
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className='mt-8'>
                <div className="flex-1 flex flex-col items-center p-3 rounded-lg shadow-inner border">
                    <div className='w-full flex justify-start'>
                        <h2 className="mb-5 font-semibold text-lg mr-5">{t('statistical.total_by_dept')}</h2>
                    </div>
                    <div className="h-72 w-full">
                        <Bar
                            data={barData}
                            style={{ width: '100%', height: '100%' }}
                            options={{ 
                                responsive: true,
                                maintainAspectRatio: false, 
                                plugins:
                                {
                                    legend: {display: false},
                                    datalabels: {
                                        font: { weight: "bold", size: 15 },
                                        color: '#002f41', 
                                        anchor: 'center',
                                        align: 'center',
                                    }
                                } 
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 mb-8 pt-2 mt-8 rounded-lg shadow-inner border">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-600">{t('statistical.recent_request')}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead>
                            <tr>
                                <th className="px-3 py-2">{t('statistical.code')}</th>
                                <th className="px-3 py-2">{t('statistical.requestor')}</th>
                                <th className="px-3 py-2">{t('statistical.department')}</th>
                                <th className="px-3 py-2">{t('statistical.reason')}</th>
                                <th className="px-3 py-2">{t('statistical.created_at')}</th>
                                <th className="px-3 py-2">{t('statistical.status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statisticalData?.groupRecentList.map((item: any, index: any) => {
                                return (
                                    <tr key={index} className="hover:bg-gray-100 cursor-pointer border-b border-[#d3d3d3d9]">
                                        <td className="px-3 py-2">
                                            <Link to={`/view/${item?.code}?requestType=${item?.requestTypeId}`} className="text-blue-700 underline">{item?.code ?? '--'}</Link>
                                        </td>
                                        <td className="px-3 py-2">{item.userNameCreatedForm}</td>
                                        <td className="px-3 py-2">{item.departmentName}</td>
                                        <td className="px-3 py-2">{item.reason}</td>
                                        <td className="px-3 py-2">{formatDate(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</td>
                                        <td className="px-3 py-2">
                                            <StatusLeaveRequest status={item?.requestStatusId}/>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StatisticalFormIT;

export interface YearSelectProps {
    onChange?: (selectedYear: string) => void;
    defaultYear?: string;
    className?: string
}

export const YearSelect: React.FC<YearSelectProps> = ({ onChange, defaultYear, className }) => {
    const startYear = 2025;
    const currentYear = new Date().getFullYear();
    const numberOfYears = currentYear - startYear + 1;
    const years = Array.from({ length: numberOfYears }, (_, i) => startYear + i).reverse();

    const [selectedYear, setSelectedYear] = useState<string>(defaultYear || currentYear.toString());

    useEffect(() => {
        if (defaultYear !== selectedYear) {
            setSelectedYear(defaultYear || currentYear.toString());
        }
    }, [defaultYear, selectedYear, currentYear]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = e.target.value;
        setSelectedYear(year);
        if (onChange) {
            onChange(year);
        }
    };

    return (
        <select value={selectedYear} className={`bg-white p-1 px-5 border rounded-[3px] hover:cursor-pointer ${className}`} onChange={handleChange}>
            {years.map((year) => (
                <option key={year} value={year}>{year}</option>
            ))}
        </select>
    );
};
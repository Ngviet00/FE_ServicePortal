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
} from 'chart.js';
import { CircleCheck, Info, Ticket, ClipboardCheck } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import itFormApi from '@/api/itFormApi';

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement, BarElement, ArcElement);

const StatisticalFormIT = () => {
    const { t } = useTranslation('formIT')

    const [dataStatistical, setDataStatistical] = useState<any>(null);
    
    useQuery({
        queryKey: ['get-statistical-form-it'],
        queryFn: async () => {
            const res = await itFormApi.statistical();
            setDataStatistical(res.data.data);
            return res.data.data;
        },
    });

    const lineData = {
        labels: ['1-2025', '2-2025', '3-2025', '4-2025', '5-2025', '6-2025', '7-2025', '8-2025', '9-2025', '10-2025', '11-2025', '12-2025'],
        datasets:[
        {
            label: 'Yêu cầu',
            data: dataStatistical?.groupByMonth?.map(item => item.total),
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            fill: true,
            tension: 0.4,
        },
        ],
    };
    const barData = {
        labels: dataStatistical?.groupByDepartment?.map(item => item.name),
        datasets: [
        {
            label: 'Loại yêu cầu',
            data: dataStatistical?.groupByDepartment?.map(item => item.total),
            backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#FF5722']
        }
        ],
    };

    const doughnutData = {
        labels: dataStatistical?.groupByCategory?.map(item => item.name),
        datasets: [
            {
                data: dataStatistical?.groupByCategory?.map(item => item.total),
                backgroundColor: ['#FFC107', '#4CAF50', '#2196F3', '#FEA107', '#FF4107', '#196F3'],
                hoverOffset: 4
            }
        ],
    };

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('statistical.title')}</h3>
            </div>

            <div className='mt-2'>
                <label className="block mb-2 font-semibold text-sm text-gray-700">{t('statistical.time')}</label>
                <DateRangePicker
                    key="1"
                    onUpdate={({ range }) => handleOnChangeSelectedTimeStatistical(range)}
                    initialDateFrom={new Date()}
                    initialDateTo={new Date()}
                    align="start"
                    locale="vi-VN"
                    showCompare={false}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link to="/form-it/all-form-it">
                    <div className="bg-[#efefef] p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                        <Ticket className='text-[#1c398e]' size={35} />
                        <h3 className="text-gray-600 mb-2">{t('statistical.total')}</h3>
                        <div className="text-3xl font-bold text-blue-900" id="totalRequests">{dataStatistical?.groupByTotal?.total?.toLocaleString()}</div>
                    </div>
                </Link>


                <Link to="/form-it/all-form-it?statusId=2">
                    <div className="bg-[#efefef] p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                        <Info className='text-[#1c398e]' size={35}/>
                        <h3 className="text-gray-600 mb-2">{t('statistical.inprocess')}</h3>
                        <div className="text-3xl font-bold text-blue-900" id="openRequests">{dataStatistical?.groupByTotal?.inProcess?.toLocaleString()}</div>
                    </div>
                </Link>

                <Link to="/form-it/all-form-it?statusId=3">
                    <div className="bg-[#efefef] p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                        <CircleCheck className='text-[#1c398e]' size={35} />
                        <h3 className="text-gray-600 mb-2">{t('statistical.completed')}</h3>
                        <div className="text-3xl font-bold text-blue-900" id="slaCompliance">{dataStatistical?.groupByTotal?.complete?.toLocaleString()}</div>
                    </div>
                </Link>

                <Link to="/form-it/all-form-it?statusId=1">
                    <div className="bg-[#efefef] p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                        <ClipboardCheck className='text-[#1c398e]' size={35}/>
                        <h3 className="text-gray-600 mb-2">{t('statistical.pending')}</h3>
                        <div className="text-3xl font-bold text-blue-900" id="csatScore">{dataStatistical?.groupByTotal?.pending?.toLocaleString()}</div>
                    </div>
                </Link>

            </div>

            <div className="flex w-full gap-x-10 mb-0">
                <div className="flex-1 flex flex-col items-center bg-[#efefef] p-3 rounded-lg shadow-inner border">
                    <div className='w-full flex justify-between'>
                        <h2 className="mb-5 font-semibold text-lg">{t('statistical.total_request')}</h2>
                        <div>
                            <SelectOptionChart/>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <Line data={lineData} style={{ width: '100%', height: '100%' }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false
                            }} />
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center bg-[#efefef] p-3 rounded-lg shadow-inner border">
                    <div className='w-full flex justify-between'>
                        <h2 className="mb-5 font-semibold text-lg">{t('statistical.total_by_type')}</h2>
                        <div>
                            <SelectOptionChart/>
                        </div>
                    </div>
                    <div className="h-72 w-full flex justify-center">
                        <Doughnut data={doughnutData}/>
                    </div>
                </div>
            </div>

            <div className='mt-8'>
                <div className="flex-1 flex flex-col items-center bg-[#efefef] p-3 rounded-lg shadow-inner border">
                    <div className='w-full flex justify-start'>
                        <h2 className="mb-5 font-semibold text-lg mr-5">{t('statistical.total_by_dept')}</h2>
                        <div>
                            <SelectOptionChart/>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <Bar
                            data={barData}
                            style={{ width: '100%', height: '100%' }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[#efefef] p-6 mb-8 pt-2 mt-8 rounded-lg shadow-inner border">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-600">{t('statistical.recent_request')}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead>
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">{t('statistical.content')}</th>
                                <th className="px-3 py-2">{t('statistical.user_sent')}</th>
                                <th className="px-3 py-2">{t('statistical.dept')}</th>
                                <th className="px-3 py-2">{t('statistical.time_sent')}</th>
                                <th className="px-3 py-2">{t('statistical.status')}</th>
                                <th className="px-3 py-2">{t('statistical.priority')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                dataStatistical?.groupRecentList.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-100 cursor-pointer border-b border-[#d3d3d3d9]">
                                        <td className="px-3 py-2">{item.code}</td>
                                        <td className="px-3 py-2">{item.reason}</td>
                                        <td className="px-3 py-2">{item.userNameRequestor}</td>
                                        <td className="px-3 py-2">{item.departmentName}</td>
                                        <td className="px-3 py-2">{item.createdAt}</td>
                                        <td className="px-3 py-2">{item.requestStatus}</td>
                                        <td className="px-3 py-2">{item.namePriority}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default StatisticalFormIT;

const SelectOptionChart = () => {
    return (
        <select name="" id="" className='bg-white p-1 px-5 border border-gray-400 rounded-[3px] hover:cursor-pointer'>
            <option value="">2025</option>
        </select>
    )
}
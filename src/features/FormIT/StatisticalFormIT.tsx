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
import { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement, BarElement, ArcElement);

const StatisticalFormIT = () => {
    const lineData = {
        labels: ['1-2025', '2-2025', '3-2025', '4-2025', '5-2025', '6-2025', '7-2025', '8-2025', '9-2025', '10-2025', '11-2025', '12-2025'],
        datasets:[
        {
            label: 'Yêu cầu',
            data: [10, 15, 8, 12, 10, 15, 8, 12, 10, 3, 8, 12],
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            fill: true,
            tension: 0.4,
        },
        ],
    };
    const barData = {
        labels: ['MIS', 'HR', 'Production', 'Commercial', 'CMPBU', 'MIS', 'HR', 'Production', 'Commercial', 'CMPBU', 'MIS', 'HR', 'Production', 'Commercial'],
        datasets: [
        {
            label: 'Loại yêu cầu',
            data: [15, 9, 40, 5, 7, 1],
            backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#FF5722']
        }
        ],
    };

    const doughnutData = {
        labels: ['Server', 'Network', 'Email', 'Software', 'ERP', 'Other'],
        datasets: [
        {
            data: [300, 500, 200, 600, 200, 800],
            backgroundColor: ['#FFC107', '#4CAF50', '#2196F3', '#FEA107', '#FF4107', '#196F3'],
            hoverOffset: 4
        }
        ],
    };

    const dummyData = {
        kpis: {
            totalRequests: 4567,
            openRequests: 1325,
            slaCompliance: 22,
            csatScore: 44,
        },
        requestsOverTime: {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7'],
        data: [500, 550, 480, 600, 620, 580, 650],
        },
        avgResolutionTime: {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7'],
        data: [3.5, 3.2, 3.8, 2.9, 2.7, 3.1, 2.5],
        },
        requestsByDepartment: {
            'Kinh Doanh': 1200,
            'Marketing': 800,
            'Nhân Sự': 500,
            'Kỹ Thuật': 1500,
            'Kế Toán': 400,
            'Khác': 167,
        },
        requestsByTypePriority: {
            labels: ['Lỗi Phần cứng', 'Cài đặt PM', 'Lỗi Mạng', 'Tài khoản', 'Yêu cầu mới', 'Khác'],
            critical: [100, 20, 50, 10, 5, 5],
            high: [200, 80, 120, 40, 15, 10],
            medium: [300, 150, 180, 80, 30, 20],
            low: [150, 100, 100, 50, 20, 10],
        },
        recentRequests: [
            { id: '#00125', title: 'Máy tính bị treo đột ngột', sender: 'Nguyễn Thị Hoa', department: 'Kinh Doanh', date: '2025-07-20 14:30', status: 'In-Progress', priority: 'Cao' },
            { id: '#00124', title: 'Cài đặt phần mềm Adobe Premiere', sender: 'Trần Văn Mạnh', department: 'Marketing', date: '2025-07-20 10:00', status: 'New', priority: 'Trung bình' },
            { id: '#00123', title: 'Không truy cập được mạng nội bộ', sender: 'Lê Thuỳ Linh', department: 'Kế Toán', date: '2025-07-19 16:15', status: 'Resolved', priority: 'Khẩn cấp' },
            { id: '#00122', title: 'Yêu cầu chuột không dây mới', sender: 'Phạm Minh Đức', department: 'Nhân Sự', date: '2025-07-19 11:45', status: 'Closed', priority: 'Thấp' },
            { id: '#00121', title: 'Lỗi hiển thị dữ liệu trên hệ thống CRM', sender: 'Hoàng Long', department: 'Kinh Doanh', date: '2025-07-18 09:00', status: 'In-Progress', priority: 'Cao' },
            { id: '#00120', title: 'Mất mật khẩu email công ty', sender: 'Vũ Thị Phương', department: 'Kỹ Thuật', date: '2025-07-17 14:00', status: 'New', priority: 'Khẩn cấp' },
            { id: '#00119', title: 'Máy in không hoạt động', sender: 'Ngô Hải An', department: 'Marketing', date: '2025-07-17 10:30', status: 'Resolved', priority: 'Cao' },
            { id: '#00120', title: 'Mất mật khẩu email công ty', sender: 'Vũ Thị Phương', department: 'Kỹ Thuật', date: '2025-07-17 14:00', status: 'New', priority: 'Khẩn cấp' },
            { id: '#00119', title: 'Máy in không hoạt động', sender: 'Ngô Hải An', department: 'Marketing', date: '2025-07-17 10:30', status: 'Resolved', priority: 'Cao' },
            { id: '#00120', title: 'Mất mật khẩu email công ty', sender: 'Vũ Thị Phương', department: 'Kỹ Thuật', date: '2025-07-17 14:00', status: 'New', priority: 'Khẩn cấp' },
            { id: '#00119', title: 'Máy in không hoạt động', sender: 'Ngô Hải An', department: 'Marketing', date: '2025-07-17 10:30', status: 'Resolved', priority: 'Cao' },
        ],
    };

    const handleOnChangeSelectedTimeStatistical = (range: DateRange) => {
        console.log(range);
    }

    const { t } = useTranslation('formIT')

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
                <div className="bg-[#efefef] p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                    <Ticket className='text-[#1c398e]' size={35} />
                    <h3 className="text-gray-600 mb-2">{t('statistical.total')}</h3>
                    <div className="text-3xl font-bold text-blue-900" id="totalRequests">{dummyData.kpis.totalRequests.toLocaleString()}</div>
                </div>

                <div className="bg-[#efefef] p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                    <Info className='text-[#1c398e]' size={35}/>
                    <h3 className="text-gray-600 mb-2">{t('statistical.inprocess')}</h3>
                    <div className="text-3xl font-bold text-blue-900" id="openRequests">{dummyData.kpis.openRequests.toLocaleString()}</div>
                </div>

                <div className="bg-[#efefef] p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                    <CircleCheck className='text-[#1c398e]' size={35} />
                    <h3 className="text-gray-600 mb-2">{t('statistical.completed')}</h3>
                    <div className="text-3xl font-bold text-blue-900" id="slaCompliance">{dummyData.kpis.slaCompliance}</div>
                </div>

                <Link to="/form-it/all-form-it">
                    <div className="bg-[#efefef] p-6 rounded-lg shadow-inner flex flex-col items-center text-center border">
                        <ClipboardCheck className='text-[#1c398e]' size={35}/>
                        <h3 className="text-gray-600 mb-2">{t('statistical.pending')}</h3>
                        <div className="text-3xl font-bold text-blue-900" id="csatScore">{dummyData.kpis.csatScore}</div>
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
                                dummyData.recentRequests.map((req, index) => (
                                    <tr key={index} className="hover:bg-gray-100 cursor-pointer border-b border-[#d3d3d3d9]">
                                        <td className="px-3 py-2">{req.id}</td>
                                        <td className="px-3 py-2">{req.title}</td>
                                        <td className="px-3 py-2">{req.sender}</td>
                                        <td className="px-3 py-2">{req.department}</td>
                                        <td className="px-3 py-2">{req.date}</td>
                                        <td className="px-3 py-2">
                                        <span className={`px-2 py-1 rounded-full text-white text-xs uppercase ${
                                            req.status === 'New' ? 'bg-blue-500' :
                                            req.status === 'In-Progress' ? 'bg-yellow-400' :
                                            req.status === 'Resolved' ? 'bg-green-500' :
                                            req.status === 'Closed' ? 'bg-gray-500' : ''
                                        }`}>
                                            {req.status}
                                        </span>
                                        </td>
                                        <td className="px-3 py-2">{req.priority}</td>
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
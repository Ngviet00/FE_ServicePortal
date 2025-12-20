import timekeepingApi, { WorkingDay } from "@/api/HR/timeKeepingApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ShowToast } from "@/lib";
import { formatDate } from "@/lib/time";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next"
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import { formatDateToInputString } from "./Components/functions";
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
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(Title, Tooltip, Legend, ChartDataLabels, CategoryScale, LinearScale, LineElement, PointElement, BarElement, ArcElement, Filler);

const formatHour = (minutes: number) => {
    if (minutes < 60) return 0;
    const hours = minutes / 60;
    return hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1);
};

const COLOR_MAP: Record<string, string> = {
    "Đi làm": "#ff8709",
    "Tăng ca": "#00cc34",
    "Đi muộn": "#ff2010",
    "Về sớm": "#1100ff",
    "Ra ngoài": "#7900ff",
};

export default function Timekeeping () {
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [btnLoading, setBtnLoading] = useState(false)
    const { t } = useTranslation()
    const { t: tCommon } = useTranslation('common')
    const {user} = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]

    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        
        setFromDate(formatDateToInputString(firstDay));
        setToDate(formatDateToInputString(now));
    }, []);

    const handleSearch = async () => {
        const from = new Date(fromDate);
        const to = new Date(toDate);

        const diffTime = to.getTime() - from.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);

        if (diffDays < 0) {
            ShowToast(t('time_keeping.error_from_date_larger_than_to_date'), "error");
            return;
        }

        if (diffDays > 32) {
            ShowToast(t('time_keeping.more_than_30_day'), "error");
            return;
        }

        setBtnLoading(true)
        refetch()
    }

    const { data: personalTimekeepingData, isPending, isError, error, refetch } = useQuery({
        queryKey: ['personal-timekeeping'],
        queryFn: async () => {
            const res = await timekeepingApi.getPersonalTimeKeeping({
                UserCode: user?.userCode ?? "",
                FromDate: fromDate,
                ToDate: toDate
            });
            setBtnLoading(false)
            return res.data.data;
        },
        enabled: !!fromDate && !!toDate && !!user?.userCode
    });

    const handleFromDateChange = (fromDate: string) => {
        setFromDate(fromDate);
        const newDate = new Date(fromDate);
        const currentTo = new Date(toDate);

        if (newDate.getFullYear() !== currentTo.getFullYear() || newDate.getMonth() !== currentTo.getMonth()) {
            const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
            const lastDayStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
            setToDate(lastDayStr);
        }
    };

    const handleToDateChange = (toDate: string) => {
        setToDate(toDate);
        const newDate = new Date(toDate);
        const currentFrom = new Date(fromDate);

        if (newDate.getFullYear() !== currentFrom.getFullYear() || newDate.getMonth() !== currentFrom.getMonth()) {
            const firstDay = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
            const firstDayStr = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`;
            setFromDate(firstDayStr);
        }
    };

    const { doughnutData, filtered } = useMemo(() => {
        if (!personalTimekeepingData) return { doughnutData: null, filtered: [] };

        let totalWork = 0;
        let ot = 0;
        let late = 0;
        let early = 0;
        let goOut = 0;

        personalTimekeepingData.forEach((item: WorkingDay) => {
            const lamThemNgay = Number(item.LamThemNgay || 0);
            if (lamThemNgay >= 60) ot += lamThemNgay / 60;

            const lamThemToi = Number(item.LamThemToi || 0);
            if (lamThemToi >= 60) ot += lamThemToi / 60;

            const diMuon = Number(item.DiMuon || 0);
            if (diMuon > 0) late += diMuon;

            const veSom = Number(item.VeSom || 0);
            if (veSom > 0) early += veSom;

            const raNgoai = Number(item.RaNgoai || 0);
            if (raNgoai > 0) goOut += raNgoai;

            if (item.InDau && item.OutCuoi && item.InDau !== "N/A" && item.OutCuoi !== "N/A") {
                totalWork++;
            }
        });

        const rawData = [
            { label: "Đi làm", value: totalWork },
            { label: "Tăng ca", value: ot },
            { label: "Đi muộn", value: late },
            { label: "Về sớm", value: early },
            { label: "Ra ngoài", value: goOut },
        ];

        const filtered = rawData.filter(x => x.value > 0);
        const percent = filtered.length ? 100 / filtered.length : 0;

        const doughnutData = {
            labels: filtered.map(x => x.label),
            datasets: [
                {
                    data: filtered.map(() => percent),
                    rawValues: filtered.map(x => x.value),
                    backgroundColor: filtered.map(x => COLOR_MAP[x.label]),
                    hoverOffset: 4
                }
            ]
        };

        return { doughnutData, filtered };

    }, [personalTimekeepingData]);

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">{t('time_keeping.time_keeping')}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-sm font-medium whitespace-nowrap">
                        {t('time_keeping.from')}
                    </label>
                    <DateTimePicker
                        enableTime={false}
                        dateFormat="Y-m-d"
                        initialDateTime={fromDate}
                        onChange={(_selectedDates, dateStr) => handleFromDateChange(dateStr)}
                        className="dark:bg-[#454545] shadow-xs border border-gray-300 p-1 rounded-[5px] hover:cursor-pointer w-full sm:w-[160px]"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-sm font-medium whitespace-nowrap">
                        {t('time_keeping.to')}
                    </label>
                    <DateTimePicker
                        enableTime={false}
                        dateFormat="Y-m-d"
                        initialDateTime={toDate}
                        onChange={(_selectedDates, dateStr) => handleToDateChange(dateStr)}
                        className="dark:bg-[#454545] shadow-xs border border-gray-300 p-1 rounded-[5px] hover:cursor-pointer w-full sm:w-[160px]"
                    />
                </div>

                <div className="w-full sm:w-auto">
                    <Button
                        className="w-full sm:w-auto mt-1 sm:mt-0 hover:cursor-pointer"
                        onClick={handleSearch}
                        disabled={btnLoading}
                    >
                        {btnLoading ? <Spinner className="text-white" /> : t('time_keeping.btn_search')}
                    </Button>
                </div>
            </div>
            {
                personalTimekeepingData && personalTimekeepingData.length > 0 && doughnutData?.labels != undefined && doughnutData?.labels?.length > 0 && (
                    <div className="w-full max-w-[600px] mx-auto">
                        <div className="relative h-[350px] sm:h-[400px]">
                            <Doughnut 
                                data={doughnutData ?? { labels: [], datasets: [] }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        tooltip: { enabled: false },
                                        legend: {
                                            position: "bottom",
                                            labels: { font: { size: 12 } }
                                        },
                                        datalabels: {
                                            color: "#fff",
                                            font: { weight: "bold", size: 14 },
                                            formatter: (_value, ctx) => {
                                                const label = ctx.chart.data.labels?.[ctx.dataIndex] ?? "";
                                                const raw = filtered[ctx.dataIndex]?.value ?? 0;
                                                let unit = "";
                                                switch (label) {
                                                    case "Đi làm":
                                                        unit = "ngày";
                                                        break;
                                                    case "Tăng ca":
                                                        unit = "giờ";
                                                        break;
                                                    case "Đi muộn":
                                                        unit = "phút";
                                                        break;
                                                    case "Về sớm":
                                                        unit = "phút";
                                                        break;
                                                    case "Ra ngoài":
                                                        unit = "phút";
                                                        break;
                                                    default:
                                                        unit = "";
                                                }

                                                let convertHour = null
                                                if (label == 'Đi muộn' || label == 'Về sớm' || label == 'Ra ngoài') {
                                                    convertHour = parseFloat(((raw ?? 0) / 60).toFixed(2)) + " giờ"
                                                }

                                                return `${label}\n(${raw} ${unit} ${convertHour != null ? '\n~' + convertHour : ''})`;
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                )
            }
            <span className="text-amber-700 font-semibold italic">{lang == 'vi' ? 'Số giờ tăng ca đang hiển thị theo giờ vào và giờ ra' : 'Overtime hours are currently displayed based on check in and check out times.'}</span>
            <div className="mt-1">
                <div className="overflow-auto max-h-[600px] border rounded">
                    <table className="min-w-full text-sm border-collapse">
                        <thead className="bg-gray-100 sticky top-0 z-20">
                            <tr>
                                <th className="sticky top-0 z-20 border-x p-1 w-[115px]">{t('time_keeping.usercode')}</th>
                                <th className="sticky top-0 border-x z-20 p-1 w-[170px]">{t('time_keeping.username')}</th>
                                <th className="p-1 border-x w-[100px]">{t('time_keeping.date')}</th>
                                <th className="p-1 border-x w-[50px]">{t('time_keeping.day')}</th>
                                <th className="p-1 border-x w-[60px]">{t('time_keeping.shift')}</th>
                                <th className="p-1 border-x w-[80px]">{t('time_keeping.from')}</th>
                                <th className="p-1 border-x w-[80px]">{t('time_keeping.to')}</th>
                                <th className="p-1 border-x w-[130px]">{t('time_keeping.day_time_work')}</th>
                                <th className="p-1 border-x w-[140px]">{t('time_keeping.night_time_work')}</th>
                                <th className="p-1 border-x w-[150px]">{t('time_keeping.day_ot_work')}</th>
                                <th className="p-1 border-x w-[160px]">{t('time_keeping.night_ot_work')}</th>
                                <th className="p-1 border-x w-[100px]">{t('time_keeping.late')}</th>
                                <th className="p-1 border-x w-[100px]">{t('time_keeping.early')}</th>
                                <th className="p-1 border-x w-[100px]">{t('time_keeping.go_out')}</th>
                                <th className="p-1 border-x  w-[100px]">{t('time_keeping.note')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                        </tr>  
                                    ))
                                ) : isError || personalTimekeepingData?.length == 0 || personalTimekeepingData == null ? (
                                    <tr>
                                        <td colSpan={16} className="px-4 py-2 text-center font-bold text-red-700">
                                            { error?.message ?? tCommon('no_results') } 
                                        </td>
                                    </tr>
                                ) : (
                                    personalTimekeepingData?.map((item: WorkingDay, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item.NVMaNV}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item.NVHoTen}</td>
                                            <td className={`${item?.Thu == 'Chủ Nhật' || item?.Thu == 'Sun' ? 'font-bold text-red-600' : ''} px-4 py-2 border whitespace-nowrap`}>{item?.BCNgay ? formatDate(item?.BCNgay, "dd-MM-yyyy") : "--"}</td>
                                            <td className={`${item?.Thu == 'Chủ Nhật' || item?.Thu == 'Sun' ? 'font-bold text-red-600' : ''} px-4 py-2 text-center border whitespace-nowrap`}>
                                                {
                                                    lang == 'vi' ? item?.Thu : item?.ThuE
                                                }
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item.CVietTat}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item.InDau}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item.OutCuoi}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.BCTGLamNgay1}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.BCTGLamToi1}</td>
                                            <td className={`${item?.LamThemNgay != 0 && (item?.LamThemNgay ?? 0) >= 60 
                                                ? 'font-bold text-green-800 bg-green-300' 
                                                : ''} px-4 py-2 border whitespace-nowrap text-center`}>
                                                {formatHour(item?.LamThemNgay ?? 0)}
                                            </td>

                                            <td className={`${item?.LamThemToi != 0 && (item?.LamThemToi ?? 0) >= 60 
                                                ? 'font-bold text-green-800 bg-green-300' 
                                                : ''} px-4 py-2 border whitespace-nowrap text-center`}>
                                                {formatHour(item?.LamThemToi ?? 0)}
                                            </td>
                                            <td className={`${item?.DiMuon != '0' ? 'font-bold bg-red-600 text-white' : ''} px-4 py-2 border whitespace-nowrap text-center`}>{item?.DiMuon}</td>
                                            <td className={`${item?.VeSom != '0' ? 'font-bold bg-red-600 text-white' : ''} px-4 py-2 border whitespace-nowrap text-center`}>{item?.VeSom}</td>
                                            <td className={`${item?.RaNgoai != '0' ? 'font-bold bg-red-600 text-white' : ''} px-4 py-2 border whitespace-nowrap text-center`}>{item?.RaNgoai}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.BCGhiChu}</td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
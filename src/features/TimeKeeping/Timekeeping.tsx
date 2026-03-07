/* eslint-disable @typescript-eslint/no-explicit-any */
import timekeepingApi from "@/api/HR/timeKeepingApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next"
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
import MonthYearFlatPickr from "@/components/ComponentCustom/MonthYearFlatPickr";

ChartJS.register(Title, Tooltip, Legend, ChartDataLabels, CategoryScale, LinearScale, LineElement, PointElement, BarElement, ArcElement, Filler);

const formatHour = (minutes: number) => {
    if (minutes < 60) return 0;
    const hours = minutes / 60;
    return hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1);
};

const COLOR_MAP: Record<string, string> = {
    "Đi làm": "#ff8709",
    "Tăng ca": "#00cc34",
    "Đi trễ về sớm": "#ff2010",
    "Ra ngoài": "#7900ff",
};

export default function Timekeeping () {
    const { t } = useTranslation()
    const { t: tCommon } = useTranslation('common')
    const {user} = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]

    const [month, setMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const { data: personalTimekeepingData, isFetching } = useQuery({
        queryKey: ['personal-timekeeping', month],
        queryFn: async () => {
            const res = await timekeepingApi.getPersonalTimeKeeping({
                userCode: user?.userCode ?? "",
                yearMonth: month
            });
            return res.data.data;
        }
    });

    const { doughnutData, filtered } = useMemo(() => {
        if (!personalTimekeepingData) return { doughnutData: null, filtered: [] };

        let totalWork = 0;
        let ot = 0;
        let earlyLate = 0;
        let goOut = 0;

        personalTimekeepingData?.results?.forEach((item: any) => {
            const otDay = Number(item?.LTNgay || 0);
            if (otDay >= 60) ot += otDay / 60;

            const otNight = Number(item?.LTDem || 0);
            if (otNight >= 60) ot += otNight / 60;

            const _earlyLate = Number(item?.VeSom || 0);
            if (_earlyLate > 0) earlyLate += _earlyLate;

            const _goOut = Number(item?.RaNgoai || 0);
            if (_goOut > 0) goOut += _goOut;

            if (item?.Den != null && item?.Ve != null) {
                totalWork++; 
            }
        });

        const rawData = [
            { label: "Đi làm", value: totalWork },
            { label: "Tăng ca", value: ot },
            { label: "Đi trễ về sớm", value: earlyLate },
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
                    hoverOffset: 3
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
                <label htmlFor="">{lang == 'vi' ? 'Chọn tháng' : 'Choose month'}</label>
                <MonthYearFlatPickr
                    value={month}
                    onChange={setMonth}
                />
            </div>
            {
                personalTimekeepingData && personalTimekeepingData?.results?.length > 0 && doughnutData?.labels != undefined && doughnutData?.labels?.length > 0 && (
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
                                            labels: { font: { size: 11 } }
                                        },
                                        datalabels: {
                                            color: "#fff",
                                            font: { weight: "bold", size: 13 },
                                            formatter: (_value, ctx) => {
                                                const label = ctx.chart.data.labels?.[ctx.dataIndex] ?? "";
                                                const raw = filtered[ctx.dataIndex]?.value ?? 0;
                                                let unit = "";
                                                switch (label) {
                                                    case "Đi làm":
                                                        unit = "ngày";
                                                        break;
                                                    case "Tăng ca":
                                                        unit = "tiếng";
                                                        break;
                                                    case "Đi trễ về sớm":
                                                        unit = "phút";
                                                        break;
                                                    case "Ra ngoài":
                                                        unit = "phút";
                                                        break;
                                                    default:
                                                        unit = "";
                                                }

                                                return `${label}\n(${raw} ${unit})`;
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
                                <th className="p-1 border-x w-[100px]">{t('time_keeping.early_late')}</th>
                                <th className="p-1 border-x w-[100px]">{t('time_keeping.go_out')}</th>
                                <th className="p-1 border-x  w-[100px]">{t('time_keeping.note')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                isFetching ? (
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
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                        </tr>  
                                    ))
                                ) : personalTimekeepingData?.results?.length == 0 && personalTimekeepingData?.success == false ? (
                                    <tr>
                                        <td colSpan={15} className="px-4 py-2 text-center font-bold text-red-700">
                                            {personalTimekeepingData?.message } 
                                        </td>
                                    </tr>
                                ) : personalTimekeepingData?.results?.length == 0 && personalTimekeepingData?.success == true ?
                                 (
                                    <tr>
                                        <td colSpan={15} className="px-4 py-2 text-center font-bold text-red-700">
                                            {tCommon('no_results') } 
                                        </td>
                                    </tr>
                                ) : (
                                    personalTimekeepingData?.results?.map((item: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.MaNV ?? user?.userCode}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.HoTen ?? user?.userName}</td>
                                            <td className={`${item?.Thu == 'Chủ Nhật' || item?.Thu == 'Sun' ? 'font-bold text-red-600' : ''} px-4 py-2 border whitespace-nowrap`}>{item?.Ngay ?? "--"}</td>
                                            <td className={`${item?.Thu == 'Chủ Nhật' || item?.Thu == 'Sun' ? 'font-bold text-red-600' : ''} px-4 py-2 text-center border whitespace-nowrap`}>
                                                {item?.Thu}
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.Ca ?? '--'}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.Den ?? '--'}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.Ve ?? '--'}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.TGLamNgay ?? '--'}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.TGLamDem ?? '--'}</td>
                                            <td className={`${item?.LTNgay != 0 && (item?.LTNgay ?? 0) >= 60 
                                                ? 'font-bold text-green-800 bg-green-300' 
                                                : ''} px-4 py-2 border whitespace-nowrap text-center`}>
                                                {formatHour(item?.LTNgay ?? 0)}
                                            </td>
                                            <td className={`${item?.LTDem != 0 && (item?.LTDem ?? 0) >= 60 
                                                ? 'font-bold text-green-800 bg-green-300' 
                                                : ''} px-4 py-2 border whitespace-nowrap text-center`}>
                                                {formatHour(item?.LTDem ?? 0)}
                                            </td>
                                            <td className={`${item?.VeSom != '0' ? 'font-bold bg-red-600 text-white' : ''} px-4 py-2 border whitespace-nowrap text-center`}>{item?.VeSom}</td>
                                            <td className={`${item?.RaNgoai != '0' ? 'font-bold bg-red-600 text-white' : ''} px-4 py-2 border whitespace-nowrap text-center`}>{item?.RaNgoai}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.GhiChu ?? '--'}</td>
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
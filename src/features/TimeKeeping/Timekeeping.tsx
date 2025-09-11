import timekeepingApi, { WorkingDay } from "@/api/timeKeepingApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ShowToast } from "@/lib";
import { formatDate } from "@/lib/time";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";
import { formatDateToInputString } from "./Components/functions";

export default function Timekeeping () {
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [btnLoading, setBtnLoading] = useState(false)
    const { t } = useTranslation()
    const { t: tCommon } = useTranslation('common')
    const {user} = useAuthStore()

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
            calculatorWorking(res.data.data)
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

    function calculatorWorking(personalTimekeepingData: Array<WorkingDay>) {
        let otDay: number = 0;
        let otNight: number = 0;
        let totalWork: number = 0;

        if (Array.isArray(personalTimekeepingData)) {
            personalTimekeepingData.forEach((item: WorkingDay) => {
                const lamThemNgayValue = Number(item.LamThemNgay || 0);
                if (lamThemNgayValue !== 0 && lamThemNgayValue >= 60) {
                    otDay += lamThemNgayValue;
                }

                const lamThemToiValue = Number(item.LamThemToi || 0);
                if (lamThemToiValue !== 0 && lamThemToiValue >= 60) {
                    otNight += lamThemToiValue;
                }

                if (!["", "N/A"].includes(item.InDau ?? "") && !["", "N/A"].includes(item.OutCuoi ?? "")) {
                    totalWork += 1;
                }
            });
        }

        return { totalWork, otDay, otNight };
    }

    const { totalWork, otDay, otNight } = calculatorWorking(personalTimekeepingData || []);

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">{t('time_keeping.time_keeping')}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <label>{t('time_keeping.from')}</label>
                <DateTimePicker
                    enableTime={false}
                    dateFormat="Y-m-d"
                    initialDateTime={fromDate}
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    onChange={(_selectedDates, dateStr, _instance) => {
                        handleFromDateChange(dateStr)
                    }}
                    className={`dark:bg-[#454545] shadow-xs border border-gray-300 p-1 rounded-[5px] hover:cursor-pointer`}
                />

                <div className="flex flex-wrap items-center gap-2 ml-4">
                    <label>{t('time_keeping.to')}</label>
                    <DateTimePicker
                        enableTime={false}
                        dateFormat="Y-m-d"
                        initialDateTime={toDate}
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        onChange={(_selectedDates, dateStr, _instance) => {
                            handleToDateChange(dateStr)
                        }}
                        className={`dark:bg-[#454545] shadow-xs border border-gray-300 p-1 rounded-[5px] hover:cursor-pointer`}
                    />
                </div>

                <Button className="w-full sm:w-auto mt-2 sm:mt-0 hover:cursor-pointer" onClick={handleSearch} disabled={btnLoading}>
                    {btnLoading ? <Spinner className="text-white"/> : t('time_keeping.btn_search')}
                </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-y-2 mt-4">
                <span>{t('time_keeping.total_date_work')}: <span className="font-bold text-red-800">{totalWork}</span></span>
                <span>{t('time_keeping.day_ot')}: <span className="font-bold text-red-800">{(otDay/60).toFixed(1)}</span></span>
                <span>{t('time_keeping.night_ot')}: <span className="font-bold text-red-800">{(otNight/60).toFixed(1)}</span></span>
            </div>
            <div className="mt-5">
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
                                            <td className={`${item?.Thu == 'CN' ? 'font-bold text-red-600' : ''} px-4 py-2 border whitespace-nowrap`}>{item?.BCNgay ? formatDate(item?.BCNgay, "dd/MM/yyyy") : "--"}</td>
                                            <td className={`${item?.Thu == 'CN' ? 'font-bold text-red-600' : ''} px-4 py-2 text-center border whitespace-nowrap`}>{item?.Thu}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item.CVietTat}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item.InDau}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item.OutCuoi}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.BCTGLamNgay1}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">{item?.BCTGLamToi1}</td>
                                            <td className={`${item?.LamThemNgay != 0 && (item?.LamThemNgay ?? 0) >= 60 ? 'font-bold text-green-800 bg-green-300' : ''} px-4 py-2 border whitespace-nowrap text-center`}>{(item?.LamThemNgay ?? 0) >= 60 ? item?.LamThemNgay : 0}</td>
                                            <td className={`${item?.LamThemToi != 0 && (item?.LamThemToi ?? 0) >= 60 ? 'font-bold text-green-800 bg-green-300' : ''} px-4 py-2 border whitespace-nowrap text-center`}>{(item?.LamThemToi ?? 0) >= 60 ? item.LamThemToi : 0}</td>
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
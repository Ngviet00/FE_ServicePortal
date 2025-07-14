import timekeepingApi, { WorkingDay } from "@/api/timeKeepingApi";
import { DateInput } from "@/components/DateInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShowToast } from "@/lib";
import { formatDate } from "@/lib/time";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"
import { formatDateToInputString } from "./Components/functions";

export default function Timekeeping () {
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [btnLoading, setBtnLoading] = useState(false)
    const { t } = useTranslation()
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

    const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFromDate = e.target.value;
        setFromDate(newFromDate);

        const newDate = new Date(newFromDate);
        const currentTo = new Date(toDate);

        if (
            newDate.getFullYear() !== currentTo.getFullYear() ||
            newDate.getMonth() !== currentTo.getMonth()
        ) {
            const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
            const lastDayStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
            setToDate(lastDayStr);
        }
    };

    const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newToDate = e.target.value;
        setToDate(newToDate);

        const newDate = new Date(newToDate);
        const currentFrom = new Date(fromDate);

        if (
            newDate.getFullYear() !== currentFrom.getFullYear() ||
            newDate.getMonth() !== currentFrom.getMonth()
        ) {
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
                <Label className="min-w-[40px]">{t('time_keeping.from')}</Label>
                <DateInput value={fromDate} onChange={handleFromDateChange} className="w-[160px] sm:w-40"/>

                <div className="flex">
                    <Label className="min-w-[20px] sm:ml-4 w-[50px]">{t('time_keeping.to')}</Label>
                    <DateInput value={toDate} onChange={handleToDateChange} className="w-[160px] sm:w-40"/>
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
            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="min-w-[1200px]">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b bg-gray-300 hover:bg-gray-400 dark:bg-black dark:text-white">
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.usercode')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.username')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.dept')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.date')}</TableHead>
                                <TableHead className="w-[50px] text-center border-r">{t('time_keeping.day')}</TableHead>
                                <TableHead className="w-[50px] text-center border-r">{t('time_keeping.shift')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.from')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.to')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.day_time_work')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.night_time_work')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.day_ot_work')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.night_ot_work')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.late')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.early')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.go_out')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r">{t('time_keeping.note')}</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            { 
                                isPending ? (
                                    Array.from({ length: 10 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        </TableRow>
                                    ))
                                ) : isError || personalTimekeepingData?.length == 0 || personalTimekeepingData == null ? (
                                    <TableRow>
                                        <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={15}>{error?.message ?? "No results"}</TableCell>
                                    </TableRow>
                                ) : 
                                (
                                    personalTimekeepingData?.map((item: WorkingDay, idx: number) => (
                                        <TableRow key={idx} className={`border-b hover:bg-gray-300`}>
                                            <TableCell className="text-center border-r">{item?.NVMaNV}</TableCell>
                                            <TableCell className="text-center border-r">{item?.NVHoTen}</TableCell>
                                            <TableCell className="text-center border-r">{item?.BPTenV}</TableCell>
                                            <TableCell className={`text-center border-r ${item?.Thu == 'CN' ? 'font-bold text-red-600' : ''}`}>
                                                {item?.BCNgay ? formatDate(item?.BCNgay, "dd/MM/yyyy") : "--"}
                                            </TableCell>
                                            <TableCell className={`text-center border-r ${item?.Thu == 'CN' ? 'font-bold text-red-600' : ''}`}>{item?.Thu}</TableCell>
                                            <TableCell className="text-center border-r">{item?.CVietTat}</TableCell>
                                            <TableCell className="text-center border-r">{item.InDau}</TableCell>
                                            <TableCell className="text-center border-r">{item?.OutCuoi}</TableCell>
                                            <TableCell className={`text-center border-r`}>{item?.BCTGLamNgay1}</TableCell>
                                            <TableCell className="text-center border-r">{item?.BCTGLamToi1}</TableCell>
                                            <TableCell className={`text-center border-r ${item?.LamThemNgay != 0 && (item?.LamThemNgay ?? 0) >= 60 ? 'font-bold text-green-800 bg-green-300' : ''}`}>
                                                {(item?.LamThemNgay ?? 0) >= 60 ? item?.LamThemNgay : 0}
                                            </TableCell>
                                            <TableCell className={`text-center border-r ${item?.LamThemToi != 0 && (item?.LamThemToi ?? 0) ? 'font-bold text-green-800 bg-green-300' : ''}`}>
                                                {(item?.LamThemToi ?? 0) >= 60 ? item.LamThemToi : 0}
                                            </TableCell>
                                            <TableCell className={`text-center border-r ${item?.DiMuon != '0' ? 'font-bold bg-red-600 text-white' : ''}`}>{item?.DiMuon}</TableCell>
                                            <TableCell className={`text-center border-r ${item?.VeSom != '0' ? 'font-bold bg-red-600 text-white' : ''}`}>{item?.VeSom}</TableCell>
                                            <TableCell className={`text-center border-r ${item?.RaNgoai != '0' ? 'font-bold bg-red-600' : ''}`}>{item?.RaNgoai}</TableCell>
                                            <TableCell className="text-center border-r font-bold">{item?.BCGhiChu}</TableCell>
                                        </TableRow>
                                    ))
                                )
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
import timekeepingApi, { DataTimeKeeping } from "@/api/timeKeeping";
import { DateInput } from "@/components/DateInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShowToast } from "@/lib";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"

function formatDateToInputString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function Timekeeping () {
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
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

        refetch();
    }

    const { data: personalTimekeepingData, isPending, isError, error, refetch } = useQuery({
        queryKey: ['personal-timekeeping'],
        queryFn: async () => {
            const res = await timekeepingApi.getPersonalTimeKeeping({
                UserCode: user?.userCode ?? "",
                FromDate: fromDate,
                ToDate: toDate
            });
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

                <Button className="w-full sm:w-auto mt-2 sm:mt-0 hover:cursor-pointer" onClick={handleSearch} disabled={isPending}>
                    {isPending ? <Spinner className="text-white"/> : t('time_keeping.btn_search')}
                </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-y-2 mt-4">
                <span>{t('time_keeping.total_date_work')}: <span className="font-bold text-red-800">20</span></span>
                <span>{t('time_keeping.day_ot')}: <span className="font-bold text-red-800">24</span></span>
                <span>{t('time_keeping.night_ot')}: <span className="font-bold text-red-800">24</span></span>
            </div>
            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="min-w-[1200px]">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b bg-gray-300 hover:bg-gray-400 dark:bg-black dark:text-white">
                                <TableHead className="w-[100px] text-left border-r">{t('time_keeping.date')}</TableHead>
                                <TableHead className="w-[50px] text-left border-r">{t('time_keeping.day')}</TableHead>
                                <TableHead className="w-[100px] text-left border-r">{t('time_keeping.from')}</TableHead>
                                <TableHead className="w-[100px] text-left border-r">{t('time_keeping.to')}</TableHead>
                                <TableHead className="w-[100px] text-left border-r">{t('time_keeping.day_time_work')}</TableHead>
                                <TableHead className="w-[100px] text-left border-r">{t('time_keeping.night_time_work')}</TableHead>
                                <TableHead className="w-[100px] text-left border-r">{t('time_keeping.day_ot_work')}</TableHead>
                                <TableHead className="w-[100px] text-left border-r">{t('time_keeping.night_ot_work')}</TableHead>
                                <TableHead className="w-[100px] text-left border-r">{t('time_keeping.late')}</TableHead>
                                <TableHead className="w-[100px] text-left border-r">{t('time_keeping.early')}</TableHead>
                                <TableHead className="w-[100px] text-left border-r">{t('time_keeping.go_out')}</TableHead>
                                <TableHead className="w-[100px] text-left border-r">{t('time_keeping.note')}</TableHead>
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
                                    </TableRow>
                                ))
                            ) : isError || personalTimekeepingData.length == 0 ? (
                                <TableRow>
                                    <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={11}>{error?.message ?? "No results"}</TableCell>
                                </TableRow>
                            ) : 
                            (
                                personalTimekeepingData.map((item: DataTimeKeeping, idx: number) => (
                                    <TableRow key={idx} className="border-b hover:bg-gray-300">
                                        <TableCell className="text-left border-r">{item.date}</TableCell>
                                        <TableCell className="text-left border-r">3</TableCell>
                                        <TableCell className="text-left border-r">08:00:00</TableCell>
                                        <TableCell className="text-left border-r">17:25:05</TableCell>
                                        <TableCell className="text-left border-r">480</TableCell>
                                        <TableCell className="text-left border-r">--</TableCell>
                                        <TableCell className="text-left border-r">90</TableCell>
                                        <TableCell className="text-left border-r">0</TableCell>
                                        <TableCell className="text-left border-r">0</TableCell>
                                        <TableCell className="text-left border-r">0</TableCell>
                                        <TableCell className="text-left border-r">0</TableCell>
                                        <TableCell className="text-left border-r">NPL</TableCell>
                                    </TableRow>
                                )))
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
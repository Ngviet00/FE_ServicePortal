import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import timekeepingApi, { useConfirmTimeKeeping } from "@/api/timeKeeping";
import MgnTimeKeepingDialog from "./Components/MngTimeKeepingDialog";

type AttendanceStatus =
    | "O"
    | "ND"
    | "AL"
    | "S"
    | "SH"
    | "X"
    | "O1"
    | "CN"
    
interface AttendanceEntry {
    date: string;
    status: AttendanceStatus;
}

interface Holidays {
    date: string,
    type: string  
}

interface AttendanceRecord {
    userCode: string;
    name: string;
    attendances: AttendanceEntry[];
}

const statusLabels: Record<AttendanceStatus, string> = {
    O: "O",
    ND: "ND",
    AL: "AL",
    S: "S",
    SH: "SH",
    X: "X",
    O1: "O1",
    CN: "CN"
};

const statusColors: Record<AttendanceStatus, string> = {
    O: "#fc8600",
    ND: "#8a7d75",
    AL: "#00ecff",
    S: "#e800ff",
    SH: "#07ee15",
    X: "#f7f7f7",
    O1: "#f7e4ff",
    CN: "#d9d9d9"
};

const statusDefine: Record<AttendanceStatus, string> = {
    O: "Have permission",
    ND: "Maternity",
    AL: "Annual leave",
    S: "Sick",
    SH: "Special Holiday",
    X: "Work",
    O1: "No permission",
    CN: "Sunday"
};

function getDefaultMonth(date: Date) {
    return date.getMonth() + 1;
}

function getDefaultYear(date: Date) {
    return date.getFullYear();
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
}

function getToday() {
    return new Date()
}

function getHolidayColor(types: string[]) {
    if (types.includes("special_holiday")) 
        return { bgColor: "#07ee15", textColor: "#000000" };
    
    if (types.includes("sunday"))
         return { bgColor: "#000000", textColor: "#ffffff" };
    
    return { bgColor: "", textColor: "" };
}

export default function MngTimekeeping () {
    const { t } = useTranslation()
    const {user} = useAuthStore()

    const today = getToday()
    
    const defaultMonth = getDefaultMonth(today)
    const defaultYear = getDefaultYear(today)

    const [month, setMonth] = useState(defaultMonth)
    const [year, setYear] = useState(defaultYear)

    const confirmTimeKeeping = useConfirmTimeKeeping();

    const daysInMonth = getDaysInMonth(year, month)
    const daysHeader = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateObj = new Date(year, month - 1, day);
        return {
            dayStr: day.toString().padStart(2, "0"),
            dateObj,
        };
    });
    
    const { data: dataAttendances, isPending, isError, error } = useQuery({
        queryKey: ['management-timekeeping', year, month],
        queryFn: async () => {
            const res = await timekeepingApi.getMngTimeKeeping({
                UserCode: user?.userCode ?? "",
                Year: year,
                Month: month
            })
            const { holidays, userData } = res.data.data;
            return { holidays, userData }
        },
        enabled: !!year && !!month && !!user?.userCode
    });

    const handleSendToHR = async () => {
        await confirmTimeKeeping.mutateAsync({
            UserCode: user?.userCode ?? "",
            Year: year,
            Month: month,
        });
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">{t('mng_time_keeping.mng_time_keeping')}</h3>
               <MgnTimeKeepingDialog />
            </div>
            <div className="flex flex-wrap gap-4 items-center mt-7 mb-3 lg:justify-between">
                <div className="flex space-x-4">
                    <div>
                        <Label className="mb-1">Tháng</Label>
                        <select className="border  w-30 h-[30px] rounded-[5px] hover:cursor-pointer" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i+1} value={i+1}>{i+1}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label className="mb-1">Năm</Label>
                        <select className="border w-30 h-[30px] rounded-[5px] hover:cursor-pointer" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                            <option value={defaultYear - 1}>{defaultYear - 1}</option>
                            <option value={defaultYear}>{defaultYear}</option>
                        </select>
                    </div>
                </div>
                <div className="font-bold text-xl lg:text-3xl">
                    <span>{month} - {year}</span>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger className="hover:cursor-pointer px-3 py-2 text-white rounded-[7px] text-[14px] font-semibold bg-blue-600 hover:bg-blue-800">Confirm to HR</AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Do you want to continue?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will send data to HR department
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel className="hover:cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSendToHR} className="hover:cursor-pointer">Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <div className="flex flex-wrap my-5 lg:justify-around">
                {
                    Object.entries(statusLabels).map(([key]) => {
                        const color = statusColors[key as AttendanceStatus];
                        const label = statusLabels[key as AttendanceStatus];
                        const define = statusDefine[key as AttendanceStatus]

                        return (
                            <span className="w-1/3 sm:w-1/2 md:w-1/4 lg:w-auto p-1 flex items-center" key={key}>
                                <span style={{backgroundColor: color}} className={`w-[30px] text-center inline-block p-[2px] rounded-[3px] mr-1 flex-shrink-0`}>{label}</span>
                                <span className="text-xs sm:text-sm">{define}</span>
                            </span>
                        )
                    })
                }
            </div>

            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="min-w-[1200px]">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b bg-gray-300 hover:bg-gray-400 dark:bg-black dark:text-white">
                                <TableHead className="w-[0px] text-center border-r text-black">Mã nhân viên</TableHead>
                                <TableHead className="w-[100px] text-center border-r text-black">Họ Tên</TableHead>
                                {
                                    daysHeader.map(({ dayStr }) => {
                                        const fullDateStr = `${year}-${String(month).padStart(2, "0")}-${dayStr}`;
                                        const matchedHolidays = dataAttendances?.holidays.filter(
                                            (e: Holidays) => e.date === fullDateStr
                                        ) || [];

                                        const holidayTypes = matchedHolidays.map((h: Holidays) => h.type);
                                        const { bgColor, textColor } = getHolidayColor(holidayTypes);

                                        return (
                                            <TableHead style={{backgroundColor: bgColor, color: textColor}} key={dayStr} className={`w-[5px] text-center text-black border-r`}>{dayStr}</TableHead>
                                        )
                                    })
                                }
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                            isPending ? (
                                Array.from({ length: 1 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="w-[0px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[100px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></TableCell>
                                        {
                                            daysHeader.map(({ dayStr }) => (
                                                <TableCell key={dayStr} className="w-[100px] text-center"><div className="flex justify-center"><Skeleton className="h-3 w-[17px] bg-gray-300" /></div></TableCell>
                                            ))
                                        }
                                    </TableRow>
                                ))
                            ) : isError || dataAttendances?.userData?.length == 0 ? (
                                <TableRow>
                                    <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={daysInMonth + 2}>{error?.message ?? "No results"}</TableCell>
                                </TableRow>
                            ) :
                            (
                                dataAttendances?.userData.map((itemAtt: AttendanceRecord, idx: number) => (
                                    <TableRow key={idx} className="border-b">
                                        <TableCell className="text-center border-r">{itemAtt.userCode}</TableCell>
                                        <TableCell className="text-center border-r">{itemAtt.name}</TableCell>
                                        {
                                            daysHeader.map(({dayStr}) => {
                                                const dateStr = `${year}-${(month).toString().padStart(2, "0")}-${dayStr}`
                                                const attendance = itemAtt.attendances.find((a) => a.date === dateStr)
                                                const label = attendance ? statusLabels[attendance.status] : ""
                                                const bgColor = attendance && label != "X" ? statusColors[attendance.status] : "#FFFFFF"

                                                return (
                                                    <TableCell key={dayStr} style={{backgroundColor: bgColor}} className={`text-center text-xs border-r`}>{label}</TableCell>
                                                )
                                            })
                                        }
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
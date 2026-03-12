/* eslint-disable @typescript-eslint/no-explicit-any */
import { useExportTimeKeeping } from "@/api/HR/timeKeepingApi";
import orgUnitApi from "@/api/orgUnitApi";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const IMPORT_TYPES = [
    { key: 'report_t5', labelVi: 'Báo cáo số 5', labelEn: 'Report No. 5', color: 'black'}
];

export default function HRReport() {
    const { i18n } = useTranslation();
    const lang = i18n.language.split('-')[0];

    const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [department, setDepartment] = useState<number | null>(null);

    const getLastDayOfMonth = (dateStr: string) => {
        const [year, month] = dateStr.split('-').map(Number);
        const lastDay = new Date(year, month, 0); 
        return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
    };

    const handleFromDateChange = (val: string) => {
        setFromDate(val);
        const [fYear, fMonth] = val.split('-');
        const [tYear, tMonth] = toDate.split('-');

        if (fYear !== tYear || fMonth !== tMonth || val > toDate) {
            setToDate(getLastDayOfMonth(val));
        }
    };

    const handleToDateChange = (val: string) => {
        const [tYear, tMonth] = val.split('-');
        const [fYear, fMonth] = fromDate.split('-');

        if (tYear !== fYear || tMonth !== fMonth) {
            setToDate(val);
            setFromDate(`${tYear}-${tMonth}-01`);
        } else {
            if (val < fromDate) {
                setFromDate(val);
            }
            setToDate(val);
        }
    };

    const lastDayOfSelectedMonth = getLastDayOfMonth(fromDate);

    const { data: departments = [] } = useQuery({
        queryKey: ['get-all-departments'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartment()
            return res.data.data
        },
    });

    const selectedDeptName = useMemo(() => {
        return departments.find((d: any) => d.id.toString() === department?.toString())?.name || "";
    }, [department, departments]);

    const downLoadTimeKeeping = useExportTimeKeeping()
    const downloadExcel = async (type: string) => {
        if (type == 'report_t5') {
            await downLoadTimeKeeping.mutateAsync({
                fromDate: fromDate,
                toDate: toDate,
                departmentName: selectedDeptName
            })
        }
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-6">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">
                    {lang === 'vi' ? 'Báo cáo' : 'Report'}
                </h3>
            </div>

            <div className="flex">
                <div className="flex items-center gap-2 w-full sm:w-auto mr-5">
                    <label className="whitespace-nowrap">{lang == 'vi' ? 'Từ ngày' : 'From date'}</label>
                    <input 
                        type="date"
                        value={fromDate}
                        onChange={(e) => handleFromDateChange(e.target.value)}
                        max={toDate}
                        className="dark:bg-[#454545] dark:text-white shadow-xs border border-gray-300 p-1 rounded-[5px] w-full sm:w-[160px] text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto mr-5">
                    <label className="whitespace-nowrap">{lang == 'vi' ? 'Đến ngày' : 'To date'}</label>
                    <input 
                        type="date"
                        value={toDate}
                        min={fromDate}
                        max={lastDayOfSelectedMonth}
                        onChange={(e) => handleToDateChange(e.target.value)}
                        className="dark:bg-[#454545] dark:text-white shadow-xs border border-gray-300 p-1 rounded-[5px] w-full sm:w-[160px] text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="department_id" className="whitespace-nowrap">{lang == 'vi' ? 'Bộ phận' : 'Department'}</label>
                    <select
                        value={department ?? ''}
                        onChange={(e) => setDepartment(Number(e.target.value))}
                        id="department_id"
                        className="dark:bg-[#454545] dark:text-white border border-gray-300 p-1 rounded-sm hover:cursor-pointer text-sm"
                    >
                        <option value="">--{lang == 'vi' ? 'Tất cả' : 'All'}--</option>
                        {departments.map((item: {id: number, name: string}) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {IMPORT_TYPES.map((item, index) => {
                const isPending = item.key == 'report_t5' && downLoadTimeKeeping.isPending

                const btnColor = {
                    blue: 'bg-blue-600 hover:bg-blue-700',
                    green: 'bg-green-600 hover:bg-green-700',
                    orange: 'bg-orange-600 hover:bg-orange-700'
                }[item.color] || 'bg-gray-600';

                return (
                    <section key={item.key} className={`space-y-4 ${index !== IMPORT_TYPES.length - 1 ? 'border-b pb-8' : ''}`}>
                        <h3 className={`font-bold text-xl`} style={{ color: item.color }}>
                            {index + 1}. {lang === 'vi' ? item.labelVi : item.labelEn}
                        </h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => downloadExcel(item.key)}
                                disabled={isPending}
                                className={`px-6 py-2 rounded-md font-medium cursor-pointer text-white transition-all ${isPending ? 'bg-gray-400 cursor-not-allowed' : btnColor}`}
                            >
                                {isPending ? <Spinner /> : (lang === 'vi' ? 'Tải xuống' : 'Download')}
                            </button>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
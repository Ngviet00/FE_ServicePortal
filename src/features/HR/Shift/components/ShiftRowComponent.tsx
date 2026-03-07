/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useMemo } from 'react';

type ShiftRowProps = {
    emp: any;
    numberDayInMonth: number;
    selected: boolean;
    onToggle: (id: any) => void;
};

const ShiftRow = memo(function ShiftRow({ emp, numberDayInMonth, selected, onToggle }: ShiftRowProps) {
    const cells = useMemo(() => {
        const arr = [];
        for (let i = 1; i <= numberDayInMonth; i++) {
            const dayKey = String(i).padStart(2, '0');
            arr.push(
                <td
                    key={`${emp.EmployeeNo}-${dayKey}`}
                    className="shift-cell border-r border-slate-100 text-center text-[13px] font-bold py-2.5 border-b"
                >
                    {emp[dayKey] || '-'}
                </td>
            );
        }
        return arr;
    }, [emp, numberDayInMonth]);

    return (
        <tr className={`${selected ? 'bg-slate-50' : ''} hover:bg-slate-50/50 transition-colors`}>
            <td className="sticky left-0 z-10 bg-white border-r border-slate-200 p-2 text-center border-b">
                <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(emp.EmployeeNo)}
                className="rounded w-4 h-4 hover:cursor-pointer accent-black"
                />
            </td>

            <td className="sticky left-10 z-10 bg-white border-r border-slate-200 px-4 py-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-b">
                <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 leading-none">{emp?.EmployeeNo ?? ''}</span>
                <span className="text-[13px] font-bold text-slate-700">{emp?.FullName ?? 'System'}</span>
                </div>
            </td>

            <td className="px-3 py-2 border-r text-center border-slate-100 text-[13px] font-bold border-b">{emp.Dept}</td>
            {cells}
        </tr>
    );
});

export default ShiftRow;
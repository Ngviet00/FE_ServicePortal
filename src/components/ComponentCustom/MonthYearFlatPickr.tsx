import React, { useRef, useEffect } from 'react';
import flatpickr from 'flatpickr';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn';
import { useTranslation } from 'react-i18next';

interface MonthPickerProps {
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    className?: string;
    minDate?: string;
    maxDate?: string;
    placeholder?: string;
}

const MonthYearFlatPickr: React.FC<MonthPickerProps> = ({
    value,
    onChange,
    disabled = false,
    className,
    minDate,
    maxDate,
    placeholder = 'Chọn tháng',
}) => {
    const { i18n } = useTranslation();
    const lang = i18n.language.split('-')[0];
    const inputRef = useRef<HTMLInputElement>(null);
    const fpInstance = useRef<flatpickr.Instance | null>(null);

    useEffect(() => {
        if (!inputRef.current) return;

        fpInstance.current = flatpickr(inputRef.current, {
        locale: lang === 'vi' ? Vietnamese : 'default',
        defaultDate: value,
        disableMobile: true,

        plugins: [
            monthSelectPlugin({
            shorthand: true,
            dateFormat: 'Y-m', 
            altFormat: 'F Y',
            }),
        ],

        ...(minDate ? { minDate } : {}),
        ...(maxDate ? { maxDate } : {}),

        onChange: (_, dateStr) => {
            onChange?.(dateStr);
        },

        onReady: () => {
            const calendar = document.querySelector('.flatpickr-calendar') as HTMLElement;
            if (calendar) calendar.style.zIndex = '9999';
        },
        });

        return () => {
            fpInstance.current?.destroy();
        };
    }, [lang, value, minDate, maxDate, onChange]);

    return (
        <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            readOnly
            placeholder={placeholder}
            className={`border rounded px-3 py-1.5 text-sm w-[160px]
                ${disabled ? 'cursor-not-allowed bg-gray-100' : ''}
                ${className || ''}
            `}
        />
    );
};

export default MonthYearFlatPickr;

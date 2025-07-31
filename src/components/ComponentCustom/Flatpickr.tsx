import React, { useRef, useEffect, useState } from 'react';
import { Vietnamese } from 'flatpickr/dist/l10n/vn';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css'

interface DateTimePickerProps {
    disabled?: boolean,
    enableTime?:  boolean,
    dateFormat?: string
    className?: string,
    initialDateTime?: string; // default ISO string
    onChange?: (selectedDates: Date[], dateStr: string, instance: flatpickr.Instance) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ disabled = false, enableTime = true, dateFormat = 'Y-m-d', className, initialDateTime, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const fpInstance = useRef<flatpickr.Instance | null>(null);

    const [selectedDateTime, setSelectedDateTime] = useState<string | undefined>(initialDateTime);

    useEffect(() => {
        if (inputRef.current) {
            fpInstance.current = flatpickr(inputRef.current, {
                minuteIncrement: 1,
                enableTime: enableTime,
                noCalendar: false, 
                dateFormat: dateFormat,
                time_24hr: true,
                locale: Vietnamese,
                defaultDate: initialDateTime,
                onChange: (selectedDates, dateStr, instance) => {
                    setSelectedDateTime(dateStr);
                    if (onChange) {
                        onChange(selectedDates, dateStr, instance);
                    }
                },
                onReady: () => {
                    // Tăng z-index khi ready
                    const calendar = document.querySelector('.flatpickr-calendar') as HTMLElement;
                    if (calendar) {
                        calendar.style.zIndex = '9999';
                    }
                }
            });
        }

        return () => {
            if (fpInstance.current) {
                fpInstance.current.destroy();
            }
        };
    }, [dateFormat, enableTime, initialDateTime, onChange]);

    return (
        <>
            <input
                disabled={disabled}
                className={`${className} pl-3 ${disabled ? 'hover:cursor-not-allowed' : ''} z-50`}
                type="text"
                id="dateTimePicker"
                ref={inputRef}
                value={selectedDateTime || ''}
                readOnly 
            />
        </>
    );
};

export default DateTimePicker;
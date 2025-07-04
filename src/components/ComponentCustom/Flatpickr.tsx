import React, { useRef, useEffect, useState } from 'react';
import { Vietnamese } from 'flatpickr/dist/l10n/vn';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css'

interface DateTimePickerProps {
    enableTime?:  boolean,
    dateFormat?: string
    className?: string,
    initialDateTime?: string; // default ISO string
    onChange?: (selectedDates: Date[], dateStr: string, instance: flatpickr.Instance) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ enableTime = true, dateFormat = 'Y-m-d', className, initialDateTime, onChange }) => {
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
                className={`${className} pl-3`}
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
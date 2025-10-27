import React, { useRef, useEffect, useState } from 'react';
import { Vietnamese } from 'flatpickr/dist/l10n/vn';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css'
import { useTranslation } from 'react-i18next';

interface DateTimePickerProps {
    disabled?: boolean,
    enableTime?:  boolean,
    noCalendar?: boolean,
    time_24hr?: boolean,
    dateFormat?: string
    className?: string,
    initialDateTime?: string; // default ISO string
    onChange?: (selectedDates: Date[], dateStr: string, instance: flatpickr.Instance) => void;
    placeHolder?: string
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ disabled = false, enableTime = true, noCalendar = false, time_24hr = true, dateFormat = 'Y-m-d', className, initialDateTime, onChange, placeHolder }) => {
    const lang = useTranslation().i18n.language.split('-')[0]
    const inputRef = useRef<HTMLInputElement>(null);
    const fpInstance = useRef<flatpickr.Instance | null>(null);

    const [selectedDateTime, setSelectedDateTime] = useState<string | undefined>(initialDateTime);

    useEffect(() => {
        if (inputRef.current) {
            fpInstance.current = flatpickr(inputRef.current, {
                minuteIncrement: 30,
                enableTime: enableTime,
                noCalendar: noCalendar, 
                dateFormat: dateFormat,
                time_24hr: time_24hr,
                locale: lang == 'vi' ? Vietnamese : 'default',
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
    }, [dateFormat, enableTime, initialDateTime, lang, onChange]);

    return (
        <>
            <input
                style={{border: '1px solid gray '}}
                disabled={disabled}
                className={`${className} pl-3 ${disabled ? 'hover:cursor-not-allowed' : ''} z-50 border border-[#d1d5dc]`}
                type="text"
                id="dateTimePicker"
                ref={inputRef}
                value={selectedDateTime || ''}
                readOnly 
                placeholder={placeHolder}
            />
        </>
    );
};

export default DateTimePicker;
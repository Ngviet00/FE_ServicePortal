export function getDefaultMonth(date: Date) {
    return date.getMonth() + 1;
}

export function getDefaultYear(date: Date) {
    return date.getFullYear();
}

export function getDaysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
}

export function getToday() {
    return new Date()
}

export function formatDateToInputString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function calculateRoundedTime(durationInHours: number) {
    if (typeof durationInHours !== 'number' || durationInHours < 0) {
        alert("Đầu vào không hợp lệ. Vui lòng cung cấp một số không âm.");
        return 0;
    }

    const STANDARD_WORK_HOURS_PER_DAY = 8;
    const doubledDuration = durationInHours * 2;
    const ceiledDoubledDuration = Math.ceil(doubledDuration);
    const roundedHours = ceiledDoubledDuration / 2;
    const finalRoundedTime = roundedHours / STANDARD_WORK_HOURS_PER_DAY;

    return finalRoundedTime.toString();
}
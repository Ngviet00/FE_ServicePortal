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
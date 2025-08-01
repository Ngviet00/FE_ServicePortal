type OutputType = 'date' | 'iso' | 'string';

export function getVietnamTime(
    type: OutputType = 'date',
    inputDate?: Date
): Date | string | undefined {
    const baseDate = inputDate ?? new Date();
    
    const vietnamTimestamp = baseDate.getTime() + 7 * 60 * 60 * 1000;

    const vietnamDate = new Date(vietnamTimestamp);

    switch (type) {
        case 'iso':
            { const pad = (n: number) => n.toString().padStart(2, '0');
            const y = vietnamDate.getUTCFullYear();
            const m = pad(vietnamDate.getUTCMonth() + 1);
            const d = pad(vietnamDate.getUTCDate());
            const h = pad(vietnamDate.getUTCHours());
            const min = pad(vietnamDate.getUTCMinutes());
            const s = pad(vietnamDate.getUTCSeconds());
            return `${y}-${m}-${d}T${h}:${min}:${s}+07:00`; }
        case 'string':
            return vietnamDate.toLocaleString('sv-SE', {
                timeZone: 'Asia/Bangkok'
            }).replace(' ', 'T'); 
        case 'date':
        default:
            return vietnamDate;
    }
}

export const formatDate = (dateStr: Date | string | undefined, type: "yyyy-MM-dd" | "dd/MM/yyyy" | "yyyy/MM/dd HH:mm:ss" | "yyyy-MM-dd HH:mm:ss" | "yyyy/MM/dd HH:mm" = "dd/MM/yyyy") => {
    const d = new Date(dateStr ?? "");
    if (isNaN(d.getTime())) return "";

    const dd = d.getDate().toString().padStart(2, "0");
    const MM = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    const HH = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    const ss = d.getSeconds().toString().padStart(2, "0");

    switch (type) {
        case "yyyy-MM-dd":
            return `${yyyy}-${MM}-${dd}`;
        case "yyyy-MM-dd HH:mm:ss":
            return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
        case "yyyy/MM/dd HH:mm":
            return `${yyyy}/${MM}/${dd} ${HH}:${mm}`;
        case "yyyy/MM/dd HH:mm:ss":
            return `${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}`;
        case "dd/MM/yyyy":
        default:
            return `${dd}/${MM}/${yyyy}`;
    }
};


export function parseDateTime(datetimeStr: string) {
    const date = new Date(datetimeStr);
    const hour = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return {
        original: datetimeStr,
        date: date.toLocaleDateString("en-US"),
        hour,
        minutes,
    };
}
export type AttendanceStatus = 'X' | 'CN' | 'SH' | 'NPL' | 'ABS' | 'AL' | 'MC' | 'UL' | 'COMP' | 'PL' | 'ACC' | 'ML' | 'MAT' | 'TV' | 'WO'

export interface UpdateTimeKeeping {
    Result?: string,
    UserCode?: string,
    Name?: string,
    Department?: string,
    CurrentDate?: string,
    Den?: string,
    Ve?: string,
    RowIndex?: number,
    ColIndex?: number
}

export interface TimeKeeping {
    bcNgay: string,
    thu: string,
    cVietTat: string,
    bctgDen: string,
    bctgVe: string,
    bctgLamNgay: string,
    bctgLamToi: string,
    bcGhiChu: string,
    result: string | undefined
    vao: string,
    ra: string,
    currentBgColor?: string,
    customValueTimeAttendance?: string,
    isSentToHR?: boolean
}
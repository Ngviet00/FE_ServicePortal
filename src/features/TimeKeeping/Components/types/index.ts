export type AttendanceStatus = 'X' | 'CN' | 'SH' | 'NPL' | 'ABS' | 'AL' | 'MC' | 'UL' | 'COMP' | 'PL' | 'ACC' | 'ML' | 'MAT' | 'TV' | 'WO'

export interface DataTimeKeeping {
    Name: string
}

export interface UserTimeKeeping {
    UserCode: string,
    Name: string,
    Department: string,
}

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

    // nvMaNV?: string,
    // nvHoTen?: string,
    // bpTen?: string,
    // date?: string,
    // currentValue?: string,
    // currentBgColor?: string,
    // rowIndex?: number,
    // colIndex?: number,
    // thu: string,
    // vao: string,
    // ra: string,
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
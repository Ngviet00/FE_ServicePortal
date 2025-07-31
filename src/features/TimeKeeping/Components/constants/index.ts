import { AttendanceStatus } from "../types";

export const statusLabels: Record<AttendanceStatus, string> = {
    X: 'X',
    CN: 'CN',
    SH: 'SH',
    NPL: 'NPL',
    ABS: 'ABS',
    AL: 'AL',
    MC: 'MC',
    UL: 'UL',
    COMP: 'COMP',
    PL: 'PL',
    ACC: 'ACC',
    ML: 'ML',
    MAT: 'MAT',
    TV: 'TV',
    WO: 'WO'
};

export const statusColors: Record<AttendanceStatus | string, string | null> = {
    X: '#FFFFFF',
    CN: '#858585',
    SH: '#00FF0F',
    NPL: '#00C355',
    ABS: '#FF0000',
    AL: '#E1CD00',
    MAT: '#4679FF',
    MC: '#E800FF',
    COMP: '#616161',
    ML: '#9685FF',
    TV: '#71990A',
    UL: '#FF006D',
    PL: '#4A477F',
    ACC: '#FF6700',
    WO: '#00CDA5'
};

export const statusDefine: Record<AttendanceStatus, string> = {
    X: 'Đi Làm',
    CN: 'Chủ Nhật',
    SH: 'Nghỉ Lễ',
    NPL: 'Nghỉ Có Phép',
    ABS: 'Nghỉ Không Phép',
    AL: 'Nghỉ Phép Năm',
    MC: 'Nghỉ Ốm',
    UL: 'Nghỉ Bù',
    COMP: 'Nghỉ Tang Lễ',
    PL: 'Nghỉ Vợ Sinh',
    ACC: 'Nghỉ TNLĐ',
    ML: 'Nghỉ Cưới',
    MAT: 'Nghỉ Đẻ',
    TV: 'Nghỉ Việc',
    WO: 'Working Outside'
};
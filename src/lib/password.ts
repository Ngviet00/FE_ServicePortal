export const hasMinimumLength = (password: string): boolean => {
    return password.length > 0 && password.length >= 8;
};

//check have upper case
export const hasAlphanumeric = (password: string): boolean => {
    return password.length > 0 && /(?=.*[A-Z])/.test(password);
};

//check have normal case
export const hasAlphanumericLowerCase = (password: string): boolean => {
    return password.length > 0 && /(?=.*[a-z])/.test(password);
};

//check special character
export const hasSpecialCharacter = (password: string): boolean => {
    return password.length > 0 && /[!@#$%^&*]/.test(password);
}

//check have number
export const hasNumber = (password: string): boolean => {
    return password.length > 0 && /\d/.test(password);
};
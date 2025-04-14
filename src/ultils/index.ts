export const formatCurrency = (x: number) => {
    const number = new Intl.NumberFormat('vn', { style: 'currency', currency: 'vnd' }).format(x);
    
    return number;
 }

export const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
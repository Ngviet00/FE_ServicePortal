export const formatCurrency = (x: number) => {
    const number = new Intl.NumberFormat('vn', { style: 'currency', currency: 'vnd' }).format(x);
    
    return number;
 }
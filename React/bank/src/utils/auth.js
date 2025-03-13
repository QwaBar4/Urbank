export const getJwtToken = () => localStorage.getItem('jwt');
export const storeJwtToken = (token) => localStorage.setItem('jwt', token);
export const clearJwtToken = () => localStorage.removeItem('jwt');

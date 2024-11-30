import axios from 'axios';
const baseURL =String(process.env.VITE_API_ENPOINT)
const url = `${baseURL.substring(1,baseURL.length-1)}`;
// apiAxios.defaults.baseURL = url;
const apiAxios = axios.create({
    baseURL: url,
    withCredentials: true,
});




export default apiAxios;
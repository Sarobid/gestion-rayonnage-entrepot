import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:8000/api/", 
    timeout: 100000, 
    //withCredentials: true
});

api.defaults.headers.common['Content-Type'] = 'application/json';
export  default api

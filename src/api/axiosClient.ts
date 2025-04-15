import axios from 'axios';

const axiosClient = axios.create({
	baseURL: 'https://localhost:7006/',
	headers: {
		'Content-type': 'application/json',
	},
	withCredentials: true,
});

axiosClient.interceptors.request.use(
	function (config) {
		return config;
	}, function (error) {
		return Promise.reject(error);
	});

axiosClient.interceptors.response.use(
	response => response.data,
	// async error => {
    //     const originalRequest = error.config;

    //     if (error.response?.status === 401 && !originalRequest._retry) {
    //         originalRequest._retry = true;
    //         try {
    //             await axiosClient.get("/auth/refresh-token");
    //             return axiosClient(originalRequest); 
    //         } catch (refreshError) {
    //             window.location.href = "/login"; 
    //             return Promise.reject(refreshError);
    //         }
    //     }

    //     return Promise.reject(error);
    // }
);

export default axiosClient;
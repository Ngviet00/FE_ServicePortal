import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

const axiosClient = axios.create({
	baseURL: API_URL,
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
	}
);

axiosClient.interceptors.response.use(
	response => response,
    async err => {
		const originalRequest = err.config;
		
		if (
			err.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url.includes('/auth/refresh-token')
		) {
			originalRequest._retry = true;

			try {
				await axiosClient.get('/auth/refresh-token');
				return axiosClient(originalRequest);
			} catch {
				localStorage.removeItem('auth-storage');
				window.location.href = '/login';
			}
		}
	
		return Promise.reject(err);
	}
);

export default axiosClient;
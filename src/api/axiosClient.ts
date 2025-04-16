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
	response => response,
    async err => {
        const originalRequest = err.config;
        if (err.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await axiosClient.post('/auth/refresh-token');
            return axiosClient(originalRequest);
          } catch {
            window.location.href = '/login';
          }
        }
    
        return Promise.reject(err);
      }
);

export default axiosClient;
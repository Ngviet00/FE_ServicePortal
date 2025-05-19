import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

const axiosClient = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-type': 'application/json',
	},
});

axiosClient.interceptors.request.use(
	(config) => {
		const accessToken = useAuthStore.getState().accessToken;

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
		
        return config;
	},
	(error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  	(response) => response,
  	async (err) => {
    	const originalRequest = err.config;

		if (
			err.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url.includes('/auth/refresh-token')
		) {
			originalRequest._retry = true;

			try {
				const { refreshToken, setAccessToken, logout } = useAuthStore.getState();

				if (!refreshToken) {
					logout();
					window.location.href = '/login';
					return Promise.reject(err);
				}

				const refreshRes = await axiosClient.post('/auth/refresh-token', {
					refreshToken,
				});

				const newAccessToken = refreshRes.data.accessToken;

				setAccessToken(newAccessToken);

				originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

				return axiosClient(originalRequest);
			} catch (refreshError) {
				useAuthStore.getState().logout();
				window.location.href = '/login';
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(err);
	}
);

export default axiosClient;


// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL

// const axiosClient = axios.create({
// 	baseURL: API_URL,
// 	headers: {
// 		'Content-type': 'application/json',
// 	},
// 	withCredentials: true,
// });

// axiosClient.interceptors.request.use(
// 	function (config) {
// 		return config;
// 	}, function (error) {
// 		return Promise.reject(error);
// 	}
// );

// axiosClient.interceptors.response.use(
// 	response => response,
//     async err => {
// 		const originalRequest = err.config;
		
// 		if (
// 			err.response?.status === 401 &&
// 			!originalRequest._retry &&
// 			!originalRequest.url.includes('/auth/refresh-token')
// 		) {
// 			originalRequest._retry = true;

// 			try {
// 				await axiosClient.get('/auth/refresh-token');
// 				console.log('call refresh token');
// 				return axiosClient(originalRequest);
// 			} catch {
// 				console.log('login again');
// 				localStorage.removeItem('auth-storage');
// 				window.location.href = '/login';
// 			}
// 		}
	
// 		return Promise.reject(err);
// 	}
// );

// export default axiosClient;
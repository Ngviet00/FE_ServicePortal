import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

const axiosClient = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-type': 'application/json',
	},
});

let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void; config: any }[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.config.headers['Authorization'] = `Bearer ${token}`;
            prom.resolve(axiosClient(prom.config));
        }
    });
    failedQueue = [];
};

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

			if (!isRefreshing) {
				isRefreshing = true;

				try {
					const { user, refreshToken, setAccessToken, logout } = useAuthStore.getState();

					if (!refreshToken) {
						logout();
						window.location.href = '/login';
						return Promise.reject(err);
					}

					const refreshRes = await axiosClient.post('/auth/refresh-token', {
						orgPositionId: user?.orgPositionId,
						refreshToken,
					});

					const newAccessToken = refreshRes.data.data;
					setAccessToken(newAccessToken);

					processQueue(null, newAccessToken);

					originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
					return axiosClient(originalRequest);
				} catch (refreshError) {
					processQueue(refreshError);
					useAuthStore.getState().logout();
					window.location.href = '/login';
					return Promise.reject(refreshError);
				} finally {
					isRefreshing = false;
				}
			} else {
				return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, config: originalRequest });
                });
			}
		}
		return Promise.reject(err);
	}
);

export default axiosClient;
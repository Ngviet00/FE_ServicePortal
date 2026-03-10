/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const basicAxios = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; config: any; }[] = [];

const forceLogout = () => {
    if (window.location.pathname.startsWith('/login')) return;
    useAuthStore.getState().logout();
    window.location.replace('/login');
};

const processQueue = (error: unknown, token = null) => {
    failedQueue.forEach(({ resolve, reject, config }) => {
        if (error) {
            reject(error);
        } else {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
            resolve(axiosClient(config));
        }
    });
    failedQueue = [];
};

axiosClient.interceptors.request.use(
    (config) => {
        const accessToken = useAuthStore.getState().accessToken;
        if (accessToken) {
            config.headers = config.headers || {};
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

        if (!err.response) {
            return Promise.reject(err);
        }

        if (!originalRequest) {
            return Promise.reject(err);
        }

        if (err.response.status !== 401) {
            return Promise.reject(err);
        }

        const url = originalRequest.url || '';

        if (url.includes('/auth/logout') || url.includes('/auth/refresh-token')) {
            forceLogout();
            return Promise.reject(err);
        }

        if (originalRequest._retry) {
            forceLogout();
            return Promise.reject(err);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject, config: originalRequest });
            });
        }

        isRefreshing = true;

        try {
            const { user, refreshToken, setAccessToken } = useAuthStore.getState();

            if (!refreshToken) {
                throw new Error('No refresh token');
            }

            const refreshRes = await basicAxios.post('/auth/refresh-token', {
                orgPositionId: user?.orgPositionId,
                refreshToken,
            });

            const newAccessToken = refreshRes.data?.data;

            if (!newAccessToken) {
                throw new Error('Invalid token');
            }

            setAccessToken(newAccessToken);
            processQueue(null, newAccessToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return axiosClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            forceLogout();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosClient;

// import { useAuthStore } from '@/store/authStore';
// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL

// const axiosClient = axios.create({
// 	baseURL: API_URL,
// 	headers: {
// 		'Content-type': 'application/json',
// 	},
// });

// let isRefreshing = false;
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void; config: any }[] = [];

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const processQueue = (error: any, token: string | null = null) => {
//     failedQueue.forEach(prom => {
//         if (error) {
//             prom.reject(error);
//         } else {
//             prom.config.headers['Authorization'] = `Bearer ${token}`;
//             prom.resolve(axiosClient(prom.config));
//         }
//     });
//     failedQueue = [];
// };

// axiosClient.interceptors.request.use(
// 	(config) => {
// 		const accessToken = useAuthStore.getState().accessToken;

//         if (accessToken) {
//             config.headers.Authorization = `Bearer ${accessToken}`;
//         }
		
//         return config;
// 	},
// 	(error) => Promise.reject(error)
// );

// axiosClient.interceptors.response.use(
//   	(response) => response,
//   	async (err) => {
//     	const originalRequest = err.config;

// 		if (originalRequest.url.includes('/auth/logout')) {
//             useAuthStore.getState().logout();
//             return Promise.reject(err);
//         }

// 		if (
// 			err.response?.status === 401 &&
// 			!originalRequest._retry &&
// 			!originalRequest.url.includes('/auth/refresh-token')
// 		) {
// 			originalRequest._retry = true;

// 			if (!isRefreshing) {
// 				isRefreshing = true;

// 				try {
// 					const { user, refreshToken, setAccessToken, logout } = useAuthStore.getState();

// 					if (!refreshToken) {
// 						logout();
// 						window.location.href = '/login';
// 						return Promise.reject(err);
// 					}

// 					const refreshRes = await axiosClient.post('/auth/refresh-token', {
// 						orgPositionId: user?.orgPositionId,
// 						refreshToken,
// 					});

// 					const newAccessToken = refreshRes.data.data;
// 					setAccessToken(newAccessToken);

// 					processQueue(null, newAccessToken);

// 					originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
// 					return axiosClient(originalRequest);
// 				} catch (refreshError) {
// 					processQueue(refreshError);
// 					useAuthStore.getState().logout();
// 					window.location.href = '/login';
// 					return Promise.reject(refreshError);
// 				} finally {
// 					isRefreshing = false;
// 				}
// 			} else {
// 				return new Promise((resolve, reject) => {
//                     failedQueue.push({ resolve, reject, config: originalRequest });
//                 });
// 			}
// 		}
// 		return Promise.reject(err);
// 	}
// );

// export default axiosClient;
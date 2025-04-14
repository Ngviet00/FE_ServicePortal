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
	function (response) {
   		return response.data;
	}, function (error) {
		return Promise.reject(error);
	}
);

export default axiosClient;
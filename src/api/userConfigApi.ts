import axiosClient from './axiosClient';

interface GetUserConfig {
    userCode: string | undefined;
    key: string;
}

export interface UserConfigData {
    userCode: string | undefined,
    key: string,
    value: string,
};

const userConfigApi = {
    getConfigByUsercodeAndkey(params: GetUserConfig) {
        return axiosClient.get(`/user-config/get-config-by-usercode-and-key`, {params})
    },

    saveOrUpdate(data: UserConfigData) {
        return axiosClient.post('/user-config', data)
    },
}

export default userConfigApi;
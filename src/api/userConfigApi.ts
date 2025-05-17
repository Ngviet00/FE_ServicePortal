import axiosClient from './axiosClient';

interface GetUserConfig {
    userCode: string | undefined;
    key: string;
}

export interface UserConfigData {
    userCode: string | undefined,
    configKey: string,
    configValue: string,
};

const userConfigApi = {
    getConfigByUsercodeAndkey(params: GetUserConfig) {
        return axiosClient.get(`/user-config/get-config-by-usercode-and-key`, {params})
    },

    saveOrUpdate(data: UserConfigData) {
        return axiosClient.post('/user-config/save-or-update', data)
    },
}

export default userConfigApi;
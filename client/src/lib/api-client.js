import axios from 'axios'
import { HOST } from '../utils/constants'

import { useAppStore } from '../store'

export const apiClient = axios.create({
    baseURL: HOST,
})

// Add a response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if error response is 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // Clear user info in the store using the non-hook version of getState
            const { setUserInfo } = useAppStore.getState();
            setUserInfo(undefined);
        }
        return Promise.reject(error);
    }
);
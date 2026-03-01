import axios from 'axios';
import { ENV } from '../config/env';

export const apiClient = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: {
        accept: 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    if (ENV.EXPO_PUBLIC_MOVIE_ACCESS_TOKEN) {
        config.headers.Authorization = `Bearer ${ENV.EXPO_PUBLIC_MOVIE_ACCESS_TOKEN}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

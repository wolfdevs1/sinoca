// src/services/auth.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/api' });

export const register = data => API.post('/auth/register', data);
export const login = data => API.post('/auth/login', data);
export const deposit = data => API.post('/user/deposit', data);
export const withdraw = data => API.post('/user/withdraw', data);
export const changePassword = data => API.post('/user/change-password', data);
export const newAccount = data => API.post('/user/new-account', data);

export const getProfile = () => API.get('/user/profile');
export const getAllUsers = () => API.get('/user/all');
export const getWithdraws = () => API.get('/user/withdraws');

export const setToken = token => {
    if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete API.defaults.headers.common['Authorization'];
};
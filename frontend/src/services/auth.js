// src/services/auth.js
import axios from 'axios';
import { IP } from './socket';

const API = axios.create({ baseURL: IP + '/api' });

export const register = data => API.post('/auth/register', data);
export const login = data => API.post('/auth/login', data);
export const deposit = data => API.post('/user/deposit', data);
export const withdraw = data => API.post('/user/withdraw', data);
export const changePassword = data => API.post('/user/change-password', data);
export const unlockUser = data => API.post('/user/unlock-user', data);
export const newUserAccount = data => API.post('/user/new-account', data);
export const addAccount = data => API.post('/user/add-new-account', data);
export const deleteAccount = data => API.post('/user/delete-account', data);
export const changeWithdrawState = data => API.post('/user/change-withdraw-state', data);

export const getProfile = () => API.get('/user/profile');
export const getAllUsers = (page = 1, limit = 10) => API.get(`/user/all?page=${page}&limit=${limit}`);
export const getWithdraws = (page = 1, limit = 10) => API.get(`/user/withdraws?page=${page}&limit=${limit}`);
export const getTransfers = (page = 1, limit = 10) => API.get(`/user/transfers?page=${page}&limit=${limit}`);
export const getAccounts = () => API.get('/user/accounts');
export const getSaldos = () => API.get('/user/caja');
export const crearTransferManual = (data) => API.post('/user/manual-transfer', data);
export const crearWithdrawManual = (data) => API.post('/user/manual-withdraw', data);
export const getRandomAccount = () => API.get('/user/random-account');
export const getResumen = () => API.get('/user/caja/resumen');

export const setToken = token => {
    if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete API.defaults.headers.common['Authorization'];
};
// src/socket.js
import { io } from 'socket.io-client';
export const IP = 'http://192.168.1.63:4000'; // Cambia esto por la URL de tu servidor

const socket = io(IP);

export default socket;
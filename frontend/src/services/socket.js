// src/socket.js
import { io } from 'socket.io-client';
const URL = 'http://192.168.1.231:4000'; // Cambia esto por la URL de tu servidor
const socket = io(URL);

export default socket;
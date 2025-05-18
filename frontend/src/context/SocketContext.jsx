import { createContext } from 'react';
import socket from '../services/socket';

export const SocketContext = createContext(socket);
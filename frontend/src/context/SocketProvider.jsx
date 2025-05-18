// src/context/SocketProvider.jsx
import socket from '../services/socket';
import { SocketContext } from './SocketContext';

export const SocketProvider = ({ children }) => {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
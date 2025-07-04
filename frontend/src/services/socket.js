import { io } from 'socket.io-client';

export const IP = 'http://192.168.1.66:4000';

let userId = localStorage.getItem("userId");
if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("userId", userId);
}

const socket = io(IP, {
    extraHeaders: {
        'user-id': userId
    }
});

export default socket;
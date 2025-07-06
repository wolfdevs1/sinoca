import { io } from 'socket.io-client';

export const IP = 'https://jugatelo.com';

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
// socket.js
import { io } from "socket.io-client";

const socket = io("/", {
    extraHeaders: {
        "user-id": localStorage.getItem("userId") || crypto.randomUUID(),
    },
});

export default socket;
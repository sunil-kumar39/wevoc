import {
    io,
} from "socket.io-client";


// =====================================================
// SOCKET URL
// =====================================================

const getSocketUrl = () => {
    const apiUrl =
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:8000";

    return apiUrl.replace(/\/api\/v1\/?$/, "");
};


export const socket =
    io(
        getSocketUrl(),
        {
            withCredentials: true,

            autoConnect: false,

            transports: [
                "websocket",
                "polling",
            ],
        }
    );


// =====================================================
// CONNECT
// =====================================================

export const connectSocket =
    () => {

        if (!socket.connected) {
            socket.connect();
        }
    };


// =====================================================
// DISCONNECT
// =====================================================

export const disconnectSocket =
    () => {

        if (socket.connected) {
            socket.disconnect();
        }
    };
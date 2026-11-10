import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

// One shared admin socket. The token is read on every (re)connect, so a
// reconnect after a fresh login doesn't reuse an expired one.
let socket: Socket | null = null;

export const getAdminSocket = (): Socket => {
    if (!socket) {
        const origin = new URL(import.meta.env.VITE_API_LIVEHOST).origin;
        socket = io(origin, {
            transports: ['websocket'],
            auth: (cb) => cb({ token: Cookies.get('token') || '' }),
        });
    }
    return socket;
};

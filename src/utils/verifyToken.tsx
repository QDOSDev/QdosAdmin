import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { refreshToken as refreshTokenRequest } from '../services/qdosApi';

interface DecodedToken {
    id: string;
    role: string;
    exp: number;
}

const decode = (token: string): DecodedToken | null => {
    try {
        return jwtDecode<DecodedToken>(token);
    } catch {
        return null;
    }
};

const verifyToken = async () => {
    const token = Cookies.get('token');
    if (!token) return false;

    let decoded = decode(token);
    const isExpired = !decoded || decoded.exp * 1000 <= Date.now();

    if (isExpired) {
        const storedRefreshToken = Cookies.get('refreshToken');
        if (!storedRefreshToken) return false;

        try {
            const { data } = await refreshTokenRequest(storedRefreshToken);
            Cookies.set('token', data.token);
            if (data.refreshToken) {
                Cookies.set('refreshToken', data.refreshToken);
            }
            decoded = decode(data.token);
        } catch {
            return false;
        }
    }

    if (!decoded) return false;

    localStorage.setItem('userRole', decoded.role);
    return { id: decoded.id, role: decoded.role };
};

export default verifyToken;

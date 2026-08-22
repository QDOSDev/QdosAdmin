import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import verifyToken from '../utils/verifyToken';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [authState, setAuthState] = useState<{ valid: boolean; role: string | null } | null>(null);

  useEffect(() => {
    const check = async () => {
      const user = await verifyToken(); 
      if (user) {
        const role = user.role;
        if (!allowedRoles || allowedRoles.includes(role)) {
          setAuthState({ valid: true, role });
        } else {
          setAuthState({ valid: false, role });
        }
      } else {
        setAuthState({ valid: false, role: null });
      }
    };
    check();
  }, [allowedRoles]);

  if (authState === null) return null; 

  if (!authState.valid) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;

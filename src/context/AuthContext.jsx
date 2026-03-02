import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('bv_user') || 'null'));
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        const res = await authApi.login({ email, password });
        const { token, user: u } = res.data.data;
        localStorage.setItem('bv_token', token);
        localStorage.setItem('bv_user', JSON.stringify(u));
        setUser(u);
        return u;
    };

    const logout = () => {
        localStorage.removeItem('bv_token');
        localStorage.removeItem('bv_user');
        setUser(null);
    };

    const isSuperAdmin = user?.role === 'super_admin';
    const isBankAdmin = user?.role === 'bank_admin';

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isSuperAdmin, isBankAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

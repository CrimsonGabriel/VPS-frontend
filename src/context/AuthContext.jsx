// 💾 src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'jwtToken'; 
const AVATAR_STORAGE_KEY = 'userAvatarUrl'; // ⭐️ NOWA STAŁA

// --- Helpery ---
const getTokenFromStorage = () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token === 'null' || token === 'undefined') return null;
    return token;
};

// ⭐️ Helper do pobierania avatara z pamięci
const getAvatarFromStorage = () => {
    const avatar = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (avatar === 'null' || avatar === 'undefined') return null;
    return avatar;
};

const decodeJwt = (jwtToken) => {
    try {
        const base64Url = jwtToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [token, setTokenState] = useState(getTokenFromStorage());
    const [isAuthenticated, setIsAuthenticated] = useState(!!getTokenFromStorage());
    const [userRole, setUserRole] = useState(null); 
    const [userEmail, setUserEmail] = useState(null);
    const [userName, setUserName] = useState(''); 
    
    // ⭐️ ZMIANA: Inicjalizujemy stan od razu wartością z localStorage
    const [userAvatar, setUserAvatarState] = useState(getAvatarFromStorage()); 
    
    const [loading, setLoading] = useState(true); 
    
    const navigate = useNavigate();

    // ⭐️ Wrapper do ustawiania avatara, który aktualizuje też localStorage
    const setUserAvatar = (url) => {
        setUserAvatarState(url);
        if (url) {
            localStorage.setItem(AVATAR_STORAGE_KEY, url);
        } else {
            localStorage.removeItem(AVATAR_STORAGE_KEY);
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(AVATAR_STORAGE_KEY); // ⭐️ Czyścimy avatar przy wylogowaniu
        setTokenState(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserEmail(null);
        setUserName('');
        setUserAvatarState(null);
        navigate('/');
    }, [navigate]);

    const refreshUserData = useCallback(async () => {
        const currentToken = getTokenFromStorage();
        if (!currentToken) return;

        try {
            const response = await fetch('/api/user/me', {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.name) setUserName(data.name);
                
                // ⭐️ Aktualizujemy avatar (i localStorage) tylko jeśli przyszedł z backendu
                // Jeśli backend zwróci null, a my mamy coś w cache, to nadpiszemy nullem (prawidłowo)
                setUserAvatar(data.avatarUrl); 
            }
        } catch (error) {
            console.error("Nie udało się odświeżyć danych użytkownika", error);
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);
            const currentToken = getTokenFromStorage();

            if (currentToken) {
                const decodedPayload = decodeJwt(currentToken);
                
                if (decodedPayload && decodedPayload.exp * 1000 > Date.now()) {
                    let roleFromToken = decodedPayload.role; 
                    let finalRole = 'ROLE_USER'; 

                    if (typeof roleFromToken === 'string') {
                        let normalized = roleFromToken.toUpperCase().replace('ROLE_', '');
                        if (normalized.includes('ADMIN')) finalRole = 'ROLE_ADMIN';
                    }
                    
                    setUserRole(finalRole);
                    setUserEmail(decodedPayload.sub || decodedPayload.email);
                    setIsAuthenticated(true);
                    setTokenState(currentToken);

                    // Pobieramy świeże dane w tle, ale UI już ma stare dane z localStorage
                    await refreshUserData();

                } else {
                    logout(); 
                }
            } else {
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        initAuth();
    }, [token, logout, refreshUserData]);

    const login = async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }) 
            });

            if (!response.ok) throw new Error('Błąd logowania');

            const data = await response.json(); 
            const jwtToken = data.jwt; 

            if (!jwtToken) throw new Error('Brak tokena JWT');

            localStorage.setItem(TOKEN_STORAGE_KEY, jwtToken);
            setTokenState(jwtToken);
			setIsAuthenticated(true);
            
            navigate('/'); 
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const isAdmin = userRole === 'ROLE_ADMIN';

    const value = {
        isAuthenticated,
        isAdmin, 
        userRole,
        userEmail,
        userName,
        userAvatar,
        refreshUserData, 
        loading,
        login,
        logout,
        getToken: getTokenFromStorage
    };
    
    if (loading && !token) return null;

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
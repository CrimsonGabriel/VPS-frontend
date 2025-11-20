// 💾 src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = 'jwtToken'; 

// ⭐️⭐️⭐️ FIX: Ignorujemy "null" jako tekst ⭐️⭐️⭐️
const getToken = () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    // Jeśli w pamięci siedzi napis "null" albo "undefined", traktuj to jak brak tokena
    if (token === 'null' || token === 'undefined') {
        return null;
    }
    return token;
};

const setToken = (token) => localStorage.setItem(TOKEN_STORAGE_KEY, token);
const removeToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

// --- FUNKCJA POMOCNICZA DO DEKODOWANIA JWT ---
const decodeJwt = (jwtToken) => {
    try {
        const base64Url = jwtToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Błąd dekodowania JWT:", e);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [token, setTokenState] = useState(getToken());
    const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
    const [userRole, setUserRole] = useState(null); 
    const [userEmail, setUserEmail] = useState(null);
    const [loading, setLoading] = useState(true); 
    
    const navigate = useNavigate();
    
    const logout = () => {
        removeToken();
        setTokenState(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserEmail(null);
        navigate('/');
    };

    useEffect(() => {
        setLoading(true);
        const currentToken = getToken(); // Tu teraz zadziała nasz fix

        if (currentToken) {
            const decodedPayload = decodeJwt(currentToken);
            
            if (decodedPayload) {
                // Sprawdzamy wygaśnięcie
                if (decodedPayload.exp * 1000 < Date.now()) {
                    console.warn("Token JWT wygasł. Automatyczne wylogowywanie...");
                    logout(); 
                    setLoading(false); 
                    return; 
                }

                // Logika ról (zgodna z Twoim kodem)
                let roleFromToken = decodedPayload.role; 
                let finalRole = 'ROLE_USER'; 

                if (typeof roleFromToken === 'string') {
                    let normalized = roleFromToken.toUpperCase().replace('ROLE_', '');
                    if (normalized.includes('ADMIN')) {
                        finalRole = 'ROLE_ADMIN';
                    } else if (normalized.includes('USER')) {
                        finalRole = 'ROLE_USER';
                    }
                }
                
                setUserRole(finalRole);
                setUserEmail(decodedPayload.sub || decodedPayload.email);
                setIsAuthenticated(true);

            } else {
                logout(); 
            }
        } else {
            setIsAuthenticated(false);
            setUserRole(null);
            setUserEmail(null);
        }
        setLoading(false);
    }, [token, navigate]); 

    const login = async (username, password) => {
        const payload = JSON.stringify({ email: username, password: password });
        
        try {
            const response = await fetch('/api/auth/login', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload 
            });

            if (!response.ok) { 
                const errorData = await response.json().catch(() => ({ error: 'Nieznany błąd serwera.' }));
                throw new Error(errorData.error || 'Błąd uwierzytelniania.');
            }

            const data = await response.json(); 
            const jwtToken = data.jwt; 

            if (!jwtToken) { throw new Error('Brak tokena JWT w odpowiedzi'); }

            setToken(jwtToken);
            setTokenState(jwtToken);
            
            console.log('Logowanie pomyślne.');
            navigate('/'); 
            return true;

        } catch (error) {
            console.error('Błąd logowania:', error.message);
            removeToken();
            setTokenState(null);
            setIsAuthenticated(false);
            return false;
        }
    };

    const isAdmin = userRole && userRole.toUpperCase().includes('ADMIN');

    const value = {
        isAuthenticated,
        isAdmin, 
        userRole,
        userEmail,
        loading,
        login,
        logout,
        getToken,
        token // Eksportujemy token, żeby był dostępny w hooku useAuth()
    };
    
    if (loading) {
        return null; 
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
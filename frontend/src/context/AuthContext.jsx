// 💾 src/context/AuthContext.jsx (OSTATECZNA POPRAWKA SKANUJĄCA CAŁY PAYLOAD)

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = 'jwtToken'; 
const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
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
    
    useEffect(() => {
        setLoading(true);
        const currentToken = getToken();

        if (currentToken) {
            const decodedPayload = decodeJwt(currentToken);
            if (decodedPayload) {
                
                let roleFromToken = null;
                
                // 1. Sprawdź standardowe pola Spring (role, authorities)
                roleFromToken = decodedPayload.role || decodedPayload.authorities;

                // 2. Jeśli standardowe pole jest puste lub tablica jest pusta, 
                //    wykonaj agresywne skanowanie całego ładunku.
                if (!roleFromToken || (Array.isArray(roleFromToken) && roleFromToken.length === 0)) {
                    
                    // ⭐️ AGRESYWNE SKANOWANIE CAŁEGO PAYLOADU ⭐️
                    for (const key in decodedPayload) {
                        const value = decodedPayload[key];
                        
                        // Skanowanie wartości typu string
                        if (typeof value === 'string' && (value.toUpperCase().includes('ADMIN') || value.toUpperCase().includes('USER'))) {
                            roleFromToken = value;
                            break; 
                        } 
                        // Skanowanie tablic (np. list ról)
                        else if (Array.isArray(value)) {
                            const foundRole = value.find(item => 
                                (typeof item === 'string' && (item.toUpperCase().includes('ADMIN') || item.toUpperCase().includes('USER'))) ||
                                (item && item.authority && (item.authority.toUpperCase().includes('ADMIN') || item.authority.toUpperCase().includes('USER')))
                            );
                            if (foundRole) {
                                roleFromToken = (typeof foundRole === 'string') ? foundRole : foundRole.authority;
                                break;
                            }
                        }
                    }
                    // --------------------------------------------------
                }

                // 3. Normalizacja i ujednolicenie
                let finalRole = 'ROLE_USER'; 

                if (roleFromToken) {
                    // Jeśli nadal jest tablicą, ujednolicamy ją do pierwszego elementu stringa/authority
                    if (Array.isArray(roleFromToken)) {
                        if (roleFromToken.length > 0) {
                            roleFromToken = (typeof roleFromToken[0] === 'string') ? roleFromToken[0] : roleFromToken[0].authority;
                        }
                    }

                    if (typeof roleFromToken === 'string') {
                        // Usuń ROLE_, przekształć na duże litery, aby znormalizować
                        let normalized = roleFromToken.toUpperCase().replace('ROLE_', '');
                        if (normalized.includes('ADMIN')) {
                            finalRole = 'ROLE_ADMIN';
                        } else if (normalized.includes('USER')) {
                            finalRole = 'ROLE_USER';
                        }
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
    }, [token]);


    const login = async (username, password) => {
        
        const payload = JSON.stringify({ email: username, password: password });
        console.log('Payload wysyłany do Springa:', payload); // Debugowanie
        
        try {
            const response = await fetch('/api/auth/login', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: payload 
            });

            if (!response.ok) { 
                const errorData = await response.json().catch(() => ({ error: 'Nieznany błąd serwera.' }));
                throw new Error(errorData.error || 'Błąd uwierzytelniania.');
            }

            const data = await response.json(); 
            const jwtToken = data.token;

            if (!jwtToken) { throw new Error('Nie otrzymano tokena JWT z serwera'); }

            setToken(jwtToken);
            setTokenState(jwtToken);
            
            console.log('Logowanie pomyślne, zapisano JWT.');
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

    const logout = () => {
        removeToken();
        setTokenState(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserEmail(null);
        navigate('/');
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
    };
    
    if (loading) {
        return <div>Weryfikacja sesji...</div>; 
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
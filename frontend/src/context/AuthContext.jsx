import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Tworzymy kontekst
const AuthContext = createContext(null);

// To jest "dostawca" kontekstu, który będzie otaczał naszą aplikację
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // === MOCK LOGIN ===
  // Tutaj jest nasza "mądra" logika na sztywno.
  // W przyszłości zamienisz to na wywołanie API do Spring Boota.
  const login = async (username, password) => {
    console.log('Próba logowania z:', username, password);
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      console.log('Logowanie pomyślne');
      // Przekieruj na stronę statusu po udanym logowaniu
      navigate('/'); 
      return true;
    }
    console.log('Logowanie nieudane');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    // Przekieruj na stronę logowania po wylogowaniu
    navigate('/'); 
  };

  // Udostępniamy stan i funkcje "dzieciom"
  const value = {
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Własny "hook", aby łatwo korzystać z kontekstu w innych komponentach
export const useAuth = () => {
  return useContext(AuthContext);
};

import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Ta funkcja będzie przechowywać token JWT w pamięci przeglądarki
const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');

export const AuthProvider = ({ children }) => {
  // Sprawdzamy, czy token już istnieje przy starcie aplikacji
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const navigate = useNavigate();

  // === NOWA LOGIKA LOGOWANIA ===
  // Ta funkcja będzie rozmawiać z Twoim Spring Bootem
  const login = async (username, password) => {
    console.log('Wysyłanie próby logowania do Spring Boot...');
    
    // KROK 1: Wyślij zapytanie do backendu (Spring Boot)
    // UWAGA: Musisz stworzyć ten endpoint (/api/auth/login) w Springu!
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password: password }), // Dopasuj do DTO w Springu
      });

      if (!response.ok) {
        // Jeśli serwer zwróci błąd (np. 401 Unauthorized)
        throw new Error('Nieprawidłowy login lub hasło');
      }

      // KROK 2: Odbierz odpowiedź (oczekujemy tokena JWT)
      const data = await response.json(); 
      const jwtToken = data.token; // Zakładając, że Spring zwraca { "token": "..." }

      if (!jwtToken) {
        throw new Error('Nie otrzymano tokena JWT z serwera');
      }

      // KROK 3: Zapisz token i zaktualizuj stan
      setToken(jwtToken); // Zapisz token w localStorage
      setIsAuthenticated(true);
      console.log('Logowanie pomyślne, zapisano JWT.');
      
      // Przekierowanie na stronę główną (zgodnie z Twoją prośbą)
      navigate('/'); 
      return true;

    } catch (error) {
      console.error('Błąd logowania:', error.message);
      removeToken();
      setIsAuthenticated(false);
      return false;
    }
  };

  const logout = () => {
    removeToken(); // Usuń token
    setIsAuthenticated(false);
    navigate('/'); // Przekieruj na stronę główną (zgodnie z Twoją prośbą)
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    getToken, // Udostępniamy funkcję pobierania tokena
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
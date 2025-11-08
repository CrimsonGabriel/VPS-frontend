import {
  Box, Button, FormControl, FormLabel, Input,
<<<<<<< Updated upstream
  VStack, Heading, useToast, Flex, Text
} from '@chakra-ui/react';
import { useState } from 'react'; // ⭐️ Upewnij się, że 'useState' jest zaimportowany
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
=======
  VStack, Heading, useToast, Flex, Text,
  HStack // ⭐️ Dodany import
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // ⭐️ Dodany useNavigate
>>>>>>> Stashed changes

function LoginPage() {
  // Stany dla logowania
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
<<<<<<< Updated upstream
  const auth = useAuth();
  
  // ⭐️ Nowy stan do przełączania widoków ('login' | 'reset')
  const [view, setView] = useState('login');
  
  // ⭐️ Nowy stan dla e-maila do resetu
  const [resetEmail, setResetEmail] = useState('');
=======
  
  // ⭐️ Zamiast wywoływać auth.login(), będziemy nawigować po udanym zapisie tokena
  const navigate = useNavigate();
  const auth = useAuth(); // Nadal używamy do pobrania stanu (choć tu nie jest kluczowe)
  
  // ⭐️ Zaktualizowany stan widoku ('login' | 'reset' | '2fa')
  const [view, setView] = useState('login');
  
  // Stany dla resetowania i 2FA
  const [resetEmail, setResetEmail] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [tempToken, setTempToken] = useState(null); // Do przechowania tokena tymczasowego
>>>>>>> Stashed changes

  // Wspólne stany
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

<<<<<<< Updated upstream
  // Obsługa formularza logowania (bez zmian)
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await auth.login(username, password);
    
    if (!success) {
      toast({
        title: 'Błąd logowania',
        description: 'Nieprawidłowy login lub hasło.',
=======
  // ⭐️⭐️ ZMODYFIKOWANA FUNKCJA LOGOWANIA ⭐️⭐️
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Wykonujemy fetch bezpośrednio, aby obsłużyć odpowiedź 2FA
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password: password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Błąd logowania (np. 401 Nieautoryzowany)
        throw new Error(data.error || 'Nieprawidłowy login lub hasło.');
      }

      // Logowanie pomyślne, sprawdzamy czy wymaga 2FA
      if (data.requires2FA) {
        // TAK - Wymagane 2FA
        setTempToken(data.jwt); // Zapisz token tymczasowy
        setView('2fa'); // Pokaż widok 2FA
        setIsLoading(false);
      } else {
        // NIE - Logowanie zakończone
        // Zapisz finalny token w localStorage
        localStorage.setItem('jwtToken', data.jwt);
        // Przeładuj aplikację, aby AuthContext pobrał nowy token i stan
        navigate(0); 
      }

    } catch (err) {
      toast({
        title: 'Błąd logowania',
        description: err.message,
>>>>>>> Stashed changes
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
<<<<<<< Updated upstream
    }
    // 'isLoading' jest resetowane przez 'auth.login' lub w przypadku błędu
    setIsLoading(false);
  };

  // ⭐️⭐️ NOWA FUNKCJA: Obsługa formularza resetowania hasła ⭐️⭐️
  const handleSubmitReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: 'Błąd',
        description: 'Proszę podać adres e-mail.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
=======
      setIsLoading(false);
    }
  };

  // ⭐️⭐️ NOWA FUNKCJA: Obsługa weryfikacji 2FA ⭐️⭐️
  const handleSubmit2FA = async (e) => {
    e.preventDefault();
    if (!twoFaCode || twoFaCode.length !== 6) {
      toast({ title: 'Kod 2FA musi mieć 6 cyfr', status: 'warning', isClosable: true });
>>>>>>> Stashed changes
      return;
    }
    
    setIsLoading(true);

    try {
<<<<<<< Updated upstream
      // Używamy endpointu, który już istnieje na backendzie
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      // Zgodnie z naszą logiką bezpieczeństwa, backend ZAWSZE odpowie OK.
      // Pokazujemy użytkownikowi ogólny komunikat.
=======
      // Używamy endpointu weryfikacji 2FA dla logowania e-mail
      const response = await fetch('/api/auth/2fa/email-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}` // Użyj tokena tymczasowego
        },
        body: JSON.stringify({ totpCode: twoFaCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Błąd (np. 400 lub 401 dla złego kodu)
        throw new Error(data.error || 'Nieprawidłowy kod 2FA.');
      }

      // Sukces! Otrzymaliśmy finalny token
      // (Zakładam, że backend zwraca go w polu 'token' lub 'jwt' - na podst. Androida wiem, że 'token')
      // Zgodnie z Android `LoginActivity.java` (linia 334) serwer zwracał "token"
      // Ale AuthService.java (linia 258) pokazuje rekord z "jwt". Będę trzymał się "jwt" jak w AuthService.
      const finalToken = data.jwt || data.token; 

      if (!finalToken) {
         throw new Error('Nie otrzymano finalnego tokena od serwera.');
      }

      // Zapisz finalny token i przeładuj
      localStorage.setItem('jwtToken', finalToken);
      navigate(0); // Przeładuj, aby AuthContext zalogował użytkownika

    } catch (err) {
      toast({
        title: 'Błąd weryfikacji 2FA',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  // Funkcja resetowania hasła (bez zmian)
  const handleSubmitReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: 'Błąd', description: 'Proszę podać adres e-mail.', status: 'warning', isClosable: true });
      return;
    }
    
    setIsLoading(true);
    try {
      await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
>>>>>>> Stashed changes
      toast({
        title: 'Wysłano prośbę',
        description: 'Jeśli konto o podanym adresie e-mail istnieje, wysłaliśmy na nie link do resetowania hasła.',
        status: 'success',
        duration: 6000,
        isClosable: true,
      });
<<<<<<< Updated upstream

      // Wracamy do widoku logowania
      setView('login');
      setResetEmail('');

    } catch (err) {
      toast({
        title: 'Błąd sieci',
        description: 'Nie udało się wysłać prośby. Spróbuj ponownie.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
=======
      setView('login');
      setResetEmail('');
    } catch (err) {
      toast({ title: 'Błąd sieci', description: 'Nie udało się wysłać prośby.', status: 'error', duration: 3000, isClosable: true });
>>>>>>> Stashed changes
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< Updated upstream
  // ⭐️ Funkcja renderująca odpowiedni formularz
  const renderForm = () => {
=======
  // Funkcja anulowania 2FA
  const handleCancel2FA = () => {
    setView('login');
    setTempToken(null);
    setTwoFaCode('');
  };

  // ⭐️ ZAKTUALIZOWANA FUNKCJA RENDEROWANIA ⭐️
  const renderForm = () => {
    // 1. Widok Logowania
>>>>>>> Stashed changes
    if (view === 'login') {
      return (
        <VStack as="form" spacing={4} onSubmit={handleSubmitLogin}>
          <Heading mb={4}>Logowanie</Heading>
          <FormControl isRequired>
            <FormLabel>Login (Email)</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@example.com"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Hasło</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
          >
            Zaloguj
          </Button>
<<<<<<< Updated upstream
          
          {/* ⭐️ Przycisk do przełączania widoku */}
=======
>>>>>>> Stashed changes
          <Button
            variant="link"
            colorScheme="blue"
            size="sm"
            onClick={() => setView('reset')}
          >
            Zapomniałeś hasła?
          </Button>
        </VStack>
      );
    }

<<<<<<< Updated upstream
=======
    // 2. Widok Resetowania Hasła
>>>>>>> Stashed changes
    if (view === 'reset') {
      return (
        <VStack as="form" spacing={4} onSubmit={handleSubmitReset}>
          <Heading mb={4} size="lg">Zresetuj hasło</Heading>
          <Text textAlign="center" fontSize="sm" color="gray.300">
            Podaj e-mail powiązany z kontem. Wyślemy link do resetowania hasła.
          </Text>
          <FormControl isRequired>
            <FormLabel>E-mail</FormLabel>
            <Input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="twoj.email@przyklad.com"
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
          >
            Wyślij link
          </Button>
<<<<<<< Updated upstream
          
          {/* ⭐️ Przycisk do powrotu */}
=======
>>>>>>> Stashed changes
          <Button
            variant="link"
            colorScheme="gray"
            size="sm"
            onClick={() => setView('login')}
          >
            Wróć do logowania
          </Button>
        </VStack>
      );
    }
<<<<<<< Updated upstream
=======

    // ⭐️ 3. NOWY WIDOK: WERYFIKACJA 2FA ⭐️
    if (view === '2fa') {
      return (
        <VStack as="form" spacing={4} onSubmit={handleSubmit2FA}>
          <Heading mb={2} size="lg">Weryfikacja 2FA</Heading>
          <Text textAlign="center" fontSize="sm" color="gray.300">
            Otwórz aplikację uwierzytelniającą i wpisz 6-cyfrowy kod.
          </Text>
          <FormControl isRequired>
            <FormLabel>Kod 2FA</FormLabel>
            <Input
              type="text" // Użyj "text", aby obsłużyć wklejanie
              value={twoFaCode}
              onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))} // Pozwól tylko na cyfry
              placeholder="123456"
              maxLength={6}
              textAlign="center"
              letterSpacing="0.5em"
            />
          </FormControl>
          <HStack width="full">
             <Button
              variant="ghost"
              colorScheme="gray"
              width="full"
              onClick={handleCancel2FA}
              isDisabled={isLoading}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isLoading}
            >
              Zatwierdź
            </Button>
          </HStack>
        </VStack>
      );
    }
>>>>>>> Stashed changes
  };

  return (
    <Flex align="center" justify="center" minH="80vh">
      <Box p={8} maxW="md" borderWidth={1} borderRadius="lg" boxShadow="lg" bg="gray.800" minW="400px">
        
<<<<<<< Updated upstream
        {/* ⭐️ Renderujemy jeden z dwóch formularzy */}
=======
        {/* Renderujemy jeden z trzech formularzy */}
>>>>>>> Stashed changes
        {renderForm()}

        {/* Sekcja "Zarejestruj się" jest wspólna i widoczna tylko przy logowaniu */}
        {view === 'login' && (
          <Text mt={6} textAlign="center">
            Nie masz konta?{' '}
            <Button as={RouterLink} to="/register" colorScheme="blue" variant="link">
              Zarejestruj się
            </Button>
          </Text>
        )}

      </Box>
    </Flex>
  );
}

export default LoginPage;
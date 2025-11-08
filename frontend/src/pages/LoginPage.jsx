import {
  Box, Button, FormControl, FormLabel, Input,
  VStack, Heading, useToast, Flex, Text
} from '@chakra-ui/react';
import { useState } from 'react'; // ⭐️ Upewnij się, że 'useState' jest zaimportowany
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

function LoginPage() {
  // Stany dla logowania
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  
  // ⭐️ Nowy stan do przełączania widoków ('login' | 'reset')
  const [view, setView] = useState('login');
  
  // ⭐️ Nowy stan dla e-maila do resetu
  const [resetEmail, setResetEmail] = useState('');

  // Wspólne stany
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Obsługa formularza logowania (bez zmian)
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await auth.login(username, password);
    
    if (!success) {
      toast({
        title: 'Błąd logowania',
        description: 'Nieprawidłowy login lub hasło.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
      return;
    }
    
    setIsLoading(true);

    try {
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
      toast({
        title: 'Wysłano prośbę',
        description: 'Jeśli konto o podanym adresie e-mail istnieje, wysłaliśmy na nie link do resetowania hasła.',
        status: 'success',
        duration: 6000,
        isClosable: true,
      });

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
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐️ Funkcja renderująca odpowiedni formularz
  const renderForm = () => {
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
          
          {/* ⭐️ Przycisk do przełączania widoku */}
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
          
          {/* ⭐️ Przycisk do powrotu */}
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
  };

  return (
    <Flex align="center" justify="center" minH="80vh">
      <Box p={8} maxW="md" borderWidth={1} borderRadius="lg" boxShadow="lg" bg="gray.800" minW="400px">
        
        {/* ⭐️ Renderujemy jeden z dwóch formularzy */}
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
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon,
  VStack, Button, useToast, FormControl, FormLabel, Input,
  Divider, SimpleGrid
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Endpointy, których będziemy używać
const API_GET_USER_DETAILS = '/api/user/me';
const API_CHANGE_PASSWORD = '/api/user/change-password';

function AccountPage() {
  const { getToken, logout, userEmail: emailFromContext } = useAuth();
  const toast = useToast();

  // Stan dla danych użytkownika
  const [userData, setUserData] = useState({ email: emailFromContext, name: '' });
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState(null);

  // Stan dla formularza zmiany hasła
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // --- 1. POBIERANIE DANYCH UŻYTKOWNIKA ---
  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoadingUser(true);
      setErrorUser(null);
      const token = getToken();

      try {
        const response = await fetch(API_GET_USER_DETAILS, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
          toast({ title: 'Sesja wygasła', status: 'error', isClosable: true });
          logout();
          return;
        }
        if (!response.ok) {
          throw new Error('Nie udało się pobrać danych użytkownika.');
        }

        const data = await response.json();
        setUserData({ email: data.email, name: data.name || 'Brak' });

      } catch (err) {
        setErrorUser(err.message);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserDetails();
    // Używamy `getToken` i `logout` jako zależności, aby uspokoić lintera
  }, [getToken, logout, toast]);

  // --- 2. LOGIKA ZMIANY HASŁA ---
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingPassword(true);

    // Walidacja
    if (passwords.newPassword.length < 8) {
      toast({ title: 'Hasło musi mieć co najmniej 8 znaków', status: 'warning', isClosable: true });
      setIsLoadingPassword(false);
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: 'Nowe hasła nie są zgodne', status: 'warning', isClosable: true });
      setIsLoadingPassword(false);
      return;
    }

    const token = getToken();
    try {
      const response = await fetch(API_CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      if (response.status === 403) {
        throw new Error('Obecne hasło jest nieprawidłowe.');
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Wystąpił błąd serwera.');
      }

      toast({ title: 'Hasło zmienione pomyślnie!', status: 'success', isClosable: true });
      // Wyczyść pola po sukcesie
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (err) {
      toast({ title: 'Błąd zmiany hasła', description: err.message, status: 'error', isClosable: true });
    } finally {
      setIsLoadingPassword(false);
    }
  };


  // --- 3. RENDEROWANIE WIDOKU ---
  
  const renderUserDetails = () => {
    if (isLoadingUser) return <Spinner />;
    if (errorUser) {
      return (
        <Alert status="error">
          <AlertIcon />
          {errorUser}
        </Alert>
      );
    }
    return (
      <VStack spacing={3} align="flex-start">
        <Box>
          <Text fontSize="sm" color="gray.400">Adres e-mail</Text>
          <Text fontSize="lg" fontWeight="bold">{userData.email}</Text>
        </Box>
        <Box>
          <Text fontSize="sm" color="gray.400">Imię / Nazwa</Text>
          <Text fontSize="lg" fontWeight="bold">{userData.name}</Text>
        </Box>
      </VStack>
    );
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="gray.800" maxW="4xl" mx="auto">
      <Heading size="lg" mb={6}>Moje Konto</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        
        {/* Kolumna 1: Dane Użytkownika */}
        <VStack spacing={4} align="flex-start">
          <Heading size="md" mb={2}>Twoje Dane</Heading>
          {renderUserDetails()}
        </VStack>

        {/* Kolumna 2: Zmiana Hasła */}
        <VStack as="form" spacing={4} align="flex-start" onSubmit={handlePasswordSubmit}>
          <Heading size="md" mb={2}>Zmień Hasło</Heading>
          <Text fontSize="sm" color="gray.400">
            Zostaw pola puste, jeśli nie chcesz zmieniać hasła.
          </Text>

          <FormControl isRequired>
            <FormLabel>Obecne hasło</FormLabel>
            <Input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Nowe hasło (min. 8 znaków)</FormLabel>
            <Input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Potwierdź nowe hasło</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
            />
          </FormControl>
          
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoadingPassword}
          >
            Zaktualizuj hasło
          </Button>
        </VStack>

      </SimpleGrid>
    </Box>
  );
}

export default AccountPage;
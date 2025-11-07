import {
  Box, Button, FormControl, FormLabel, Input,
  VStack, Heading, useToast, Flex, Text // ⭐️ Dodano 'Text'
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom'; // ⭐️ Dodano import Linka

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
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
    setIsLoading(false);
  };

  return (
    <Flex align="center" justify="center" minH="80vh">
      <Box p={8} maxW="md" borderWidth={1} borderRadius="lg" boxShadow="lg" bg="gray.800">
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
          <Heading mb={4}>Logowanie</Heading>
          <FormControl isRequired>
            <FormLabel>Login (Email)</FormLabel> {/* Zaktualizowałem etykietę */}
            <Input
              type="text" // ⭐️ POPRAWKA: Powrót do 'text' aby zezwolić na login 'admin'
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
        </VStack>

        {/* ⭐️⭐️ DODANA SEKCJA ⭐️⭐️ */}
        <Text mt={6} textAlign="center">
          Nie masz konta?{' '}
          <Button as={RouterLink} to="/register" colorScheme="blue" variant="link">
            Zarejestruj się
          </Button>
        </Text>
        {/* ⭐️⭐️ KONIEC SEKCJI ⭐️⭐️ */}

      </Box>
    </Flex>
  );
}

export default LoginPage;
import {
  Box, Button, FormControl, FormLabel, Input,
  VStack, Heading, useToast, Flex
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // <--- Używamy naszego hooka

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth(); // <--- Pobieramy funkcję logowania
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Wywołujemy logikę z AuthContext
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
    // Przekierowanie odbywa się w samym AuthContext
    setIsLoading(false);
  };

  return (
    <Flex align="center" justify="center" minH="80vh">
      <Box p={8} maxW="md" borderWidth={1} borderRadius="lg" boxShadow="lg" bg="gray.800">
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
          <Heading mb={4}>Logowanie</Heading>
          <FormControl isRequired>
            <FormLabel>Login</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Hasło</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
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
      </Box>
    </Flex>
  );
}

export default LoginPage;

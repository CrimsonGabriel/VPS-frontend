import { Box, Flex, Heading, Link, Spacer, Button, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' 

function Navbar() {
  const { logout } = useAuth();

  return (
    <Box
      bg="gray.900"
      px={4}
      py={3}
      borderBottom="1px"
      borderColor="gray.700"
      position="fixed" 
      top={0}
      left={0}
      right={0}
      zIndex={10} 
    >
      <Flex align="center">
        
        {/* LEWA STRONA (Status Zalogowania) */}
        <Flex align="center" gap={3}>
          <Text color="white" fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
            Witaj, admin
          </Text>
          <Button colorScheme="red" size="sm" onClick={logout}>
            Wyloguj
          </Button>
        </Flex>

        <Spacer />

        {/* PRAWA STRONA (Linki Nawigacyjne) */}
        <Flex gap={4}>
          <Link as={RouterLink} to="/" color="blue.300" fontWeight="medium">
            Strona Główna
          </Link>
          <Link as={RouterLink} to="/status-ip" color="blue.300" fontWeight="medium">
            Status IP
          </Link>
          <Link as={RouterLink} to="/users" color="blue.300" fontWeight="medium">
            Użytkownicy
          </Link>
          <Link as={RouterLink} to="/api-test" color="blue.300" fontWeight="medium">
            Test API
          </Link>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Navbar

import { useState, useEffect } from 'react'
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon,
  VStack, List, ListItem, Tag
} from '@chakra-ui/react'
// 1. Importujemy hooka
import { useAuth } from '../context/AuthContext';

const API_URL = '/status/json'

function UsersPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // 2. Pobieramy funkcję do brania tokena
  const { getToken } = useAuth();

  const fetchUsers = async () => {
    try {
      // 3. Pobieramy token i dodajemy go do nagłówka 'fetch'
      const token = getToken();
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // === Koniec zmian ===

      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status} (${response.statusText})`)
      }
      const data = await response.json()
      setData(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    const intervalId = setInterval(fetchUsers, 5000)
    return () => clearInterval(intervalId)
  }, [])

  if (loading && !data) {
    return <Spinner size="xl" />
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Nie można połączyć się z serwerem: {error}
      </Alert>
    )
  }

  const users = data?.authorizedUsers || []
  const users2FA = data?.users2FAStatus || {}

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="gray.800">
      <Heading size="lg" mb={4}>Autoryzowani Użytkownicy</Heading>
      {users.length > 0 ? (
        <List spacing={3}>
          {users.map(email => (
            <ListItem key={email} p={3} bg="gray.700" borderRadius="md" display="flex" justifyContent="space-between" alignItems="center">
              <Text>{email}</Text>
              {users2FA[email]?.enabled ? (
                <Tag colorScheme="green">2FA Aktywne</Tag>
              ) : (
                <Tag colorScheme="yellow">2FA Nieaktywne</Tag>
              )}
            </ListItem>
          ))}
        </List>
      ) : (
        <Text color="gray.400">Brak autoryzowanych użytkowników.</Text>
      )}
    </Box>
  )
}

export default UsersPage
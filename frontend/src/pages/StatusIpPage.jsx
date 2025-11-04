import { useState, useEffect } from 'react'
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon,
  VStack, List, ListItem, ListIcon, Tag
} from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
// Importujemy hooka (to już miałeś)
import { useAuth } from '../context/AuthContext';

// URL do Twojego API
const API_URL = '/status/json'

function StatusIpPage() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Pobieramy funkcję do brania tokena (to już miałeś)
  const { getToken } = useAuth();

  const fetchStatus = async () => {
    try {
      // Pobieramy token (to już miałeś)
	  const token = getToken();

      // === POPRAWKA TUTAJ ===
      // Dodajemy obiekt 'headers' do zapytania 'fetch'
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // === KONIEC POPRAWKI ===

      if (!response.ok) {
        // Jeśli Spring Boot zwróci 401 lub 403, rzucimy błąd
        throw new Error(`Błąd HTTP: ${response.status} (${response.statusText})`)
      }
      const data = await response.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      console.error('Błąd pobierania statusu:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  
  useEffect(() => {
    fetchStatus() 
    const intervalId = setInterval(fetchStatus, 5000) 
    return () => clearInterval(intervalId)
  }, []) 

  if (loading && !status) {
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

  if (!status) {
    return <Text>Brak danych.</Text>
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="gray.800">
        <Heading size="lg" mb={3}>Status Połączeń</Heading>
        <Text fontSize="lg">
          Ostatni meldunek: <Tag colorScheme="cyan">{status.lastReportText}</Tag>
        </Text>
      </Box>

      <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="gray.800">
        <Heading size="md" mb={3}>Raspberry Pi</Heading>
        {status.registeredRPiIp && !status.registeredRPiIp.startsWith('Brak') ? (
          <Text fontSize="lg"><CheckCircleIcon color="green.500" mr={2} /> {status.registeredRPiIp}</Text>
        ) : (
          <Text fontSize="lg"><WarningIcon color="red.500" mr={2} /> Brak IP RPi</Text>
        )}
      </Box>

      <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="gray.800">
        <Heading size="md" mb={3}>Zarejestrowane IP Androida</Heading>
        {status.registeredAndroidIps && status.registeredAndroidIps.length > 0 ? (
          <List spacing={3}>
            {status.registeredAndroidIps.map(ip => (
              <ListItem key={ip}>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                {ip}
              </ListItem>
            ))}
          </List>
        ) : (
          <Text color="gray.400">Brak zarejestrowanych adresów IP Androida.</Text>
        )}
      </Box>
    </VStack>
  )
}

export default StatusIpPage;
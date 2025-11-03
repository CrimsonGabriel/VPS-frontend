import { useState } from 'react'
import {
  Box, Heading, Button, VStack,
  Textarea, Code, useToast
} from '@chakra-ui/react'

function ApiTestPage() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleTest = async (endpoint) => {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2)) // Ładnie sformatowany JSON
      toast({
        title: 'Test udany!',
        description: `Pobrano dane z ${endpoint}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      setResult(`Błąd: ${err.message}`)
      toast({
        title: 'Błąd testu!',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="lg">Testowanie Endpointów REST API</Heading>
      
      <Button
        colorScheme="blue"
        onClick={() => handleTest('/status/json')}
        isLoading={loading}
      >
        Testuj /status/json (GET)
      </Button>
      
      <Button
        colorScheme="teal"
        onClick={() => handleTest('/data/android')}
        isLoading={loading}
        title="Musisz być zalogowany w innej karcie lub wysłać token"
      >
        Testuj /data/android (GET - Wymaga Auth)
      </Button>

      <Heading size="md" mt={6}>Wynik:</Heading>
      {result && (
        <Box bg="gray.900" p={4} borderRadius="md" maxH="500px" overflowY="auto">
          <Code as="pre" color="white" w="100%">
            {result}
          </Code>
        </Box>
      )}
    </VStack>
  )
}

export default ApiTestPage

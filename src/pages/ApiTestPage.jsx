import { useState } from 'react'
import {
  Box, Heading, Button, VStack, HStack,
  Textarea, Input, Select, Text, useToast,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Badge, SimpleGrid, FormControl, FormLabel
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

function ApiTestPage() {
  const { getToken } = useAuth()
  const toast = useToast()

  // Stan formularza
  const [url, setUrl] = useState('/status/json')
  const [method, setMethod] = useState('GET')
  const [body, setBody] = useState('')
  
  // Stan wyniku
  const [responseStatus, setResponseStatus] = useState(null)
  const [responseBody, setResponseBody] = useState(null)
  const [loading, setLoading] = useState(false)

  // --- DEFINICJE ENDPOINTÓW (PRESETY) ---
  // Na podstawie analizy Twoich kontrolerów: AdminController, FolderController, ApiController, FileController
  const presets = {
    "Publiczne / Ogólne": [
      { label: "Status Systemu (JSON)", method: "GET", url: "/status/json", body: null },
      { label: "Root (String)", method: "GET", url: "/", body: null },
    ],
    "Użytkownik (User & Auth)": [
      { label: "Pobierz swoje dane (Me)", method: "GET", url: "/api/user/me", body: null },
      { label: "Zmień hasło", method: "POST", url: "/api/user/change-password", body: JSON.stringify({ currentPassword: "stare", newPassword: "nowe123" }, null, 2) },
    ],
    "Foldery (Struktura)": [
      { label: "Lista folderów", method: "GET", url: "/api/folders", body: null },
      { label: "Utwórz folder", method: "POST", url: "/api/folders", body: JSON.stringify({ name: "Nowy Folder", color: "#FF5733", icon: "FaFolder" }, null, 2) },
      { label: "Edytuj folder (ID wym.)", method: "PUT", url: "/api/folders/{id}", body: JSON.stringify({ name: "Zmieniona Nazwa", color: "#0000FF" }, null, 2) },
      { label: "Usuń folder (ID wym.)", method: "DELETE", url: "/api/folders/{id}", body: null },
    ],
    "Ulubione (Sensory/Bramki)": [
      { label: "Ulubione Bramki", method: "GET", url: "/api/favorites/gateways", body: null },
      { label: "Dodaj Bramkę do Ulub.", method: "POST", url: "/api/favorites/gateways", body: JSON.stringify({ id: 1 }, null, 2) },
      { label: "Ulubione Sensory", method: "GET", url: "/api/favorites/sensors", body: null },
    ],
    "Dane i Sensory (Android/API)": [
      { label: "Dane dla Androida (Top 10)", method: "GET", url: "/data/android", body: null },
      { label: "Lista Bramek Usera", method: "GET", url: "/api/gateways", body: null },
      { label: "Edytuj Sensor (Nazwa)", method: "PUT", url: "/api/sensors/{id}", body: JSON.stringify({ name: "Nowa Nazwa Sensora" }, null, 2) },
      { label: "Przełącz Raportowanie", method: "POST", url: "/api/sensors/{id}/toggle-reporting", body: null },
      { label: "Globalny Interwał (Sek)", method: "POST", url: "/api/sensors/interval/global", body: JSON.stringify({ interval: 60 }, null, 2) },
    ],
    "Admin (Wymaga roli ADMIN)": [
      { label: "Lista Użytkowników", method: "GET", url: "/api/admin/users", body: null },
      { label: "Szczegóły usera (ID)", method: "GET", url: "/api/admin/users/{id}", body: null },
      { label: "Utwórz Usera", method: "POST", url: "/api/admin/users", body: JSON.stringify({ email: "new@test.com", password: "pass", name: "Tester", isAdmin: false }, null, 2) },
      { label: "Usuń Usera (ID)", method: "DELETE", url: "/api/admin/users/{id}", body: null },
      { label: "Statusy Aktualizacji", method: "GET", url: "/api/admin/update/status", body: null },
      { label: "Utwórz Sensor (Admin)", method: "POST", url: "/api/admin/sensors", body: JSON.stringify({ gatewayId: 1, type: "TEMP_HUM", name: "Sensor Admina" }, null, 2) },
    ],
    "Pliki (FileController)": [
      { label: "Lista plików (JSON)", method: "GET", url: "/api/files", body: null },
      { label: "Usuń plik (ID)", method: "DELETE", url: "/api/files/{id}", body: null },
      // Upload wymaga multipart/form-data, trudne w prostym JSON testerze, lepiej użyć dedykowanej strony
    ]
  }

  // Funkcja ładująca preset do formularza
  const loadPreset = (preset) => {
    setUrl(preset.url)
    setMethod(preset.method)
    setBody(preset.body || '')
    setResponseStatus(null)
    setResponseBody(null)
    toast({
      title: `Załadowano: ${preset.label}`,
      status: 'info',
      duration: 1000,
    })
  }

  // Główna funkcja wysyłająca żądanie
  const handleSendRequest = async () => {
    setLoading(true)
    setResponseStatus(null)
    setResponseBody(null)

    try {
      const token = getToken()
      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Opcje fetch
      const options = {
        method: method,
        headers: headers,
      }

      // Dodaj body tylko dla metod, które tego wymagają (nie GET/HEAD)
      if (method !== 'GET' && method !== 'HEAD' && body) {
        try {
            // Walidacja czy JSON jest poprawny
            JSON.parse(body)
            options.body = body
        } catch (e) {
            throw new Error("Body musi być poprawnym formatem JSON!")
        }
      }

      const res = await fetch(url, options)
      setResponseStatus(`${res.status} ${res.statusText}`)

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json()
        setResponseBody(JSON.stringify(data, null, 2))
      } else {
        const text = await res.text()
        setResponseBody(text)
      }

      if (!res.ok) {
          toast({ title: 'Błąd API', status: 'warning', duration: 3000 })
      } else {
          toast({ title: 'Sukces', status: 'success', duration: 2000 })
      }

    } catch (err) {
      setResponseBody(`BŁĄD WYKONANIA: ${err.message}`)
      toast({ title: 'Błąd', description: err.message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <VStack spacing={6} align="stretch" p={4} maxW="1200px" mx="auto">
      <Heading size="lg">Konsola Testowa API (Swagger-lite)</Heading>
      <Text color="gray.400">
        Wybierz endpoint z listy poniżej, dostosuj parametry (np. zamień <code>{'{id}'}</code> na liczbę) i wyślij żądanie.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        
        {/* KOLUMNA 1: LISTA ENDPOINTÓW (PRESETY) */}
        <Box gridColumn={{ md: "span 1" }}>
          <Heading size="sm" mb={3}>Dostępne Endpointy</Heading>
          <Accordion allowToggle reduceMotion>
            {Object.entries(presets).map(([category, items]) => (
              <AccordionItem key={category} border="none" mb={2}>
                <h2>
                  <AccordionButton bg="gray.700" borderRadius="md" _expanded={{ bg: 'teal.600', color: 'white' }}>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      {category}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} bg="gray.800" borderRadius="md" mt={1}>
                  <VStack align="stretch" spacing={2}>
                    {items.map((item, idx) => (
                      <Button 
                        key={idx} 
                        size="sm" 
                        variant="ghost" 
                        justifyContent="flex-start" 
                        onClick={() => loadPreset(item)}
                        leftIcon={<Badge colorScheme={item.method === 'GET' ? 'blue' : item.method === 'POST' ? 'green' : item.method === 'DELETE' ? 'red' : 'orange'}>{item.method}</Badge>}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>

        {/* KOLUMNA 2 i 3: FORMULARZ I WYNIK */}
        <Box gridColumn={{ md: "span 2" }}>
          <Box bg="gray.700" p={4} borderRadius="lg" shadow="md">
            <VStack spacing={4}>
              
              {/* URL i METODA */}
              <HStack w="100%">
                <Select 
                    w="120px" 
                    value={method} 
                    onChange={(e) => setMethod(e.target.value)}
                    bg={method === 'GET' ? 'blue.900' : method === 'POST' ? 'green.900' : method === 'DELETE' ? 'red.900' : 'orange.900'}
                    fontWeight="bold"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </Select>
                <Input 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    fontFamily="mono"
                    placeholder="/api/..."
                />
              </HStack>

              {/* BODY (JSON) */}
              {method !== 'GET' && (
                <FormControl>
                  <FormLabel size="sm" color="gray.300">Request Body (JSON)</FormLabel>
                  <Textarea 
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    minH="150px"
                    fontFamily="mono"
                    fontSize="sm"
                    bg="gray.800"
                  />
                </FormControl>
              )}

              <Button 
                colorScheme="teal" 
                w="full" 
                onClick={handleSendRequest}
                isLoading={loading}
                loadingText="Wysyłanie..."
              >
                Wyślij Żądanie
              </Button>
            </VStack>
          </Box>

          {/* WYNIK */}
          {responseStatus && (
            <Box mt={6} p={4} bg={responseStatus.startsWith("2") ? "green.900" : "red.900"} borderRadius="md" borderLeft="5px solid" borderColor={responseStatus.startsWith("2") ? "green.400" : "red.400"}>
              <Heading size="sm" mb={2}>Status: {responseStatus}</Heading>
              <Textarea 
                readOnly 
                value={responseBody || ''} 
                minH="200px" 
                bg="blackAlpha.600" 
                fontFamily="mono" 
                fontSize="sm"
              />
            </Box>
          )}
        </Box>
      </SimpleGrid>
    </VStack>
  )
}

export default ApiTestPage
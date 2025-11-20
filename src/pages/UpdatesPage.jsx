import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Flex, Heading, Input, Select, Text, Textarea, 
  Table, Thead, Tbody, Tr, Th, Td, Badge, 
  Tabs, TabList, TabPanels, Tab, TabPanel, 
  useToast, Card, CardBody, CardHeader, Stack, Divider,
  FormControl, FormLabel, Spinner
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { FiRefreshCw, FiSend } from 'react-icons/fi';

export default function UpdatesPage() {
  const { token, logout } = useAuth();
  const toast = useToast();

  // ⭐️ 1. Stan do śledzenia aktywnej zakładki (0 = Kreator, 1 = Historia)
  const [tabIndex, setTabIndex] = useState(0);

  // Data state
  const [users, setUsers] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [updatesList, setUpdatesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    version: '',
    urgency: 'OPTIONAL',
    targetType: 'APP',
    targetUserId: '',
    targetGatewayId: '',
    targetSensorId: ''
  });

  useEffect(() => {
    if (token && token !== 'null' && token !== 'undefined') {
      fetchUsers();
      fetchUpdatesList();
    }
  }, [token]);

  useEffect(() => {
    if (formData.targetUserId && formData.targetType !== 'APP') {
      fetchGatewaysForUser(formData.targetUserId);
    } else {
      setGateways([]);
      setFormData(prev => ({ ...prev, targetGatewayId: '' }));
    }
  }, [formData.targetUserId, formData.targetType]);

  useEffect(() => {
    if (formData.targetGatewayId && formData.targetType === 'SENSOR') {
      fetchSensorsForGateway(formData.targetGatewayId);
    } else {
      setSensors([]);
      setFormData(prev => ({ ...prev, targetSensorId: '' }));
    }
  }, [formData.targetGatewayId, formData.targetType]);

  // --- API CALLS ---
  const apiCall = async (url, options = {}) => {
    if (!token || token === 'null' || token === 'undefined') return null;

    try {
      const res = await fetch(url, {
        ...options,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers 
        }
      });

      if (res.status === 401) {
        console.warn("Token odrzucony (401). Wylogowywanie...");
        logout();
        return null;
      }

      if (!res.ok) throw new Error(`Error: ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error(e);
      toast({
        title: 'Błąd API',
        description: e.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return null;
    }
  };

  const fetchUsers = async () => {
    const data = await apiCall('/api/admin/users');
    if (data) setUsers(data);
  };

  const fetchGatewaysForUser = async (userId) => {
    const data = await apiCall(`/api/admin/users/${userId}/gateways`);
    if (data) setGateways(data);
  };

  const fetchSensorsForGateway = async (gatewayId) => {
    const data = await apiCall(`/api/admin/gateways/${gatewayId}/sensors`); 
    if (data) setSensors(data);
  };

  const fetchUpdatesList = async () => {
    setLoading(true);
    const data = await apiCall('/api/admin/updates');
    if (data) setUpdatesList(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch('/api/admin/updates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
    });
    
    setLoading(false);
    if (res.ok) {
      toast({ title: 'Sukces', description: 'Aktualizacja utworzona i wysłana.', status: 'success', duration: 3000 });
      fetchUpdatesList();
      setFormData({ ...formData, title: '', description: '', version: '' });
      // Opcjonalnie: Przełącz na zakładkę historii po wysłaniu
      setTabIndex(1); 
    } else {
        if (res.status === 401) logout();
        toast({ title: 'Błąd', description: 'Nie udało się utworzyć aktualizacji.', status: 'error', duration: 3000 });
    }
  };

  const handleResend = async (assignmentId) => {
    await apiCall(`/api/admin/updates/${assignmentId}/resend`, { method: 'POST' });
    toast({ title: 'Wysłano ponownie', status: 'info', duration: 2000 });
    fetchUpdatesList();
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'REQUIRED': return 'red';
      case 'OPTIONAL': return 'green';
      case 'CUSTOM': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return <Badge colorScheme="green">ZAINSTALOWANO</Badge>;
      case 'PENDING': return <Badge colorScheme="yellow">OCZEKUJE</Badge>;
      case 'DEFERRED': return <Badge colorScheme="orange">ODŁOŻONO</Badge>;
      case 'FAILED': return <Badge colorScheme="red">BŁĄD</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <Box p={5} bg="gray.900" minH="100vh" color="white">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="orange.300">Zarządzanie Aktualizacjami</Heading>
        
        {/* ⭐️ 3. Warunkowe wyświetlanie przycisku (tylko gdy tabIndex === 1) */}
        {tabIndex === 1 && (
          <Button leftIcon={<FiRefreshCw />} onClick={fetchUpdatesList} size="sm" colorScheme="blue" variant="outline">
            Odśwież listę
          </Button>
        )}
      </Flex>

      {/* ⭐️ 2. Podpięcie stanu pod Tabs */}
      <Tabs 
        variant="enclosed" 
        colorScheme="orange" 
        index={tabIndex} 
        onChange={(index) => setTabIndex(index)}
      >
        <TabList mb={4} borderColor="gray.700">
          <Tab _selected={{ color: 'white', bg: 'gray.700', borderColor: 'gray.600', borderBottomColor: 'gray.700' }}>
            Kreator Aktualizacji
          </Tab>
          <Tab _selected={{ color: 'white', bg: 'gray.700', borderColor: 'gray.600', borderBottomColor: 'gray.700' }}>
            Aktywne i Historia
          </Tab>
        </TabList>

        <TabPanels>
          {/* --- PANEL 1: KREATOR --- */}
          <TabPanel p={0}>
            <Card bg="gray.800" borderColor="gray.700" borderWidth="1px" maxW="800px">
              <CardHeader borderBottomWidth="1px" borderColor="gray.700" pb={3}>
                <Heading size="md" color="gray.200">Wyślij nową aktualizację</Heading>
                <Text fontSize="sm" color="gray.400">Skonfiguruj parametry i wybierz cel.</Text>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={4}>
                    
                    <Flex gap={4}>
                      <FormControl isRequired>
                        <FormLabel>Tytuł</FormLabel>
                        <Input 
                          bg="gray.900" borderColor="gray.600" 
                          value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                          placeholder="Np. Poprawka bezpieczeństwa"
                        />
                      </FormControl>
                      <FormControl isRequired maxW="150px">
                        <FormLabel>Wersja</FormLabel>
                        <Input 
                          bg="gray.900" borderColor="gray.600" 
                          value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} 
                          placeholder="1.0.0"
                        />
                      </FormControl>
                    </Flex>

                    <FormControl>
                      <FormLabel>Opis</FormLabel>
                      <Textarea 
                        bg="gray.900" borderColor="gray.600" 
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                        placeholder="Opis zmian..."
                      />
                    </FormControl>

                    <Flex gap={4}>
                      <FormControl isRequired>
                        <FormLabel>Priorytet (Urgency)</FormLabel>
                        <Select 
                          bg="gray.900" borderColor="gray.600" 
                          value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}
                        >
                          <option value="OPTIONAL">Opcjonalna (Zielona)</option>
                          <option value="REQUIRED">Wymagana (Czerwona)</option>
                          <option value="CUSTOM">Niestandardowa</option>
                        </Select>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Typ Celu</FormLabel>
                        <Select 
                          bg="gray.900" borderColor="gray.600" 
                          value={formData.targetType} 
                          onChange={e => setFormData({...formData, targetType: e.target.value, targetGatewayId: '', targetSensorId: ''})}
                        >
                          <option value="APP">Aplikacja (Android)</option>
                          <option value="GATEWAY">Bramka (Gateway)</option>
                          <option value="SENSOR">Czujnik (Sensor)</option>
                        </Select>
                      </FormControl>
                    </Flex>

                    <Divider borderColor="gray.600" />

                    <Box bg="gray.900" p={4} borderRadius="md" border="1px solid" borderColor="gray.700">
                      <Heading size="sm" mb={3} color="gray.300">Wybór Odbiorcy</Heading>
                      
                      <Stack spacing={3}>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">Użytkownik</FormLabel>
                          <Select 
                            bg="gray.800" borderColor="gray.600" placeholder="Wybierz użytkownika..."
                            value={formData.targetUserId} onChange={e => setFormData({...formData, targetUserId: e.target.value})}
                          >
                            {users.map(u => (
                              <option key={u.id} value={u.id} style={{color:'black'}}>{u.email}</option>
                            ))}
                          </Select>
                        </FormControl>

                        {formData.targetType !== 'APP' && (
                          <FormControl isRequired>
                            <FormLabel fontSize="sm">Bramka</FormLabel>
                            <Select 
                              bg="gray.800" borderColor="gray.600" placeholder="Wybierz bramkę..."
                              value={formData.targetGatewayId} onChange={e => setFormData({...formData, targetGatewayId: e.target.value})}
                              isDisabled={!formData.targetUserId}
                            >
                              {gateways.map(g => (
                                <option key={g.id} value={g.id} style={{color:'black'}}>{g.name} (ID: {g.id})</option>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Stack>
                    </Box>

                    <Button 
                      type="submit" 
                      colorScheme="green" 
                      size="lg" 
                      isLoading={loading}
                      loadingText="Wysyłanie..."
                      rightIcon={<FiSend />}
                    >
                      Wyślij Aktualizację
                    </Button>
                  </Stack>
                </form>
              </CardBody>
            </Card>
          </TabPanel>

          {/* --- PANEL 2: LISTA --- */}
          <TabPanel p={0}>
            <Stack spacing={4}>
              {loading && <Spinner color="orange.500" />}
              
              {!loading && updatesList.length === 0 && (
                <Text color="gray.500">Brak historii aktualizacji.</Text>
              )}

              {updatesList.map(update => (
                <Card key={update.id} bg="gray.800" borderColor="gray.700" borderWidth="1px" overflow="hidden">
                  <CardHeader bg="gray.700" py={2} px={4} display="flex" justifyContent="space-between" alignItems="center">
                    <Flex align="center" gap={3}>
                      <Heading size="sm" color="white">{update.title}</Heading>
                      <Badge colorScheme="blue">{update.version}</Badge>
                      <Badge colorScheme={getUrgencyColor(update.urgency)} variant="solid">
                        {update.urgency}
                      </Badge>
                    </Flex>
                    <Text fontSize="xs" color="gray.400">
                      Utworzono: {new Date(update.createdAt).toLocaleString()}
                    </Text>
                  </CardHeader>
                  
                  <CardBody p={0}>
                    <Table variant="simple" size="sm" colorScheme="whiteAlpha">
                      <Thead bg="gray.900">
                        <Tr>
                          <Th color="gray.400">Cel (Target ID)</Th>
                          <Th color="gray.400">Odbiorca (User)</Th>
                          <Th color="gray.400">Status</Th>
                          <Th color="gray.400">Próby odroczenia</Th>
                          <Th color="gray.400">Ostatnia akcja</Th>
                          <Th color="gray.400">Akcje Admina</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {update.assignments.map(assign => (
                          <Tr key={assign.id} _hover={{ bg: 'gray.700' }}>
                            <Td fontFamily="monospace">{assign.targetId}</Td>
                            <Td>{assign.recipientUserId}</Td>
                            <Td>{getStatusBadge(assign.status)}</Td>
                            <Td>{assign.deferCount}</Td>
                            <Td color="gray.400" fontSize="xs">
                              {assign.lastActionAt ? new Date(assign.lastActionAt).toLocaleString() : '-'}
                            </Td>
                            <Td>
                              {(assign.status === 'DEFERRED' || assign.status === 'FAILED') && (
                                <Button 
                                  size="xs" colorScheme="blue" variant="link" 
                                  onClick={() => handleResend(assign.id)}
                                >
                                  Wyślij ponownie
                                </Button>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              ))}
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
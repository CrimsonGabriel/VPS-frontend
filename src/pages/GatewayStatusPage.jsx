import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon,
  Table, Thead, Tbody, Tr, Th, Td,
  Badge, Tag, Tooltip, HStack, VStack, Progress,
  Card, CardBody, Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { FaServer, FaBatteryThreeQuarters, FaBatteryQuarter, FaUserFriends, FaClock } from 'react-icons/fa';

const API_URL = '/api/admin/gateways/status';

function GatewayStatusPage() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  // Pobieranie danych
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const response = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Błąd pobierania danych');
        const data = await response.json();
        setGateways(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  // Funkcja pomocnicza: Czy bramka jest online (np. widziana w ciągu ostatniej godziny)
  const isOnline = (lastSeenStr) => {
    if (!lastSeenStr) return false;
    const lastSeen = new Date(lastSeenStr);
    const now = new Date();
    const diffMinutes = (now - lastSeen) / 1000 / 60;
    return diffMinutes < 60; // Online jeśli widziana w ciągu 60 min
  };

  // Formatowanie daty
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Nigdy';
    return new Date(dateStr).toLocaleString('pl-PL', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" emptyColor="gray.200" display="block" mx="auto" mt={10} />;
  if (error) return <Alert status="error" mt={5}><AlertIcon />{error}</Alert>;

  // Statystyki
  const totalGateways = gateways.length;
  const onlineGateways = gateways.filter(g => isOnline(g.lastSeen)).length;
  const totalSensors = gateways.reduce((acc, g) => acc + g.sensors.length, 0);

  return (
    <Box p={5} bg="gray.900" minH="100vh" color="gray.100">
      <VStack align="start" spacing={6}>
        
        <Heading size="lg" color="blue.300">Monitorowanie Statusu Bramek</Heading>

        {/* KARTY STATYSTYK */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} w="100%">
            <Card bg="gray.800" borderLeft="4px solid" borderColor="blue.400">
                <CardBody>
                    <Stat>
                        <StatLabel color="gray.400">Wszystkie Bramki</StatLabel>
                        <StatNumber fontSize="3xl">{totalGateways}</StatNumber>
                        <StatHelpText>Zarejestrowane w systemie</StatHelpText>
                    </Stat>
                </CardBody>
            </Card>
            <Card bg="gray.800" borderLeft="4px solid" borderColor="green.400">
                <CardBody>
                    <Stat>
                        <StatLabel color="gray.400">Bramki Online</StatLabel>
                        <StatNumber fontSize="3xl" color="green.300">{onlineGateways}</StatNumber>
                        <StatHelpText>Aktywne w ostatniej godzinie</StatHelpText>
                    </Stat>
                </CardBody>
            </Card>
            <Card bg="gray.800" borderLeft="4px solid" borderColor="purple.400">
                <CardBody>
                    <Stat>
                        <StatLabel color="gray.400">Łącznie Czujników</StatLabel>
                        <StatNumber fontSize="3xl">{totalSensors}</StatNumber>
                        <StatHelpText>Monitorowane urządzenia</StatHelpText>
                    </Stat>
                </CardBody>
            </Card>
        </SimpleGrid>

        {/* TABELA DANYCH */}
        <Box overflowX="auto" w="100%" bg="gray.800" borderRadius="lg" boxShadow="xl">
          <Table variant="simple" size="md">
            <Thead bg="gray.700">
              <Tr>
                <Th color="gray.300">Bramka / Właściciel</Th>
                <Th color="gray.300">Status</Th>
                <Th color="gray.300">Bateria Czujników</Th>
                <Th color="gray.300">Udostępniono</Th>
              </Tr>
            </Thead>
            <Tbody>
              {gateways.map((gateway) => {
                 const online = isOnline(gateway.lastSeen);
                 return (
                <Tr key={gateway.id} _hover={{ bg: "gray.750" }}>
                  {/* KOLUMNA 1: NAZWA I WŁAŚCICIEL */}
                  <Td>
                    <VStack align="start" spacing={0}>
                        <HStack>
                            <Box as={FaServer} color="blue.300" />
                            <Text fontWeight="bold" fontSize="md">{gateway.name}</Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">ID: {gateway.id} | Folder: {gateway.folder}</Text>
                        <Badge mt={1} colorScheme="orange" variant="subtle">{gateway.ownerEmail}</Badge>
                    </VStack>
                  </Td>

                  {/* KOLUMNA 2: STATUS I CZAS */}
                  <Td>
                    <VStack align="start" spacing={1}>
                        <Badge colorScheme={online ? "green" : "red"} fontSize="0.8em" px={2} py={1} borderRadius="full">
                            {online ? "ONLINE" : "OFFLINE"}
                        </Badge>
                        <HStack fontSize="xs" color="gray.400">
                            <Box as={FaClock} />
                            <Text>{formatDate(gateway.lastSeen)}</Text>
                        </HStack>
                        {/* Opcjonalnie: wyświetlenie raw statusu z bazy */}
                        {gateway.status && gateway.status !== 'ONLINE' && gateway.status !== 'OFFLINE' && (
                           <Text fontSize="xs" color="gray.500">Raw: {gateway.status}</Text> 
                        )}
                    </VStack>
                  </Td>

                  {/* KOLUMNA 3: CZUJNIKI I BATERIE */}
                  <Td>
                    {gateway.sensors.length === 0 ? (
                        <Text fontSize="sm" color="gray.500">Brak czujników</Text>
                    ) : (
                        <SimpleGrid columns={2} spacing={2}>
                            {gateway.sensors.map((sensor, idx) => (
                                <Tooltip key={idx} label={`${sensor.name} (${sensor.type})`} hasArrow placement='top'>
                                    <HStack bg="gray.900" p={1} borderRadius="md" spacing={2} w="fit-content">
                                        {/* Ikona baterii zależna od poziomu */}
                                        <Box 
                                            as={sensor.batteryLevel < 20 ? FaBatteryQuarter : FaBatteryThreeQuarters} 
                                            color={sensor.batteryLevel < 20 ? "red.400" : sensor.batteryLevel < 50 ? "yellow.400" : "green.400"} 
                                        />
                                        <Text fontSize="xs" fontWeight="bold">{sensor.batteryLevel}%</Text>
                                    </HStack>
                                </Tooltip>
                            ))}
                        </SimpleGrid>
                    )}
                  </Td>

                  {/* KOLUMNA 4: UDOSTĘPNIENIA */}
                  <Td>
                    {gateway.sharedWith.length === 0 ? (
                        <Text fontSize="sm" color="gray.500" fontStyle="italic">Prywatna</Text>
                    ) : (
                        <VStack align="start" spacing={1}>
                            {gateway.sharedWith.map((user, idx) => (
                                <Tag key={idx} size="sm" colorScheme="cyan" borderRadius="full">
                                    <Box as={FaUserFriends} mr={1} />
                                    {user.email} ({user.permissionLevel})
                                </Tag>
                            ))}
                        </VStack>
                    )}
                  </Td>
                </Tr>
              )})}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
}

export default GatewayStatusPage;
// 💾 src/pages/UsersPage.jsx

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription,
  VStack, List, ListItem, Tag, Button, HStack, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, FormControl, FormLabel, Input, Checkbox, Icon, Divider, 
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaUserPlus, FaLock, FaUnlock, FaSave, FaBroom, FaCheck, FaTimes } from 'react-icons/fa';
import { WarningIcon, TimeIcon, BellIcon } from '@chakra-ui/icons';

// Endpointy
const API_URL = '/api/admin/users';
const DELETE_HISTORY_URL = '/api/data/history/delete';
const RETENTION_URL = '/api/admin/retention';
const RETENTION_REQ_URL = '/api/admin/retention/request';
const RETENTION_DECISION_URL = '/api/admin/retention/decision';

// --- Komponent Formularza (Twój oryginalny styl) ---
const UserForm = ({ initialData, isOpen, onClose, fetchUsers }) => {
    const toast = useToast();
    const { getToken } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '', 
        isAdmin: false,
        enabled: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                email: initialData.email || '',
                name: initialData.name || '',
                password: '',
                isAdmin: initialData.role === 'ADMIN' || false,
                enabled: initialData.enabled !== undefined ? initialData.enabled : true,
            });
        } else {
            setFormData({ email: '', name: '', password: '', isAdmin: false, enabled: true });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = getToken();

        if (!initialData && !formData.password) {
            toast({ title: 'Błąd', description: 'Hasło wymagane', status: 'warning' });
            setLoading(false); return;
        }
        if (!formData.email) {
            toast({ title: 'Błąd', description: 'Email wymagany', status: 'warning' });
            setLoading(false); return;
        }

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData ? `${API_URL}/${initialData.id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error(await response.text());

            toast({ title: 'Sukces', status: 'success', description: `Użytkownik ${formData.email} zapisany.` });
            fetchUsers();
            onClose(); 
        } catch (err) {
            toast({ title: 'Błąd operacji', description: err.message, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{initialData ? 'Edytuj Użytkownika' : 'Dodaj Użytkownika'}</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit}>
                    <ModalBody pb={6}>
                        <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <Input name="email" value={formData.email} onChange={handleChange} isDisabled={!!initialData} />
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel>Imię/Nazwa</FormLabel>
                            <Input name="name" value={formData.name} onChange={handleChange} />
                        </FormControl>
                        <FormControl mt={4} isRequired={!initialData}>
                            <FormLabel>Hasło</FormLabel>
                            <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={initialData ? 'Zostaw puste, aby nie zmieniać' : ''} />
                        </FormControl>
                        <FormControl mt={6} p={3} borderWidth="1px" borderRadius="md" borderColor={formData.enabled ? "green.500" : "red.500"}>
                            <Checkbox name="enabled" isChecked={formData.enabled} onChange={handleChange} colorScheme="green" size="lg">
                                <Text fontWeight="bold" ml={2}>{formData.enabled ? "Konto Aktywne (Może się logować)" : "Konto ZABLOKOWANE"}</Text>
                            </Checkbox>
                        </FormControl>
                        <FormControl mt={4}>
                            <Checkbox name="isAdmin" isChecked={formData.isAdmin} onChange={handleChange} colorScheme="purple" isDisabled={initialData?.email === 'admin'}>
                                Rola Administratora (ADMIN)
                            </Checkbox>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} type="submit" isLoading={loading}>Zapisz</Button>
                        <Button onClick={onClose}>Anuluj</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

// --- Główny Komponent Strony ---
function UsersPage() {
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // --- RETENTION STATE ---
  const [retentionDays, setRetentionDays] = useState('');
  const [maxRecords, setMaxRecords] = useState('');
  const [savingRetention, setSavingRetention] = useState(false);
  const [cleaningNow, setCleaningNow] = useState(false);
  const [pendingReq, setPendingReq] = useState(null); // { status, reqDays, reqSize }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);

  const { getToken, isAuthenticated, loading: authLoading, logout, isAdmin } = useAuth();
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true); 
    try {
      const token = getToken();
      if (!token) { logout(); return; }
      const response = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error(`Błąd pobierania: ${response.status}`);
      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [getToken, logout]);

  // --- RETENTION LOGIC ---
  const fetchRetentionData = useCallback(async () => {
      if (!isAdmin) return;
      const token = getToken();
      try {
          // 1. Ustawienia
          const resSettings = await fetch(RETENTION_URL, { headers: { 'Authorization': `Bearer ${token}` } });
          if (resSettings.ok) {
              const data = await resSettings.json();
              setRetentionDays(data.retentionDays || '');
              setMaxRecords(data.maxRecords || '');
          }
          // 2. Wnioski
          const resReq = await fetch(RETENTION_REQ_URL, { headers: { 'Authorization': `Bearer ${token}` } });
          if (resReq.ok) {
              const reqData = await resReq.json();
              if (reqData.status === 'PENDING') setPendingReq(reqData);
              else setPendingReq(null);
          }
      } catch (e) { console.error(e); }
  }, [isAdmin, getToken]);

  const handleDecision = async (decision) => {
      const token = getToken();
      try {
          const res = await fetch(RETENTION_DECISION_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ decision })
          });
          if (res.ok) {
              toast({ title: decision === 'ACCEPT' ? "Zatwierdzono" : "Odrzucono", status: decision === 'ACCEPT' ? "success" : "info" });
              fetchRetentionData();
          }
      } catch(e) { toast({ title: "Błąd", status: "error" }); }
  };

  const saveRetention = async () => {
      setSavingRetention(true);
      const token = getToken();
      try {
          const payload = {
              retentionDays: retentionDays === '' ? null : parseInt(retentionDays),
              maxRecords: maxRecords === '' ? null : parseInt(maxRecords)
          };
          await fetch(RETENTION_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(payload)
          });
          toast({ title: "Zapisano konfigurację", status: "success" });
      } catch (e) { toast({ title: "Błąd", status: "error" }); }
      finally { setSavingRetention(false); }
  };

  const handleRunCleanup = async () => {
      if(!window.confirm("Uruchomić teraz?")) return;
      setCleaningNow(true);
      const token = getToken();
      try {
          await fetch(`${RETENTION_URL}/run`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
          toast({ title: "Uruchomiono w tle", status: "info" });
      } catch(e) { toast({ title: "Błąd", status: "error" }); }
      finally { setCleaningNow(false); }
  };

  // --- USER MANAGEMENT LOGIC ---
  const handleOpenEdit = (user) => { setEditingUser(user); setIsModalOpen(true); };
  const handleOpenCreate = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleClose = () => { setIsModalOpen(false); setEditingUser(null); };
  
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Usunąć użytkownika?")) return;
    const token = getToken();
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 204) { 
            toast({ title: 'Usunięto', status: 'success' });
            fetchUsers();
        }
    } catch (err) {
        toast({ title: 'Błąd', description: err.message, status: 'error' });
    }
  };

  const handleDeleteHistory = async () => {
    if (!window.confirm("USUNĄĆ CAŁĄ HISTORIĘ CZUJNIKÓW? TEGO NIE DA SIĘ COFNĄĆ!")) return;
    setIsDeletingHistory(true);
    const token = getToken();
    try {
        const response = await fetch(DELETE_HISTORY_URL, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Błąd serwera");
        toast({ title: "Historia usunięta", status: "success" });
    } catch (error) {
        toast({ title: "Błąd", description: error.message, status: "error" });
    } finally {
        setIsDeletingHistory(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
        fetchUsers();
        if (isAdmin) fetchRetentionData();
    } else if (!authLoading && !isAuthenticated) {
        setLoading(false);
    }
  }, [isAuthenticated, authLoading, isAdmin, fetchUsers, fetchRetentionData]); 

  if (authLoading) return <div>Weryfikacja...</div>;
  if (loading && !users) return <Spinner size="xl" />;
  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="gray.800">
      <Heading size="lg" mb={4}>Zarządzanie Użytkownikami</Heading>
      
      <Button colorScheme="green" leftIcon={<FaUserPlus />} mb={4} onClick={handleOpenCreate}>
        Dodaj Użytkownika
      </Button>

      {/* ⭐️ LISTA UŻYTKOWNIKÓW (PRZYWRÓCONY ORYGINALNY STYL) ⭐️ */}
      <List spacing={3}>
        {(users || []).map(user => (
            <ListItem 
              key={user.id} p={3} 
              bg={user.enabled ? "gray.700" : "red.900"} 
              borderRadius="md" display="flex" flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent="space-between" alignItems="center"
              opacity={user.enabled ? 1 : 0.9}
              borderLeft={user.enabled ? "5px solid #48BB78" : "5px solid #F56565"}
            >
              <HStack spacing={4} flex="1" width="100%">
                <Icon as={user.enabled ? FaUnlock : FaLock} color={user.enabled ? "green.400" : "red.200"} boxSize={6} />
                <VStack align="flex-start" spacing={0}>
                    <HStack>
                        <Text fontWeight="bold" fontSize="lg">{user.email}</Text>
                        {!user.enabled && <Tag size="sm" colorScheme="red" variant="solid">ZABLOKOWANY</Tag>}
                    </HStack>
                    <Text fontSize="sm" color="gray.400">{user.name || "(brak nazwy)"}</Text>
                </VStack>
              </HStack>

              <HStack spacing={3} mt={{ base: 2, sm: 0 }}>
                <Tag size="sm" colorScheme={user.role === 'ADMIN' ? 'purple' : 'blue'}>{user.role}</Tag>
                {user.twoFactorEnabled && <Tag size="sm" colorScheme="cyan">2FA</Tag>}
                <Button size="sm" leftIcon={<FaEdit />} onClick={() => handleOpenEdit(user)}>Edytuj</Button>
                <Button size="sm" colorScheme="red" variant="outline" leftIcon={<FaTrash />} onClick={() => handleDeleteUser(user.id)} isDisabled={user.email === 'admin'}>Usuń</Button>
              </HStack>
            </ListItem>
        ))}
      </List>
      
      {isAdmin && (
        <>
            <Divider my={8} borderColor="gray.600" />
            
            {/* ⚙️ NOWA SEKCJA: RETENTION POLICY ⚙️ */}
            <Box p={5} borderWidth="1px" borderRadius="md" borderColor="blue.500" bg="rgba(66, 153, 225, 0.05)">
                <HStack mb={4}>
                    <Icon as={TimeIcon} color="blue.300" />
                    <Heading size="md" color="blue.300">Automatyczne Czyszczenie (Retention Policy)</Heading>
                </HStack>

                {/* 🔔 POWIADOMIENIE O WNIOSKU Z ANDROIDA 🔔 */}
                {pendingReq && (
                    <Alert status='warning' variant='solid' borderRadius="md" mb={6} flexDirection="column" alignItems="center" justifyContent="center" textAlign="center">
                        <HStack mb={2}>
                            <BellIcon boxSize={6} />
                            <AlertTitle fontSize="lg">Oczekujący wniosek z Aplikacji Mobilnej</AlertTitle>
                        </HStack>
                        <AlertDescription maxWidth="sm">
                            Użytkownik proponuje zmianę ustawień:<br/>
                            <strong>Dni: {pendingReq.reqDays || 'Bez zmian'}</strong> | 
                            <strong> Limit: {pendingReq.reqSize || 'Bez zmian'}</strong>
                        </AlertDescription>
                        <HStack mt={4} spacing={4}>
                            <Button leftIcon={<FaCheck />} colorScheme="green" variant="solid" onClick={() => handleDecision('ACCEPT')}>
                                Akceptuj i Zastosuj
                            </Button>
                            <Button leftIcon={<FaTimes />} colorScheme="red" variant="outline" bg="whiteAlpha.800" color="red.600" _hover={{ bg: 'white' }} onClick={() => handleDecision('REJECT')}>
                                Odrzuć
                            </Button>
                        </HStack>
                    </Alert>
                )}

                <Text fontSize="sm" color="gray.400" mb={4}>
                    Zdefiniuj zasady, aby baza danych nie rozrosła się w nieskończoność. 
                    Proces uruchamia się automatycznie codziennie o 3:00 w nocy.
                </Text>

                <VStack spacing={4} align="stretch">
                    <FormControl>
                        <FormLabel>Usuwaj rekordy starsze niż (dni):</FormLabel>
                        <HStack>
                            <NumberInput 
                                value={retentionDays} 
                                onChange={(val) => setRetentionDays(val)} 
                                min={1} 
                                allowMouseWheel
                                w="150px"
                            >
                                <NumberInputField placeholder="np. 90" />
                                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                            </NumberInput>
                            <Text fontSize="sm" color="gray.500">(Zostaw puste, aby wyłączyć)</Text>
                        </HStack>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Maksymalna liczba rekordów w tabeli (najnowsze):</FormLabel>
                        <HStack>
                            <NumberInput 
                                value={maxRecords} 
                                onChange={(val) => setMaxRecords(val)} 
                                min={1000} 
                                step={1000}
                                allowMouseWheel
                                w="150px"
                            >
                                <NumberInputField placeholder="np. 100000" />
                                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                            </NumberInput>
                            <Text fontSize="sm" color="gray.500">(Zostaw puste, aby wyłączyć)</Text>
                        </HStack>
                    </FormControl>

                    <HStack mt={2}>
                        <Button 
                            leftIcon={<FaSave />} 
                            colorScheme="blue" 
                            onClick={saveRetention} 
                            isLoading={savingRetention}
                        >
                            Zapisz Konfigurację
                        </Button>
                        <Button 
                            leftIcon={<FaBroom />} 
                            colorScheme="orange" 
                            variant="outline"
                            onClick={handleRunCleanup}
                            isLoading={cleaningNow}
                        >
                            Uruchom Teraz
                        </Button>
                    </HStack>
                </VStack>
            </Box>

            {/* ⚠️ PRZYWRÓCONA STREFA NIEBEZPIECZNA (ORYGINALNY WYGLĄD) ⚠️ */}
            <Box mt={10} p={5} borderWidth="1px" borderRadius="md" borderColor="red.600" bg="rgba(255, 0, 0, 0.05)">
                <Heading size="md" mb={2} color="red.300">Strefa Niebezpieczna</Heading>
                <Text fontSize="sm" mb={4} color="gray.400">
                    Poniższa akcja trwale usunie wszystkie odczyty z czujników zebrane w bazie danych. Użytkownicy i konfiguracja zostaną zachowane.
                </Text>
                <Button
                    colorScheme="red"
                    isLoading={isDeletingHistory}
                    onClick={handleDeleteHistory}
                    leftIcon={<WarningIcon />}
                >
                    Wyczyść całą historię pomiarów
                </Button>
            </Box>
        </>
      )}

      <UserForm initialData={editingUser} isOpen={isModalOpen} onClose={handleClose} fetchUsers={fetchUsers} />
    </Box>
  )
}

export default UsersPage;
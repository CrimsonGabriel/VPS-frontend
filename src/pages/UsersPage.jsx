// 💾 src/pages/UsersPage.jsx

import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon,
  VStack, List, ListItem, Tag, Button, HStack, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, FormControl, FormLabel, Input, Checkbox, Icon
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaUserPlus, FaLock, FaUnlock } from 'react-icons/fa';
import { WarningIcon } from '@chakra-ui/icons';

// Endpointy
const API_URL = '/api/admin/users';
const DELETE_HISTORY_URL = '/api/data/history/delete';

// --- Komponent Formularza (Dodawanie/Edytowanie) ---
const UserForm = ({ initialData, isOpen, onClose, fetchUsers }) => {
    const toast = useToast();
    const { getToken } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '', 
        isAdmin: false,
        enabled: true // Domyślnie nowe konto jest aktywne
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                email: initialData.email || '',
                name: initialData.name || '',
                password: '',
                isAdmin: initialData.role === 'ADMIN' || false,
                // Jeśli backend nie zwróci pola enabled, zakładamy true
                enabled: initialData.enabled !== undefined ? initialData.enabled : true,
            });
        } else {
            // Reset formularza dla nowego usera
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

        // Walidacja
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `Błąd HTTP: ${response.status}`);
            }

            toast({
                title: 'Sukces',
                description: `Użytkownik ${formData.email} zapisany.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

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
                            <Input 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder={initialData ? 'Zostaw puste, aby nie zmieniać' : ''}
                            />
                        </FormControl>

                        {/* ⭐️ Checkbox: Blokada konta ⭐️ */}
                        <FormControl mt={6} p={3} borderWidth="1px" borderRadius="md" borderColor={formData.enabled ? "green.500" : "red.500"}>
                            <Checkbox 
                                name="enabled" 
                                isChecked={formData.enabled} 
                                onChange={handleChange}
                                colorScheme="green"
                                size="lg"
                            >
                                <Text fontWeight="bold" ml={2}>
                                    {formData.enabled ? "Konto Aktywne (Może się logować)" : "Konto ZABLOKOWANE"}
                                </Text>
                            </Checkbox>
                        </FormControl>

                        <FormControl mt={4}>
                            <Checkbox 
                                name="isAdmin" 
                                isChecked={formData.isAdmin} 
                                onChange={handleChange}
                                colorScheme="purple"
                                isDisabled={initialData?.email === 'admin'} 
                            >
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


function UsersPage() {
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Stany Modala
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  // Stan usuwania historii
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);

  const { getToken, isAuthenticated, loading: authLoading, logout, isAdmin } = useAuth();
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true); 
    try {
      const token = getToken();
      if (!token) { logout(); return; }
      
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`Błąd pobierania: ${response.status}`);
      
      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (user) => { setEditingUser(user); setIsModalOpen(true); };
  const handleOpenCreate = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleClose = () => { setIsModalOpen(false); setEditingUser(null); };

  const handleDelete = async (id) => {
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
        } else {
            throw new Error("Błąd usuwania");
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
    if (!authLoading && isAuthenticated) fetchUsers();
    else if (!authLoading && !isAuthenticated) setLoading(false);
  }, [isAuthenticated, authLoading]); 

  if (authLoading) return <div>Weryfikacja...</div>;
  if (loading && !users) return <Spinner size="xl" />;
  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="gray.800">
      <Heading size="lg" mb={4}>Zarządzanie Użytkownikami</Heading>
      
      <Button colorScheme="green" leftIcon={<FaUserPlus />} mb={4} onClick={handleOpenCreate}>
        Dodaj Użytkownika
      </Button>

      <List spacing={3}>
        {(users || []).map(user => (
            <ListItem 
              key={user.id} 
              p={3} 
              // ⭐️ Wizualizacja blokady (Czerwone tło jeśli enabled=false)
              bg={user.enabled ? "gray.700" : "red.900"} 
              borderRadius="md" 
              display="flex" 
              flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent="space-between" 
              alignItems="center"
              opacity={user.enabled ? 1 : 0.9}
              borderLeft={user.enabled ? "5px solid #48BB78" : "5px solid #F56565"} // Zielony pasek vs Czerwony pasek
            >
              <HStack spacing={4} flex="1" width="100%">
                {/* ⭐️ Ikona kłódki */}
                <Icon 
                    as={user.enabled ? FaUnlock : FaLock} 
                    color={user.enabled ? "green.400" : "red.200"} 
                    boxSize={6} 
                />
                
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

                <Button size="sm" leftIcon={<FaEdit />} onClick={() => handleOpenEdit(user)}>
                    Edytuj
                </Button>
                <Button 
                    size="sm" 
                    colorScheme="red" 
                    variant="outline"
                    leftIcon={<FaTrash />} 
                    onClick={() => handleDelete(user.id)} 
                    isDisabled={user.email === 'admin'} 
                >
                    Usuń
                </Button>
              </HStack>
            </ListItem>
        ))}
      </List>
      
      {/* Sekcja Admina - Usuwanie Historii */}
      {isAdmin && (
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
      )}

      <UserForm 
          initialData={editingUser} 
          isOpen={isModalOpen} 
          onClose={handleClose} 
          fetchUsers={fetchUsers} 
      />
    </Box>
  )
}

export default UsersPage;
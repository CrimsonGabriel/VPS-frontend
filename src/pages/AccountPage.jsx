import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, VStack, HStack, Text, Heading, 
  Button, Input, FormControl, FormLabel, Avatar, 
  Divider, useToast, Spinner, Tabs, TabList, TabPanels, 
  Tab, TabPanel, Card, Badge, SimpleGrid, IconButton, 
  useColorModeValue, InputGroup, InputRightElement, 
  Image, useClipboard, Fade, Tooltip
} from '@chakra-ui/react';
// ⭐️ POPRAWKA: Usunięto ShieldIcon, używamy LockIcon do sekcji bezpieczeństwa
import { ViewIcon, ViewOffIcon, EditIcon, CheckIcon, CloseIcon, LockIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

// --- KONFIGURACJA ENDPOINTÓW ---
const API_USER_ME = '/api/user/me';
const API_USER_AVATAR = '/api/user/avatar';
const API_CHANGE_PASSWORD = '/api/user/change-password';
const API_2FA_STATUS = '/api/auth/2fa/status';
const API_2FA_SETUP = '/api/auth/2fa/setup';
const API_2FA_VERIFY = '/api/auth/2fa/verify';
const API_2FA_DISABLE = '/api/auth/2fa/disable';

export default function AccountPage() {
  const { getToken, refreshUserData, userAvatar, userRole, userEmail, logout } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  
  // --- STYLE (Chakra UI Theme) ---
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  // --- STANY: DANE PROFILOWE ---
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [tempName, setTempName] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- STANY: HASŁO ---
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // --- STANY: 2FA ---
  const [twoFaStatus, setTwoFaStatus] = useState(false);
  const [twoFaSetupData, setTwoFaSetupData] = useState(null); // { secret, otpauth_url }
  const [twoFaCode, setTwoFaCode] = useState('');
  const [isProcessingTwoFa, setIsProcessingTwoFa] = useState(false);
  
  // Hook do kopiowania sekretu 2FA
  const { onCopy, hasCopied } = useClipboard(twoFaSetupData?.secret || '');


  // =========================================================================
  // 1. INICJALIZACJA DANYCH
  // =========================================================================
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoadingData(true);
      const token = getToken();
      if(!token) { logout(); return; }

      try {
        // A. Pobierz dane użytkownika
        const userRes = await fetch(API_USER_ME, { headers: { 'Authorization': `Bearer ${token}` }});
        if (userRes.status === 401) { logout(); return; }
        
        if (userRes.ok) {
            const userData = await userRes.json();
            setProfileData({ 
                name: userData.name || '', 
                email: userData.email || userEmail 
            });
            setTempName(userData.name || '');
        }

        // B. Pobierz status 2FA
        const twoFaRes = await fetch(API_2FA_STATUS, { headers: { 'Authorization': `Bearer ${token}` }});
        if (twoFaRes.ok) {
            const twoFaData = await twoFaRes.json();
            setTwoFaStatus(twoFaData.is2FAEnabled);
        }

      } catch (e) {
        console.error("Błąd init:", e);
        toast({ title: "Błąd pobierania danych konta", status: "error", isClosable: true });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAllData();
  }, [getToken, userEmail, logout, toast]);


  // =========================================================================
  // 2. OBSŁUGA AVATARA (UPLOAD)
  // =========================================================================
  const handleAvatarClick = () => {
    fileInputRef.current.click(); 
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Walidacja rozmiaru (np. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return toast({ title: "Plik jest za duży (max 5MB)", status: "warning" });
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingAvatar(true);
    try {
        const res = await fetch(API_USER_AVATAR, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` },
            body: formData
        });

        if (!res.ok) throw new Error("Upload failed");
        
        await refreshUserData(); 
        
        toast({ title: "Avatar zaktualizowany!", status: "success" });
    } catch (err) {
        console.error(err);
        toast({ title: "Błąd aktualizacji avatara", description: "Sprawdź logi serwera.", status: "error" });
    } finally {
        setIsUploadingAvatar(false);
    }
  };


  // =========================================================================
  // 3. OBSŁUGA EDYCJI PROFILU (IMIĘ)
  // =========================================================================
  const handleSaveProfile = async () => {
    try {
        const res = await fetch(API_USER_ME, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: tempName })
        });
        
        if(!res.ok) throw new Error("Update failed");

        setProfileData(prev => ({ ...prev, name: tempName }));
        setIsEditingProfile(false);
        await refreshUserData();
        toast({ title: "Profil zaktualizowany", status: "success" });

    } catch (e) {
        toast({ title: "Nie udało się zapisać zmian", status: "error" });
    }
  };


  // =========================================================================
  // 4. OBSŁUGA ZMIANY HASŁA
  // =========================================================================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if(passwords.new !== passwords.confirm) {
        return toast({ title: "Nowe hasła muszą być identyczne", status: "warning" });
    }
    if(passwords.new.length < 8) {
        return toast({ title: "Hasło musi mieć min. 8 znaków", status: "warning" });
    }

    setIsChangingPass(true);
    try {
        const res = await fetch(API_CHANGE_PASSWORD, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${getToken()}` 
            },
            body: JSON.stringify({ 
                currentPassword: passwords.current, 
                newPassword: passwords.new 
            })
        });

        if(!res.ok) {
             const errData = await res.json().catch(() => ({}));
             throw new Error(errData.error || "Wystąpił błąd");
        }

        toast({ title: "Hasło zostało zmienione", status: "success" });
        setPasswords({ current: '', new: '', confirm: '' });
    } catch(e) {
        toast({ title: "Błąd zmiany hasła", description: e.message, status: "error" });
    } finally {
        setIsChangingPass(false);
    }
  };


  // =========================================================================
  // 5. OBSŁUGA 2FA (SETUP, VERIFY, DISABLE)
  // =========================================================================
  const setup2FA = async () => {
    setIsProcessingTwoFa(true);
    try {
        const res = await fetch(API_2FA_SETUP, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }});
        const data = await res.json();
        if(data.success) {
            setTwoFaSetupData(data);
        } else {
            throw new Error(data.message);
        }
    } catch(e) { 
        toast({ title: "Błąd inicjalizacji 2FA", status: "error" }); 
    } finally { 
        setIsProcessingTwoFa(false); 
    }
  };

  const finalize2FA = async (isDisableMode = false) => {
    if(!twoFaCode || twoFaCode.length !== 6) {
        return toast({ title: "Kod musi mieć 6 cyfr", status: "warning" });
    }

    setIsProcessingTwoFa(true);
    const endpoint = isDisableMode ? API_2FA_DISABLE : API_2FA_VERIFY;

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ totpCode: twoFaCode })
        });
        
        if(!res.ok) throw new Error("Nieprawidłowy kod");
        
        setTwoFaStatus(!isDisableMode);
        setTwoFaSetupData(null);
        setTwoFaCode('');
        
        toast({ 
            title: isDisableMode ? "2FA Wyłączone" : "2FA Włączone Pomyślnie", 
            status: isDisableMode ? "info" : "success" 
        });

    } catch(e) {
        toast({ title: "Weryfikacja nieudana", description: "Sprawdź kod i spróbuj ponownie.", status: "error" });
    } finally {
        setIsProcessingTwoFa(false);
    }
  };


  // =========================================================================
  // WIDOK (RENDER)
  // =========================================================================
  if (isLoadingData) {
      return (
          <Box h="80vh" display="flex" alignItems="center" justifyContent="center">
              <Spinner size="xl" color="blue.500" thickness="4px" />
          </Box>
      );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8}>
        
        {/* --- LEWA KOLUMNA: WIZYTÓWKA UŻYTKOWNIKA --- */}
        <Box gridColumn={{ base: "span 1", lg: "span 4" }}>
            <Card bg={cardBg} boxShadow="xl" borderRadius="2xl" border="1px" borderColor={borderColor} textAlign="center" py={10} px={6} position="relative" overflow="hidden">
                <Box position="absolute" top={0} left={0} right={0} h="120px" bgGradient="linear(to-br, blue.600, purple.600)" zIndex={0} />
                
                <Box position="relative" zIndex={1} mt={8}>
                    {/* AVATAR WRAPPER */}
                    <Box display="inline-block" position="relative">
                        <Avatar 
                            size="2xl" 
                            src={userAvatar}
                            name={profileData.name} 
                            border="4px solid white" 
                            boxShadow="lg"
                            bg="gray.300"
                            opacity={isUploadingAvatar ? 0.6 : 1}
                        />
                        <Tooltip label="Zmień zdjęcie profilowe" hasArrow>
                            <IconButton
                                aria-label="Upload Avatar"
                                icon={isUploadingAvatar ? <Spinner size="xs"/> : <EditIcon />}
                                size="sm"
                                colorScheme="blue"
                                rounded="full"
                                position="absolute"
                                bottom="5px"
                                right="5px"
                                shadow="md"
                                onClick={handleAvatarClick}
                                isDisabled={isUploadingAvatar}
                            />
                        </Tooltip>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                    </Box>

                    <Heading size="lg" mt={4} mb={1}>{profileData.name || 'Użytkownik'}</Heading>
                    <Text color={mutedColor} fontSize="sm">{profileData.email}</Text>

                    <HStack justify="center" mt={4} spacing={2}>
                        <Badge colorScheme={userRole === 'ROLE_ADMIN' ? 'red' : 'blue'} px={3} py={1} borderRadius="full" variant="subtle">
                            {userRole === 'ROLE_ADMIN' ? 'ADMINISTRATOR' : 'UŻYTKOWNIK'}
                        </Badge>
                        <Badge colorScheme={twoFaStatus ? 'green' : 'gray'} px={3} py={1} borderRadius="full" variant="subtle">
                            {twoFaStatus ? '2FA AKTYWNE' : '2FA BRAK'}
                        </Badge>
                    </HStack>
                </Box>
            </Card>
        </Box>

        {/* --- PRAWA KOLUMNA: ZAKŁADKI I FORMULARZE --- */}
        <Box gridColumn={{ base: "span 1", lg: "span 8" }}>
            <Card bg={cardBg} boxShadow="xl" borderRadius="2xl" border="1px" borderColor={borderColor} minH="550px">
                <Tabs variant="enclosed-colored" colorScheme="blue" isLazy p={2}>
                    
                    <TabList mb={2} px={4} pt={4}>
                        <Tab fontWeight="bold" _selected={{ color: 'blue.600', bg: 'blue.50', borderColor: 'blue.200' }}>
                            <EditIcon mr={2}/> Dane Osobowe
                        </Tab>
                        <Tab fontWeight="bold" _selected={{ color: 'blue.600', bg: 'blue.50', borderColor: 'blue.200' }}>
                            {/* POPRAWKA: Zastąpiono ShieldIcon przez LockIcon */}
                            <LockIcon mr={2} /> Bezpieczeństwo
                        </Tab>
                    </TabList>

                    <TabPanels px={4} pb={6}>
                        
                        {/* === ZAKŁADKA 1: DANE OSOBOWE === */}
                        <TabPanel>
                            <VStack spacing={6} align="stretch" maxW="lg">
                                <Heading size="md" mb={2}>Informacje Podstawowe</Heading>
                                <Text fontSize="sm" color="gray.500">Zarządzaj swoimi danymi widocznymi w systemie.</Text>

                                <Divider />

                                <FormControl>
                                    <FormLabel color="gray.500" fontSize="xs" textTransform="uppercase" fontWeight="bold">Adres E-mail (Login)</FormLabel>
                                    <Input 
                                        value={profileData.email} 
                                        isReadOnly 
                                        variant="filled" 
                                        bg="gray.100" 
                                        _dark={{ bg: 'gray.700' }} 
                                        cursor="not-allowed" 
                                        color="gray.500"
                                    />
                                    <Text fontSize="xs" mt={1} color="gray.400">Adresu e-mail nie można zmienić samodzielnie.</Text>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="bold">Nazwa Wyświetlana</FormLabel>
                                    <InputGroup size="md">
                                        <Input 
                                            value={isEditingProfile ? tempName : profileData.name} 
                                            onChange={(e) => setTempName(e.target.value)}
                                            isReadOnly={!isEditingProfile}
                                            variant={isEditingProfile ? "outline" : "filled"}
                                            focusBorderColor="blue.500"
                                            placeholder="Np. Jan Kowalski"
                                        />
                                        <InputRightElement width="6rem">
                                            {!isEditingProfile ? (
                                                <Button h="1.75rem" size="sm" onClick={() => setIsEditingProfile(true)}>
                                                    Edytuj
                                                </Button>
                                            ) : (
                                                <HStack spacing={1} mr={1}>
                                                    <IconButton size="xs" icon={<CheckIcon />} colorScheme="green" onClick={handleSaveProfile} aria-label="Zapisz"/>
                                                    <IconButton size="xs" icon={<CloseIcon />} onClick={() => { setIsEditingProfile(false); setTempName(profileData.name); }} aria-label="Anuluj"/>
                                                </HStack>
                                            )}
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>
                            </VStack>
                        </TabPanel>

                        {/* === ZAKŁADKA 2: BEZPIECZEŃSTWO === */}
                        <TabPanel>
                            <VStack spacing={8} align="stretch">
                                
                                {/* 1. ZMIANA HASŁA */}
                                <Box>
                                    <HStack mb={4}>
                                        <LockIcon color="blue.500" />
                                        <Heading size="md">Zmiana Hasła</Heading>
                                    </HStack>
                                    
                                    <form onSubmit={handleChangePassword}>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            <FormControl gridColumn={{ md: "span 2" }}>
                                                <FormLabel fontSize="sm">Obecne hasło</FormLabel>
                                                <Input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} bg={useColorModeValue("white", "gray.700")} />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel fontSize="sm">Nowe hasło</FormLabel>
                                                <InputGroup>
                                                    <Input type={showPass ? 'text' : 'password'} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} bg={useColorModeValue("white", "gray.700")} />
                                                    <InputRightElement>
                                                        <IconButton size="sm" variant="ghost" icon={showPass ? <ViewOffIcon /> : <ViewIcon />} onClick={() => setShowPass(!showPass)} />
                                                    </InputRightElement>
                                                </InputGroup>
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel fontSize="sm">Potwierdź hasło</FormLabel>
                                                <Input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} bg={useColorModeValue("white", "gray.700")} />
                                            </FormControl>
                                        </SimpleGrid>
                                        <Box mt={4} textAlign="right">
                                            <Button type="submit" colorScheme="blue" size="sm" isLoading={isChangingPass} disabled={!passwords.current || !passwords.new}>
                                                Zaktualizuj Hasło
                                            </Button>
                                        </Box>
                                    </form>
                                </Box>

                                <Divider />

                                {/* 2. ZARZĄDZANIE 2FA */}
                                <Box>
                                    <HStack mb={2} justify="space-between">
                                        <HStack>
                                            {/* POPRAWKA: Zastąpiono ShieldIcon przez LockIcon z odpowiednim kolorem */}
                                            <LockIcon color={twoFaStatus ? "green.500" : "orange.500"} />
                                            <Heading size="md">Weryfikacja Dwuetapowa (2FA)</Heading>
                                        </HStack>
                                        <Badge colorScheme={twoFaStatus ? 'green' : 'gray'}>
                                            {twoFaStatus ? 'STATUS: AKTYWNE' : 'STATUS: NIEAKTYWNE'}
                                        </Badge>
                                    </HStack>
                                    
                                    <Text color="gray.500" fontSize="sm" mb={4}>
                                        Zabezpiecz swoje konto dodatkowym kodem generowanym przez aplikację Google Authenticator.
                                    </Text>

                                    {/* PRZYCISK STARTOWY */}
                                    {!twoFaStatus && !twoFaSetupData && (
                                        <Button colorScheme="green" leftIcon={<CheckIcon />} onClick={setup2FA} isLoading={isProcessingTwoFa}>
                                            Skonfiguruj i Włącz 2FA
                                        </Button>
                                    )}

                                    {/* KONFIGURACJA (QR CODE) */}
                                    <Fade in={!!twoFaSetupData} unmountOnExit>
                                        <Box bg="blue.50" _dark={{ bg: 'blue.900' }} p={5} borderRadius="md" border="1px dashed" borderColor="blue.300">
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                {/* Krok 1: QR */}
                                                <VStack bg="white" p={4} borderRadius="md" _dark={{ bg: 'gray.800' }}>
                                                    <Text fontWeight="bold" fontSize="sm">1. Zeskanuj kod QR</Text>
                                                    <Image 
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(twoFaSetupData?.otpauth_url || '')}`} 
                                                        boxSize="160px" 
                                                        alt="QR Code"
                                                    />
                                                    <Text fontSize="xs" color="gray.500">Lub wpisz klucz ręcznie:</Text>
                                                    <HStack w="full">
                                                        <Input value={twoFaSetupData?.secret} isReadOnly fontFamily="monospace" size="xs" />
                                                        <Button size="xs" onClick={onCopy}>{hasCopied ? 'OK' : 'Kopiuj'}</Button>
                                                    </HStack>
                                                </VStack>

                                                {/* Krok 2: Weryfikacja */}
                                                <VStack align="start" justify="center">
                                                    <Text fontWeight="bold" fontSize="sm">2. Potwierdź kodem z aplikacji</Text>
                                                    <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.300' }}>
                                                        Wprowadź 6-cyfrowy kod, który wyświetlił się w Twojej aplikacji uwierzytelniającej.
                                                    </Text>
                                                    
                                                    <HStack w="full" mt={2}>
                                                        <Input 
                                                            placeholder="000 000" 
                                                            maxLength={6} 
                                                            textAlign="center" 
                                                            value={twoFaCode} 
                                                            onChange={e => setTwoFaCode(e.target.value.replace(/\D/,''))} 
                                                            bg="white" 
                                                            _dark={{ bg: 'gray.800' }} 
                                                            fontSize="lg"
                                                            letterSpacing="widest"
                                                        />
                                                    </HStack>
                                                    
                                                    <HStack w="full" mt={2}>
                                                        <Button colorScheme="green" width="full" onClick={() => finalize2FA(false)} isLoading={isProcessingTwoFa}>
                                                            Aktywuj 2FA
                                                        </Button>
                                                        <Button variant="ghost" width="full" onClick={() => { setTwoFaSetupData(null); setTwoFaCode(''); }}>
                                                            Anuluj
                                                        </Button>
                                                    </HStack>
                                                </VStack>
                                            </SimpleGrid>
                                        </Box>
                                    </Fade>

                                    {/* WYŁĄCZANIE 2FA */}
                                    {twoFaStatus && (
                                        <Box mt={4}>
                                            {!twoFaSetupData ? (
                                                <Button colorScheme="red" variant="outline" size="sm" onClick={() => setTwoFaSetupData({ disabling: true })}>
                                                    Chcę wyłączyć 2FA
                                                </Button>
                                            ) : (
                                                <VStack align="start" bg="red.50" _dark={{ bg: 'red.900' }} p={4} borderRadius="md" border="1px solid" borderColor="red.200">
                                                    <Text fontWeight="bold" color="red.600" _dark={{ color: 'red.200' }}>Potwierdź wyłączenie zabezpieczeń</Text>
                                                    <Text fontSize="sm" mb={2}>Aby wyłączyć 2FA, podaj aktualny kod z aplikacji.</Text>
                                                    
                                                    <HStack>
                                                        <Input 
                                                            placeholder="123456" 
                                                            maxLength={6} 
                                                            w="120px"
                                                            textAlign="center" 
                                                            value={twoFaCode} 
                                                            onChange={e => setTwoFaCode(e.target.value.replace(/\D/,''))} 
                                                            bg="white" 
                                                            _dark={{ bg: 'gray.800' }} 
                                                        />
                                                        <Button colorScheme="red" onClick={() => finalize2FA(true)} isLoading={isProcessingTwoFa}>
                                                            Wyłącz trwale
                                                        </Button>
                                                        <IconButton icon={<CloseIcon />} onClick={() => { setTwoFaSetupData(null); setTwoFaCode(''); }} aria-label="Anuluj" />
                                                    </HStack>
                                                </VStack>
                                            )}
                                        </Box>
                                    )}
                                </Box>

                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Card>
        </Box>
      </SimpleGrid>
    </Container>
  );
}
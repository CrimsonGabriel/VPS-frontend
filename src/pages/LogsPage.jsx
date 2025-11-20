// 💾 src/pages/LogsPage.jsx

import { useState, useEffect, useRef } from 'react';
import { 
    Box, Heading, Text, Button, HStack, Switch, 
    FormControl, FormLabel, useToast, Select, Badge 
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { RepeatIcon } from '@chakra-ui/icons';

const LogsPage = () => {
    // --- STANY ---
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    // Domyślnie 'out' (PM2 Output)
    const [logType, setLogType] = useState('out'); 

    const { getToken } = useAuth();
    const toast = useToast();
    const logsEndRef = useRef(null); // Referencja do przewijania

    // --- FUNKCJA POBIERANIA LOGÓW ---
    const fetchLogs = async () => {
        // Jeśli auto-refresh jest włączony, nie pokazujemy loadera na przycisku (żeby nie migał)
        if (!autoRefresh) setLoading(true);
        
        try {
            const token = getToken();
            // Dynamiczny URL zależny od wybranego typu (out, error, server)
            const res = await fetch(`/api/admin/logs?type=${logType}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error(`Błąd HTTP: ${res.status}`);
            }
            
            const data = await res.json();
            setLogs(data);
        } catch (err) {
            // Pokazujemy toast tylko jeśli to nie jest auto-refresh (żeby nie spamować błędami co 3s)
            if (!autoRefresh) {
                toast({ 
                    title: "Błąd pobierania logów", 
                    description: err.message, 
                    status: "error", 
                    duration: 3000 
                });
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- EFEKTY (UseEffect) ---

    // 1. Pobierz logi przy zmianie typu (np. z Error na Out)
    useEffect(() => {
        setLogs([]); // Czyścimy widok przed załadowaniem nowych
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logType]);

    // 2. Obsługa Auto-Refresh (Interval)
    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(fetchLogs, 3000); // Co 3 sekundy
        }
        return () => clearInterval(interval); // Sprzątanie po wyłączeniu/odmontowaniu
    }, [autoRefresh, logType]); // Reaguj też na zmianę typu loga

    // 3. Auto-scroll do dołu po załadowaniu nowych danych
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    // --- POMOCNICZE ---
    
    // Kolor badge'a w nagłówku
    const getBadgeColor = () => {
        if (logType === 'error') return 'red';
        if (logType === 'server') return 'purple';
        return 'green';
    }

    // Kolor tekstu w terminalu
    const getTerminalTextColor = () => {
        if (logType === 'error') return 'red.300';
        if (logType === 'server') return 'cyan.300'; // Logi Springa na jasnoniebiesko
        return 'green.400'; // Standardowy terminal
    }

    return (
        <Box p={4} h="calc(100vh - 100px)" display="flex" flexDirection="column">
            
            {/* --- PASEK KONTROLNY --- */}
            <HStack justifyContent="space-between" mb={4} flexWrap="wrap" gap={4} bg="gray.800" p={3} borderRadius="md">
                <HStack>
                    <Heading size="md" color="white">Logi Systemowe</Heading>
                    <Badge colorScheme={getBadgeColor()} fontSize="0.8em" p={1} borderRadius="md">
                        {logType.toUpperCase()}
                    </Badge>
                </HStack>

                <HStack spacing={4}>
                    {/* Wybór pliku */}
                    <Select 
                        w={{ base: "140px", md: "220px" }} 
                        value={logType} 
                        onChange={(e) => setLogType(e.target.value)}
                        bg="gray.700"
                        borderColor="gray.600"
                        color="white"
                        fontWeight="bold"
                        size="sm"
                    >
                        <option value="out">PM2 Output (Standard)</option>
                        <option value="error">PM2 Error (Błędy)</option>
                        <option value="server">Spring Server.log</option>
                    </Select>

                    {/* Przełącznik Auto-Refresh */}
                    <FormControl display='flex' alignItems='center' w="auto">
                        <FormLabel htmlFor='auto-refresh' mb='0' fontSize="sm" color="gray.400" cursor="pointer">
                            Live (3s)
                        </FormLabel>
                        <Switch 
                            id='auto-refresh' 
                            colorScheme="green" 
                            isChecked={autoRefresh} 
                            onChange={() => setAutoRefresh(!autoRefresh)} 
                        />
                    </FormControl>
                    
                    {/* Przycisk ręcznego odświeżania */}
                    <Button 
                        leftIcon={<RepeatIcon />} 
                        onClick={fetchLogs} 
                        isLoading={loading}
                        colorScheme="blue"
                        size="sm"
                    >
                        Odśwież
                    </Button>
                </HStack>
            </HStack>

            {/* --- OKNO TERMINALA --- */}
            <Box 
                flex="1" 
                bg="black" 
                color={getTerminalTextColor()} 
                p={4} 
                borderRadius="md" 
                overflowY="auto" 
                fontFamily="'Consolas', 'Monaco', 'Courier New', monospace" // Czcionka monospace
                fontSize="sm"
                boxShadow="inset 0 0 20px #000"
                border="1px solid #333"
            >
                {logs.length === 0 && !loading && (
                    <Text color="gray.500" textAlign="center" mt={10}>
                        Brak logów do wyświetlenia lub plik jest pusty.
                    </Text>
                )}
                
                {logs.map((line, index) => (
                    <Text 
                        key={index} 
                        whiteSpace="pre-wrap" // Zachowaj formatowanie i łamanie linii
                        borderBottom="1px solid #111" 
                        _hover={{ bg: 'gray.900' }}
                        lineHeight="1.5"
                    >
                        {/* Numer linii (szary) */}
                        <Text as="span" color="gray.600" mr={3} userSelect="none" display="inline-block" w="40px" textAlign="right">
                            {index + 1} |
                        </Text>
                        {/* Treść linii */}
                        {line}
                    </Text>
                ))}
                {/* Pusty element do scrollowania */}
                <div ref={logsEndRef} />
            </Box>
        </Box>
    );
};

export default LogsPage;
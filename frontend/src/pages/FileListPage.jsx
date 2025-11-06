import React, { useState, useEffect } from 'react';
// Zmieniamy import z axios na useAuth
// import axios from 'axios'; 
import { useAuth } from '../context/AuthContext';

// Używamy fetch zamiast axios, aby ułatwić dodanie nagłówka Authorization
const API_LIST_URL = '/api/files'; 

function FileListPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth(); // ⭐️ UŻYCIE useAuth ⭐️

  const fetchFiles = async () => {
    setLoading(true);
    const token = getToken(); // ⭐️ POBIERZ TOKEN ⭐️

    // 🛑 Wymagane, jeśli endpoint jest chroniony
    if (!token) {
        console.warn("Brak tokena, nie można pobrać listy plików.");
        setLoading(false);
        return; 
    }

    try {
        // Zastępujemy axios.get(..) funkcją fetch(..)
        const response = await fetch(API_LIST_URL, {
            headers: {
                // ⭐️ DODAJ NAGŁÓWEK AUTORYZACYJNY ⭐️
                'Authorization': `Bearer ${token}`, 
            }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error(`Błąd autoryzacji (${response.status}). Upewnij się, że token jest ważny.`);
        }
        if (!response.ok) {
            throw new Error(`Błąd serwera: ${response.statusText}`);
        }

        const data = await response.json();
        setFiles(data); // Oczekujemy listy [FileRecord, FileRecord, ...]
    } catch (error) {
        console.error("Błąd pobierania listy plików:", error.message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []); // Pusta tablica = uruchom raz przy montowaniu

  // Funkcja pomocnicza do formatowania rozmiaru
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  if (loading) {
    return <div>Ładowanie listy plików...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Pliki na serwerze</h2>
      {files.length === 0 ? (
        <p>Brak plików na serwerze.</p>
      ) : (
        <table style={{ width: '100%', color: 'white' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Nazwa pliku</th>
              <th style={{ textAlign: 'left' }}>Typ</th>
              <th style={{ textAlign: 'left' }}>Rozmiar</th>
              <th style={{ textAlign: 'left' }}>Pobierz</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}>
                <td>{file.originalFileName}</td>
                <td>{file.contentType}</td>
                <td>{formatBytes(file.size)}</td>
                <td>
                  {/* Link do endpointu pobierania */}
                  <a 
                    href={`/api/files/download/${file.id}`} 
                    download={file.originalFileName} // Atrybut 'download' mówi przeglądarce, by pobrała
                  >
                    Pobierz
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FileListPage;
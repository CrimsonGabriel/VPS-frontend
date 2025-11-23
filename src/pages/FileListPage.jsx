// 💾 src/pages/FileListPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 

const API_LIST_URL = '/api/files'; 
const API_DELETE_URL = '/api/files'; 
const API_DOWNLOAD_URL = '/api/files/download'; // Bazowy URL do pobierania

function FileListPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, isAdmin } = useAuth(); 

  const fetchFiles = async () => {
    setLoading(true);
    const token = getToken();

    if (!token) {
        setLoading(false);
        return; 
    }

    try {
        const response = await fetch(API_LIST_URL, {
            headers: {
                'Authorization': `Bearer ${token}`, 
            }
        });
        if (response.ok) {
            const data = await response.json();
            setFiles(data); 
        }
    } catch (error) {
        console.error("Błąd pobierania listy plików:", error.message);
    } finally {
        setLoading(false);
    }
  };

  // ⭐️ NOWA FUNKCJA: Pobieranie z Tokenem ⭐️
  const handleDownload = async (fileId, fileName) => {
    const token = getToken();
    try {
        const response = await fetch(`${API_DOWNLOAD_URL}/${fileId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Klucz do sukcesu: Token w nagłówku
            }
        });

        if (!response.ok) {
            throw new Error(`Błąd pobierania: ${response.statusText}`);
        }

        // 1. Pobierz dane jako "Blob" (Binary Large Object)
        const blob = await response.blob();

        // 2. Stwórz tymczasowy link w pamięci przeglądarki
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // 3. Ustaw nazwę pliku i symuluj kliknięcie
        link.setAttribute('download', fileName); 
        document.body.appendChild(link);
        link.click();

        // 4. Posprzątaj
        link.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Download error:", error);
        alert("Nie udało się pobrać pliku. Sprawdź konsolę.");
    }
  };

  const deleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Usunąć plik ${fileName}?`)) return;
    
    const token = getToken();
    try {
        const response = await fetch(`${API_DELETE_URL}/${fileId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok || response.status === 204 || response.status === 404) { 
             alert(`Plik ${fileName} usunięty.`);
             fetchFiles(); 
        } else if (response.status === 403) {
            alert('Brak uprawnień (Tylko Admin).');
        } else {
             alert('Błąd serwera.');
        }
    } catch (error) {
        console.error(error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []); 

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  if (loading) return <div>Ładowanie...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Pliki na serwerze</h2>
      {files.length === 0 ? (
        <p>Brak plików.</p>
      ) : (
        <table style={{ width: '100%', color: 'white' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Nazwa</th>
              <th style={{ textAlign: 'left' }}>Typ</th>
              <th style={{ textAlign: 'left' }}>Rozmiar</th>
              <th style={{ textAlign: 'left' }}>Akcja</th>
              {isAdmin && <th style={{ textAlign: 'left' }}>Usuń</th>} 
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}>
                <td>{file.originalFileName}</td>
                <td>{file.contentType}</td>
                <td>{formatBytes(file.size)}</td>
                <td>
                  {/* ⭐️ ZAMIANA LINKU NA PRZYCISK Z FUNKCJĄ JS ⭐️ */}
                  <button 
                    onClick={() => handleDownload(file.id, file.originalFileName)}
                    style={{ 
                        background: '#4CAF50', color: 'white', border: 'none', 
                        padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' 
                    }}
                  >
                    Pobierz
                  </button>
                </td>
                {isAdmin && (
                  <td>
                    <button 
                        onClick={() => deleteFile(file.id, file.originalFileName)}
                        style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      Usuń
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FileListPage;
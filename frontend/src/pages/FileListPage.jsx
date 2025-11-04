import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileListPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pobieramy listę plików z backendu
    axios.get('/api/files')
      .then(response => {
        // Oczekujemy listy [FileRecord, FileRecord, ...]
        setFiles(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Błąd pobierania listy plików:', error);
        setLoading(false);
      });
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

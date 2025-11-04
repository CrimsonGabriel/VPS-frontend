import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

// Prosty styl dla strefy upuszczania
const dropzoneStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px',
  borderWidth: 2,
  borderRadius: 5,
  borderColor: '#666',
  borderStyle: 'dashed',
  backgroundColor: '#333',
  color: '#eee',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

function FileUploadPage() {

  const onDrop = useCallback(acceptedFiles => {
    // Robimy to dla każdego pliku, jeśli pozwalasz na multi-upload
    acceptedFiles.forEach(file => {
      
      // Musimy użyć FormData, aby wysłać plik
      const formData = new FormData();
      formData.append('file', file); // 'file' musi pasować do @RequestParam("file")

      // Wysyłamy plik do Spring Boota
      axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        console.log(response.data);
        alert('Plik wgrany pomyślnie!');
      })
      .catch(error => {
        console.error('Błąd wysyłania pliku:', error);
        alert('Błąd wysyłania pliku.');
      });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div style={{ padding: '20px' }}>
      <h2>Wyślij plik na serwer</h2>
      <div {...getRootProps({ style: dropzoneStyle })}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Upuść pliki tutaj ...</p> :
            <p>Przeciągnij i upuść pliki tutaj, albo kliknij aby wybrać pliki</p>
        }
      </div>
    </div>
  );
}

export default FileUploadPage;

import { Routes, Route } from 'react-router-dom';

// Import komponentów
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import StatusIpPage from './pages/StatusIpPage'; 
import UsersPage from './pages/UsersPage';
import ApiTestPage from './pages/ApiTestPage';
import GlobalLayout from './components/GlobalLayout'; // <-- Kluczowy import
import ForbiddenPage from './pages/ForbiddenPage';
import FileUploadPage from './pages/FileUploadPage.jsx';
import FileListPage from './pages/FileListPage.jsx';
function App() {
  return (
    <Routes>
      {/* GlobalLayout MUSI być na zewnątrz wszystkich tras */}
      <Route element={<GlobalLayout />}> 

        {/* Trasy publiczne */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
	<Route path="/forbidden" element={<ForbiddenPage />} />

        {/* Trasy chronione */}
        <Route element={<ProtectedRoute />}>
          <Route path="/status-ip" element={<StatusIpPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/api-test" element={<ApiTestPage />} />
	  <Route path="/upload" element={<FileUploadPage />} />
    	  <Route path="/files" element={<FileListPage />} />
        </Route>
        
      </Route>
    </Routes>
  );
}

export default App;

import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Profile from './components/Profile';
import ViewResourcePage from './components/ViewResourcePage';

function AuthPage({ setToken }) {
  const [view, setView] = useState('login');
  return view === 'login'
    ? <LoginForm setToken={setToken} switchToRegister={() => setView('register')} />
    : <RegisterForm setToken={setToken} switchToLogin={() => setView('login')} />;
}

// --- Main App Component ---
function App() {
  const [access_token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);

  const handleLogout = useCallback(() => {
    const extensionId = "cplcbeblglebccamhkldndffcbdmnlol";
    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(
        extensionId,
        { type: 'SET_TOKEN', token: null },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Could not send logout message to extension:', chrome.runtime.lastError.message);
          } else {
            console.log('Logout message sent to extension:', response);
          }
        });
    }
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (access_token) {
        const extensionId = "cplcbeblglebccamhkldndffcbdmnlol";
        if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage(
            extensionId,
            { type: 'SET_TOKEN', token: access_token },
            (response) => {
              if (chrome.runtime.lastError) {
                console.warn('Could not send message to extension:', chrome.runtime.lastError.message);
              } else {
                console.log('Response from extension:', response);
              }
            });
        }

        try {
          const response = await fetch('/api/profile', {
            headers: { 'Authorization': `Bearer ${access_token}` },
          });
          if (!response.ok) throw new Error('Could not fetch profile.');
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error(error);
          handleLogout();
        }
      }
    };
    fetchUserProfile();
  }, [access_token, handleLogout]);

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/login" element={
            access_token && user ? <Navigate to="/profile" /> : <AuthPage setToken={setToken} />
          } />
          <Route path="/profile" element={
            access_token && user ? <Profile user={user} handleLogout={handleLogout} /> : <Navigate to="/login" />
          } />
          <Route path="/resource/:resourceId" element={
            access_token && user ? <ViewResourcePage /> : <Navigate to="/login" />
          } />
          {/* Default route */}
          <Route path="*" element={
            access_token && user ? <Navigate to="/profile" /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

import { useState, useEffect, useCallback } from 'react'
import './App.css'
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

// --- Main App Component ---
function App() {
  const [access_token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');

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

  if (access_token && user) {
    return (
      <div className="App">
        <header>
          <h1>Welcome, {user.user.username}!</h1>
        </header>
        <main>
          <h2>Your Profile</h2>
          <p>Email: {user.user.email || 'Not provided'}</p>
          <button onClick={handleLogout}>Logout</button>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <h1>Welcome to NetJam</h1>
      </header>
      <main>
        {view === 'login' ? (
          <LoginForm setToken={setToken} switchToRegister={() => setView('register')} />
        ) : (
          <RegisterForm setToken={setToken} switchToLogin={() => setView('login')} />
        )}
      </main>
    </div>
  )
}

export default App

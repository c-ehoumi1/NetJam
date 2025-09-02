import { useState, useEffect, useCallback } from 'react'
import './App.css'

// --- Login Form Component ---
function LoginForm({ setToken, switchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      localStorage.setItem('access_token', data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={switchToRegister}>Don't have an account? Register</button>
    </div>
  );
}

// --- Register Form Component ---
function RegisterForm({ setToken, switchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      // Automatically log in by setting the token upon successful registration
      localStorage.setItem('access_token', data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={switchToLogin}>Already have an account? Login</button>
    </div>
  );
}

// --- Main App Component ---
function App() {
  // Initialize token from localStorage
  const [access_token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login' or 'register'

  const handleLogout = useCallback(() => {
    // --- Inform Chrome Extension of logout ---
    const extensionId = "cplcbeblglebccamhkldndffcbdmnlol";
    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(
        extensionId,
        { type: 'SET_TOKEN', token: null }, // Send null token on logout
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
        // --- Send token to Chrome Extension ---
        const extensionId = "cplcbeblglebccamhkldndffcbdmnlol";
        if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage(
            extensionId,
            { type: 'SET_TOKEN', token: access_token },
            (response) => {
              if (chrome.runtime.lastError) {
                // This can happen if the extension is not installed or disabled.
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
          // If token is invalid, log out the user
          handleLogout();
        }
      }
    };
    fetchUserProfile();
  }, [access_token, handleLogout]);

  // If we have a token and user info, show the profile
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

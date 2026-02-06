import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../config/api.js';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        API.LOGIN,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      console.log("Login API Called");
      console.log('Login response:', response.data);


      const { token, role } = response.data;

      localStorage.setItem('token', token);
      // Optional: store role too (used in some dashboards)
      localStorage.setItem('role', role);

      const normalized = (role || '').toUpperCase().trim();

      if (normalized === 'CUSTOMER') {
        navigate('/customer-dashboard', { replace: true });
      } else if (normalized === 'ADMIN') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        setError('Unknown role received from server');
      }
    } catch (err) {
      const msg = err.response?.data?.message
        || err.message
        || 'Login failed – server connection problem';
      setError(msg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>CloudRetail</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              autoComplete="current-password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a1a1a',
  },
  subtitle: {
    margin: '0 0 32px',
    color: '#666',
    fontSize: '15px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#444',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
    },
  },
  button: {
    marginTop: '12px',
    padding: '14px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  error: {
    color: '#e63946',
    fontSize: '14px',
    background: '#ffebee',
    padding: '12px',
    borderRadius: '8px',
    marginTop: '8px',
  },
  footer: {
    marginTop: '24px',
    color: '#666',
    fontSize: '14px',
  },
  link: {
    color: '#667eea',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

export default Login;
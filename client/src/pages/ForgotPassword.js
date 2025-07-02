import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import '../App.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { darkMode, toggleDarkMode } = useAuthContext();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className={`forgot-password-page${darkMode ? ' dark' : ''}`} style={{ minHeight: '100vh', background: darkMode ? '#181a1b' : '#f7fafc', color: darkMode ? '#e2e8f0' : '#23272f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <button
        className={`dark-toggle${darkMode ? ' active' : ''}`}
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
        style={{ position: 'absolute', top: 20, right: 20 }}
      >
        {darkMode ? '🌙' : '☀️'}
      </button>
      <div style={{ background: darkMode ? '#23272f' : '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: 320, maxWidth: '90%' }}>
        <h2 style={{ marginBottom: 16 }}>Forgot Password</h2>
        {submitted ? (
          <div style={{ color: darkMode ? '#8faaff' : '#4caf50', fontWeight: 500 }}>
            If an account with that email exists, a password reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: 8 }}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 6,
                border: `1px solid ${error ? '#e57373' : '#ccc'}`,
                marginBottom: 12,
                background: darkMode ? '#181a1b' : '#fff',
                color: darkMode ? '#e2e8f0' : '#23272f',
                outline: 'none',
                fontSize: 16
              }}
              autoFocus
            />
            {error && <div style={{ color: '#e57373', marginBottom: 12 }}>{error}</div>}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 6,
                border: 'none',
                background: darkMode ? '#8faaff' : '#667eea',
                color: darkMode ? '#23272f' : '#fff',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 
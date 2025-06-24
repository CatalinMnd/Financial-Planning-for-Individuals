import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ isAuthenticated, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => document.body.classList.contains('dark-mode'));

  console.log('Header render - isAuthenticated:', isAuthenticated, 'user:', user);

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDashboardDropdown = () => {
    setIsDashboardDropdownOpen(!isDashboardDropdownOpen);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsDashboardDropdownOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      return newMode;
    });
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">💰</span>
          <span className="logo-text">Financial Planner</span>
        </Link>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            <li><Link to="/" onClick={closeAllMenus}>Home</Link></li>
            {isAuthenticated ? (
              <>
                <li className="dropdown-container">
                  <button 
                    className="dropdown-trigger"
                    onClick={toggleDashboardDropdown}
                    onMouseEnter={() => setIsDashboardDropdownOpen(true)}
                  >
                    Dashboard
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  <ul className={`dropdown-menu ${isDashboardDropdownOpen ? 'dropdown-open' : ''}`}
                      onMouseLeave={() => setIsDashboardDropdownOpen(false)}>
                    <li><Link to="/dashboard" onClick={closeAllMenus}>Overview</Link></li>
                    <li><Link to="/income" onClick={closeAllMenus}>Income</Link></li>
                    <li><Link to="/expenses" onClick={closeAllMenus}>Expenses</Link></li>
                    <li><Link to="/analytics" onClick={closeAllMenus}>Analytics</Link></li>
                  </ul>
                </li>
                <li><Link to="/profile" onClick={closeAllMenus}>Profile</Link></li>
                <li><Link to="/about" onClick={closeAllMenus}>About</Link></li>
                <li><Link to="/contact" onClick={closeAllMenus}>Contact</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/about" onClick={closeAllMenus}>About</Link></li>
                <li><Link to="/contact" onClick={closeAllMenus}>Contact</Link></li>
              </>
            )}
          </ul>
        </nav>

        <div className="auth-section">
          {/* Dark mode toggle */}
          <button
            className={`btn btn-secondary dark-toggle${darkMode ? ' active' : ''}`}
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ marginRight: 12 }}
          >
            <span className="dark-toggle-icon" aria-hidden="true">
              {darkMode ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              )}
            </span>
          </button>
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">Welcome, {user?.firstname}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>
    </header>
  );
};

export default Header; 
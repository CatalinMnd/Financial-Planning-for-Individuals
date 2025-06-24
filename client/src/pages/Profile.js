import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import './Profile.css';

const Profile = () => {
  const { user, logout, setUser } = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    defaultCurrency: 'USD',
  });

  // Password change form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Account settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    monthlyReports: true,
    securityAlerts: true,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize profile data with current user info
    setProfileData({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      defaultCurrency: user.defaultCurrency || 'USD',
    });

    // Note: Settings are initialized with default values since we removed backend settings routes
  }, [user, navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateProfileForm = () => {
    if (!profileData.firstname.trim()) {
      setMessage({ type: 'error', text: 'First name is required' });
      return false;
    }
    if (!profileData.lastname.trim()) {
      setMessage({ type: 'error', text: 'Last name is required' });
      return false;
    }
    if (!profileData.email) {
      setMessage({ type: 'error', text: 'Email is required' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      setMessage({ type: 'error', text: 'Email is invalid' });
      return false;
    }
    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return false;
    }
    if (!passwordData.newPassword) {
      setMessage({ type: 'error', text: 'New password is required' });
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return false;
    }
    return true;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstname: profileData.firstname.trim(),
          lastname: profileData.lastname.trim(),
          email: profileData.email,
          defaultCurrency: profileData.defaultCurrency,
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Check if email was changed
        const emailChanged = user.email !== profileData.email;
        
        if (emailChanged) {
          setMessage({ type: 'success', text: 'Profile updated successfully! You will be logged out due to email change.' });
          // Log out the user after a short delay
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
        } else {
          setMessage({ type: 'success', text: 'Profile updated successfully!' });
          // Update local storage and AuthContext state directly
          const updatedUser = { ...user, ...data, defaultCurrency: data.defaultCurrency };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          // Update AuthContext state without page reload
          if (setUser) {
            setUser(updatedUser);
          }
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating password' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Simulate API call delay
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setLoading(false);
    }, 1000);

    // Note: No actual API call is made since we removed the settings backend routes
    // The settings are only stored locally in the component state
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Account deleted successfully' });
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message || 'Failed to delete account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while deleting account' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">��</span>
            Profile Info
          </button>
          <button 
            className={`tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <span className="tab-icon">🔒</span>
            Change Password
          </button>
          <button 
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="tab-icon">⚙️</span>
            Settings
          </button>
          <button 
            className={`tab ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => setActiveTab('danger')}
          >
            <span className="tab-icon">⚠️</span>
            Danger Zone
          </button>
        </div>

        <div className="profile-content">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstname">First Name</label>
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      value={profileData.firstname}
                      onChange={handleProfileChange}
                      placeholder="Enter your first name"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastname">Last Name</label>
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={profileData.lastname}
                      onChange={handleProfileChange}
                      placeholder="Enter your last name"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="defaultCurrency">Default Currency</label>
                  <select
                    id="defaultCurrency"
                    name="defaultCurrency"
                    value={profileData.defaultCurrency}
                    onChange={handleProfileChange}
                    disabled={loading}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="RON">RON - Romanian Leu</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? <Loading size="small" text="" /> : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="tab-content">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordUpdate} className="profile-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? <Loading size="small" text="" /> : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2>Account Settings</h2>
              <div className="settings-form">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Email Notifications</h3>
                    <p>Receive email notifications for important account updates</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleSettingsChange}
                      disabled={loading}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Monthly Reports</h3>
                    <p>Get monthly financial reports sent to your email</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="monthlyReports"
                      checked={settings.monthlyReports}
                      onChange={handleSettingsChange}
                      disabled={loading}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Security Alerts</h3>
                    <p>Receive alerts for suspicious account activity</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="securityAlerts"
                      checked={settings.securityAlerts}
                      onChange={handleSettingsChange}
                      disabled={loading}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <button 
                  onClick={handleSettingsUpdate}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? <Loading size="small" text="" /> : 'Save Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="tab-content">
              <h2>Danger Zone</h2>
              <div className="danger-zone">
                <div className="danger-item">
                  <div className="danger-info">
                    <h3>Delete Account</h3>
                    <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    {loading ? <Loading size="small" text="" /> : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 
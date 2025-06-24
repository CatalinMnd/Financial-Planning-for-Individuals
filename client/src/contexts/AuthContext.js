import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      console.log('AuthContext: Checking authentication on app load...');
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('AuthContext: Stored token:', storedToken ? 'exists' : 'not found');
      console.log('AuthContext: Stored user:', storedUser ? 'exists' : 'not found');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          console.log('AuthContext: Authentication restored from localStorage');
        } catch (error) {
          console.error('AuthContext: Error parsing stored user data:', error);
          logout();
        }
      } else {
        console.log('AuthContext: No stored authentication data found');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Login attempt for:', email);
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('AuthContext: Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        isAdmin: data.isAdmin,
      }));

      setToken(data.token);
      setUser({
        _id: data._id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        isAdmin: data.isAdmin,
      });
      setIsAuthenticated(true);
      
      console.log('AuthContext: Login successful, user set:', {
        _id: data._id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        isAdmin: data.isAdmin,
      });

      return { success: true, user: data };
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return { success: true, user: data };
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    getAuthHeaders,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
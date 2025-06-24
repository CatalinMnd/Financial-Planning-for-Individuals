import { useState, useEffect, useRef } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(false);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      console.log('Checking authentication on app load...');
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Stored token:', storedToken ? 'exists' : 'not found');
      console.log('Stored user:', storedUser ? 'exists' : 'not found');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          console.log('Authentication restored from localStorage');
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          if (isMounted.current) {
            logout();
          }
        }
      } else {
        console.log('No stored authentication data found');
      }
      setLoading(false);
      isMounted.current = true;
    };

    checkAuth();
  }, []); // Empty dependency array to run only once

  const login = async (email, password) => {
    try {
      console.log('Login attempt for:', email);
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

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
      
      console.log('Login successful, user set:', {
        _id: data._id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        isAdmin: data.isAdmin,
      });

      return { success: true, user: data };
    } catch (error) {
      console.error('Login error:', error);
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
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
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

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    getAuthHeaders,
  };
};

export default useAuth; 
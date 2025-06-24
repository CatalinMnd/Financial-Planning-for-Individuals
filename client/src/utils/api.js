const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// API functions for different endpoints
export const api = {
  // User endpoints
  login: (credentials) => apiCall('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => apiCall('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // Income endpoints
  getIncome: (token, page = 1, limit = 10) => apiCall(`/income?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  createIncome: (token, incomeData) => apiCall('/income', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(incomeData),
  }),

  updateIncome: (token, id, incomeData) => apiCall(`/income/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(incomeData),
  }),

  deleteIncome: (token, id) => apiCall(`/income/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  getIncomeById: (token, id) => apiCall(`/income/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  // Expense endpoints
  getExpenses: (token, page = 1, limit = 10) => apiCall(`/expenses?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  createExpense: (token, expenseData) => apiCall('/expenses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(expenseData),
  }),

  updateExpense: (token, id, expenseData) => apiCall(`/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(expenseData),
  }),

  deleteExpense: (token, id) => apiCall(`/expenses/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  getExpenseById: (token, id) => apiCall(`/expenses/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),
};

// Utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Exchange rate utility (exchangerate-api.com, user API key)
export const getExchangeRates = async (base = 'USD') => {
  const cacheKey = `exchangeRates_${base}`;
  const cache = localStorage.getItem(cacheKey);
  const now = Date.now();

  if (cache) {
    const { timestamp, rates } = JSON.parse(cache);
    // Use cached rates if less than 12 hours old
    if (now - timestamp < 12 * 60 * 60 * 1000) {
      return rates;
    }
  }

  // Fetch from exchangerate-api.com
  const apiKey = '9ca8d7a664b0897ca1205089';
  const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`);
  const data = await response.json();
  if (data && data.result === 'success' && data.conversion_rates) {
    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, rates: data.conversion_rates }));
    return data.conversion_rates;
  }
  throw new Error('Failed to fetch exchange rates');
};

export default api; 
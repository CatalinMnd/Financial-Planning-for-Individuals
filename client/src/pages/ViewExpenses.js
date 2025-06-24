import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import './ViewExpenses.css';
import { getExchangeRates } from '../utils/api';

const ViewExpenses = () => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [itemsPerPage] = useState(10);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [conversionError, setConversionError] = useState('');
  const [convertedStats, setConvertedStats] = useState(null);

  const fetchExpenseData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/expenses?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Expense data:', data);
        
        setExpenseData(data.expense?.docs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalExpenses(data.expense?.docs?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0);
      } else {
        setError('Failed to load expense data');
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expense data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    fetchExpenseData();
  }, [isAuthenticated, user, navigate, currentPage, fetchExpenseData]);

  // Fetch exchange rates and convert stats
  useEffect(() => {
    const fetchRatesAndConvert = async () => {
      if (!user?.defaultCurrency) return;
      try {
        const rates = await getExchangeRates(user.defaultCurrency);
        setExchangeRates(rates);
        // Convert stats
        let totalExpenses = 0;
        expenseData.forEach((t) => {
          const rate = t.currency && rates[t.currency] ? rates[t.currency] : 1;
          totalExpenses += t.amount / rate;
        });
        setConvertedStats({
          totalExpenses,
          totalEntries: expenseData.length,
          avgPerEntry: expenseData.length > 0 ? totalExpenses / expenseData.length : 0
        });
        setConversionError('');
      } catch (err) {
        setConversionError('Currency conversion unavailable. Showing original values.');
        setConvertedStats(null);
      }
    };
    if (expenseData.length > 0) {
      fetchRatesAndConvert();
    }
  }, [expenseData, user?.defaultCurrency]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense entry?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh the data
        fetchExpenseData();
      } else {
        setError('Failed to delete expense entry');
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense entry');
    }
  };

  const handleEdit = (id) => {
    // Navigate to edit page (you can implement this later)
    navigate(`/expenses/edit/${id}`);
  };

  const filteredExpenses = expenseData.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount, currency = user?.defaultCurrency || 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="view-expenses">
      <div className="page-header">
        <div className="header-content">
          <h1>Expenses Overview</h1>
          <p>Manage and track all your expenses</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary" 
            onClick={() => navigate('/expenses/add')}
          >
            Add New Expense
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="expense-stats">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p className="stat-amount">{formatCurrency(convertedStats ? convertedStats.totalExpenses : totalExpenses, user?.defaultCurrency || 'USD')}</p>
        </div>
        <div className="stat-card">
          <h3>Total Entries</h3>
          <p className="stat-count">{convertedStats ? convertedStats.totalEntries : expenseData.length}</p>
        </div>
        <div className="stat-card">
          <h3>Average per Entry</h3>
          <p className="stat-amount">
            {formatCurrency(convertedStats ? convertedStats.avgPerEntry : (expenseData.length > 0 ? totalExpenses / expenseData.length : 0), user?.defaultCurrency || 'USD')}
          </p>
        </div>
      </div>
      {user?.defaultCurrency && (
        <div className="info-bubble">
          {conversionError
            ? conversionError
            : convertedStats && 'All stats are shown in your default currency (' + user.defaultCurrency + ') using latest exchange rates.'}
        </div>
      )}

      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search expenses by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading expense data...</p>
        </div>
      ) : (
        <>
          {filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Expenses Found</h3>
              <p>
                {searchTerm 
                  ? `No expense entries match "${searchTerm}"` 
                  : "You haven't added any expense entries yet."
                }
              </p>
              <button 
                className="btn-primary" 
                onClick={() => navigate('/expenses/add')}
              >
                Add Your First Expense
              </button>
            </div>
          ) : (
            <div className="expense-list">
              {filteredExpenses.map((expense) => (
                <div key={expense._id} className="expense-item">
                  <div className="expense-icon">📉</div>
                  <div className="expense-details">
                    <h3 className="expense-title">{expense.title}</h3>
                    <p className="expense-description">{expense.description}</p>
                    <span className="expense-date">
                      {formatDate(expense.createdAt || expense.updatedAt)}
                    </span>
                  </div>
                  <div className="expense-amount">
                    <span className="amount-negative">{formatCurrency(expense.amount, expense.currency)}</span>
                  </div>
                  <div className="expense-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(expense._id)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(expense._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewExpenses; 
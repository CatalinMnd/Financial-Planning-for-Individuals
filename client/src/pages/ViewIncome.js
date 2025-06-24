import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import './ViewIncome.css';
import { getExchangeRates } from '../utils/api';

const ViewIncome = () => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIncome, setTotalIncome] = useState(0);
  const [itemsPerPage] = useState(10);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [conversionError, setConversionError] = useState('');
  const [convertedStats, setConvertedStats] = useState(null);

  const fetchIncomeData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/income?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Income data:', data);
        
        setIncomeData(data.income?.docs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalIncome(data.income?.docs?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0);
      } else {
        setError('Failed to load income data');
      }
    } catch (err) {
      console.error('Error fetching income:', err);
      setError('Failed to load income data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    fetchIncomeData();
  }, [isAuthenticated, user, navigate, currentPage, fetchIncomeData]);

  // Fetch exchange rates and convert stats
  useEffect(() => {
    const fetchRatesAndConvert = async () => {
      if (!user?.defaultCurrency) return;
      try {
        const rates = await getExchangeRates(user.defaultCurrency);
        setExchangeRates(rates);
        // Convert stats
        let totalIncome = 0;
        incomeData.forEach((t) => {
          const rate = t.currency && rates[t.currency] ? rates[t.currency] : 1;
          totalIncome += t.amount / rate;
        });
        setConvertedStats({
          totalIncome,
          totalEntries: incomeData.length,
          avgPerEntry: incomeData.length > 0 ? totalIncome / incomeData.length : 0
        });
        setConversionError('');
      } catch (err) {
        setConversionError('Currency conversion unavailable. Showing original values.');
        setConvertedStats(null);
      }
    };
    if (incomeData.length > 0) {
      fetchRatesAndConvert();
    }
  }, [incomeData, user?.defaultCurrency]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/income/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh the data
        fetchIncomeData();
      } else {
        setError('Failed to delete income entry');
      }
    } catch (err) {
      console.error('Error deleting income:', err);
      setError('Failed to delete income entry');
    }
  };

  const handleEdit = (id) => {
    // Navigate to edit page (you can implement this later)
    navigate(`/income/edit/${id}`);
  };

  const filteredIncome = incomeData.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount, currency = 'USD') => {
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
    <div className="view-income">
      <div className="page-header">
        <div className="header-content">
          <h1>Income Overview</h1>
          <p>Manage and track all your income sources</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary" 
            onClick={() => navigate('/income/add')}
          >
            Add New Income
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

      <div className="income-stats">
        <div className="stat-card">
          <h3>Total Income</h3>
          <p className="stat-amount">{formatCurrency(convertedStats ? convertedStats.totalIncome : totalIncome, user?.defaultCurrency || 'USD')}</p>
        </div>
        <div className="stat-card">
          <h3>Total Entries</h3>
          <p className="stat-count">{convertedStats ? convertedStats.totalEntries : incomeData.length}</p>
        </div>
        <div className="stat-card">
          <h3>Average per Entry</h3>
          <p className="stat-amount">
            {formatCurrency(convertedStats ? convertedStats.avgPerEntry : (incomeData.length > 0 ? totalIncome / incomeData.length : 0), user?.defaultCurrency || 'USD')}
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
            placeholder="Search income by title or description..."
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
          <p>Loading income data...</p>
        </div>
      ) : (
        <>
          {filteredIncome.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <h3>No Income Found</h3>
              <p>
                {searchTerm 
                  ? `No income entries match "${searchTerm}"` 
                  : "You haven't added any income entries yet."
                }
              </p>
              <button 
                className="btn-primary" 
                onClick={() => navigate('/income/add')}
              >
                Add Your First Income
              </button>
            </div>
          ) : (
            <div className="income-list">
              {filteredIncome.map((income) => (
                <div key={income._id} className="income-item">
                  <div className="income-icon">📈</div>
                  <div className="income-details">
                    <h3 className="income-title">{income.title}</h3>
                    <p className="income-description">{income.description}</p>
                    <span className="income-date">
                      {formatDate(income.createdAt || income.updatedAt)}
                    </span>
                  </div>
                  <div className="income-amount">
                    <span className="amount-positive">{formatCurrency(income.amount, income.currency)}</span>
                  </div>
                  <div className="income-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(income._id)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(income._id)}
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

export default ViewIncome; 
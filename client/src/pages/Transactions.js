import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import './Transactions.css';
import { getExchangeRates } from '../utils/api';

const Transactions = () => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount', 'title'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [currentPage] = useState(1);
  const [totalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    totalTransactions: 0
  });
  const [exchangeRates, setExchangeRates] = useState(null);
  const [conversionError, setConversionError] = useState('');
  const [convertedStats, setConvertedStats] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch both income and expenses
      const [incomeResponse, expenseResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/income?page=${currentPage}&limit=${itemsPerPage}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:5000/api/expenses?page=${currentPage}&limit=${itemsPerPage}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (incomeResponse.ok && expenseResponse.ok) {
        const incomeData = await incomeResponse.json();
        const expenseData = await expenseResponse.json();
        
        console.log('Income data:', incomeData);
        console.log('Expense data:', expenseData);
        
        // Combine and format transactions
        const incomeTransactions = (incomeData.income?.docs || []).map(item => ({
          ...item,
          type: 'income',
          date: item.createdAt || item.updatedAt || new Date(),
          displayAmount: item.amount
        }));
        
        const expenseTransactions = (expenseData.expense?.docs || []).map(item => ({
          ...item,
          type: 'expense',
          date: item.createdAt || item.updatedAt || new Date(),
          displayAmount: -item.amount // Negative for expenses
        }));

        const allTransactions = [...incomeTransactions, ...expenseTransactions];
        
        // Calculate stats
        const totalIncome = incomeTransactions.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);
        
        setStats({
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          totalTransactions: allTransactions.length
        });
        
        setTransactions(allTransactions);
      } else {
        setError('Failed to load transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    fetchTransactions();
  }, [isAuthenticated, user, navigate, currentPage, fetchTransactions]);

  // Fetch exchange rates and convert stats
  useEffect(() => {
    const fetchRatesAndConvert = async () => {
      if (!user?.defaultCurrency) return;
      try {
        const rates = await getExchangeRates(user.defaultCurrency);
        setExchangeRates(rates);
        // Convert stats
        let totalIncome = 0;
        let totalExpenses = 0;
        transactions.forEach((t) => {
          const rate = t.currency && rates[t.currency] ? rates[t.currency] : 1;
          if (t.type === 'income') {
            totalIncome += t.amount / rate;
          } else {
            totalExpenses += t.amount / rate;
          }
        });
        setConvertedStats({
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          totalTransactions: transactions.length
        });
        setConversionError('');
      } catch (err) {
        setConversionError('Currency conversion unavailable. Showing original values.');
        setConvertedStats(null);
      }
    };
    if (transactions.length > 0) {
      fetchRatesAndConvert();
    }
  }, [transactions, user?.defaultCurrency]);

  // Filter and sort transactions
  const getFilteredAndSortedTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = Math.abs(a.displayAmount);
          bValue = Math.abs(b.displayAmount);
          break;
        case 'title':
          aValue = a.title?.toLowerCase();
          bValue = b.title?.toLowerCase();
          break;
        case 'date':
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredTransactions = getFilteredAndSortedTransactions();

  const formatCurrency = (amount, currency = user?.defaultCurrency || 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="transactions">
      <div className="page-header">
        <div className="header-content">
          <h1>All Transactions</h1>
          <p>View and manage all your financial transactions</p>
        </div>
        <div className="header-actions">
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

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Balance</h3>
            <p className={`stat-amount ${((convertedStats?.balance ?? stats.balance) >= 0) ? 'positive' : 'negative'}`}>
              {formatCurrency(convertedStats ? convertedStats.balance : stats.balance, user?.defaultCurrency || 'USD')}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Total Income</h3>
            <p className="stat-amount positive">{formatCurrency(convertedStats ? convertedStats.totalIncome : stats.totalIncome, user?.defaultCurrency || 'USD')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📉</div>
          <div className="stat-content">
            <h3>Total Expenses</h3>
            <p className="stat-amount negative">{formatCurrency(stats.totalExpenses, user?.defaultCurrency || 'USD')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Transactions</h3>
            <p className="stat-count">{stats.totalTransactions}</p>
          </div>
        </div>
      </div>

      {user?.defaultCurrency && (
        <div className="info-bubble">
          {conversionError
            ? conversionError
            : convertedStats && 'All stats are shown in your default currency (' + user.defaultCurrency + ') using latest exchange rates.'}
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-controls">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      ) : (
        <>
          {filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No Transactions Found</h3>
              <p>
                {searchTerm || filterType !== 'all'
                  ? 'No transactions match your current filters.'
                  : "You haven't added any transactions yet."
                }
              </p>
              <div className="empty-actions">
                <button 
                  className="btn-primary" 
                  onClick={() => navigate('/income/add')}
                >
                  Add Income
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => navigate('/expenses/add')}
                >
                  Add Expense
                </button>
              </div>
            </div>
          ) : (
            <div className="transactions-container">
              {/* Sortable Table Header */}
              <div className="table-header">
                <div className="header-cell" onClick={() => handleSort('date')}>
                  Date {getSortIcon('date')}
                </div>
                <div className="header-cell" onClick={() => handleSort('title')}>
                  Title {getSortIcon('title')}
                </div>
                <div className="header-cell">Description</div>
                <div className="header-cell" onClick={() => handleSort('amount')}>
                  Amount {getSortIcon('amount')}
                </div>
                <div className="header-cell">Type</div>
              </div>

              {/* Transactions List */}
              <div className="transactions-list">
                {filteredTransactions.map((transaction) => (
                  <div key={`${transaction.type}-${transaction._id}`} className={`transaction-item ${transaction.type}`}>
                    <div className="transaction-date">
                      {formatDate(transaction.date)}
                    </div>
                    <div className="transaction-title">
                      {transaction.title} {transaction.isRecurring && <span title="Recurring" className="recurring-icon">🔁</span>}
                    </div>
                    <div className="transaction-description">
                      {transaction.description}
                    </div>
                    <div className="transaction-amount">
                      <span className={`amount ${transaction.type === 'income' ? 'positive' : 'negative'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.displayAmount, transaction.currency)}
                      </span>
                    </div>
                    <div className="transaction-type">
                      <span className={`type-badge ${transaction.type}`}>
                        {transaction.type === 'income' ? '📈 Income' : '📉 Expense'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Results Summary */}
              <div className="results-summary">
                <p>Showing {filteredTransactions.length} of {stats.totalTransactions} transactions</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Transactions; 
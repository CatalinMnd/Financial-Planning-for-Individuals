import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import '../pages/Dashboard.css';
import { getExchangeRates } from '../utils/api';

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exchangeRates, setExchangeRates] = useState(null);
  const [conversionError, setConversionError] = useState('');
  const [convertedStats, setConvertedStats] = useState(null);

  useEffect(() => {
    console.log('Dashboard useEffect - user:', user, 'isAuthenticated:', isAuthenticated);
    
    // Add a small delay to ensure authentication state is properly set
    const timer = setTimeout(() => {
      if (!user || !isAuthenticated) {
        console.log('Redirecting to login - no user or not authenticated');
        navigate('/login');
        return;
      }
      fetchDashboardData();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, isAuthenticated, navigate]);

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
        if (Array.isArray(financialData.recentTransactions)) {
          financialData.recentTransactions.forEach((t) => {
            const rate = t.currency && rates[t.currency] ? rates[t.currency] : 1;
            if (t.type === 'income') {
              totalIncome += t.amount / rate;
            } else {
              totalExpenses += t.amount / rate;
            }
          });
        }
        // Fallback: if no transactions, use original totals
        if (totalIncome === 0 && totalExpenses === 0) {
          totalIncome = financialData.totalIncome;
          totalExpenses = financialData.totalExpenses;
        }
        setConvertedStats({
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses
        });
        setConversionError('');
      } catch (err) {
        setConversionError('Currency conversion unavailable. Showing original values.');
        setConvertedStats(null);
      }
    };
    if (financialData && (financialData.totalIncome !== 0 || financialData.totalExpenses !== 0)) {
      fetchRatesAndConvert();
    }
  }, [financialData, user?.defaultCurrency]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch income data
      const incomeResponse = await fetch('http://localhost:5000/api/income', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch expense data
      const expenseResponse = await fetch('http://localhost:5000/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (incomeResponse.ok && expenseResponse.ok) {
        const incomeData = await incomeResponse.json();
        const expenseData = await expenseResponse.json();
        
        console.log('Income data:', incomeData);
        console.log('Expense data:', expenseData);
        
        // Ensure we have arrays to work with
        const incomeArray = Array.isArray(incomeData.income?.docs) ? incomeData.income.docs : [];
        const expenseArray = Array.isArray(expenseData.expense?.docs) ? expenseData.expense.docs : [];
        
        const totalIncome = incomeArray.reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalExpenses = expenseArray.reduce((sum, item) => sum + (item.amount || 0), 0);
        
        // Debug: Log first item from each array to see available fields
        if (incomeArray.length > 0) {
          console.log('First income item fields:', Object.keys(incomeArray[0]));
          console.log('First income item:', incomeArray[0]);
        }
        if (expenseArray.length > 0) {
          console.log('First expense item fields:', Object.keys(expenseArray[0]));
          console.log('First expense item:', expenseArray[0]);
        }
        
        // Combine recent transactions
        const recentTransactions = [
          ...incomeArray.map(item => ({
            ...item,
            type: 'income',
            date: item.createdAt ? new Date(item.createdAt) : 
                  item.updatedAt ? new Date(item.updatedAt) : 
                  new Date() // fallback to current date
          })),
          ...expenseArray.map(item => ({
            ...item,
            type: 'expense',
            date: item.createdAt ? new Date(item.createdAt) : 
                  item.updatedAt ? new Date(item.updatedAt) : 
                  new Date() // fallback to current date
          }))
        ].sort((a, b) => b.date - a.date).slice(0, 5);

        setFinancialData({
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          recentTransactions
        });
      } else {
        console.error('Failed to fetch data:', { incomeResponse, expenseResponse });
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatCurrency = (amount, currency = user?.defaultCurrency || 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your financial dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'User'}!</h1>
          <p>Here's your financial overview</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate('/income/add')}>
            Add Income
          </button>
          <button className="btn-secondary" onClick={() => navigate('/expenses/add')}>
            Add Expense
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Financial Overview Cards */}
        <div className="financial-overview">
          <div className="card balance-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Current Balance</h3>
              <p className={`balance-amount ${((convertedStats?.balance ?? financialData.balance) >= 0) ? 'positive' : 'negative'}`}>
                {formatCurrency(convertedStats ? convertedStats.balance : financialData.balance, user?.defaultCurrency || 'USD')}
              </p>
            </div>
          </div>

          <div className="card income-card">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>Total Income</h3>
              <p className="amount positive">{formatCurrency(convertedStats ? convertedStats.totalIncome : financialData.totalIncome, user?.defaultCurrency || 'USD')}</p>
            </div>
          </div>

          <div className="card expense-card">
            <div className="card-icon">📉</div>
            <div className="card-content">
              <h3>Total Expenses</h3>
              <p className="amount negative">{formatCurrency(convertedStats ? convertedStats.totalExpenses : financialData.totalExpenses, user?.defaultCurrency || 'USD')}</p>
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

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/income')}>
              <span className="action-icon">➕</span>
              <span>View Income</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/expenses')}>
              <span className="action-icon">➖</span>
              <span>View Expenses</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/analytics')}>
              <span className="action-icon">📊</span>
              <span>Analytics</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/profile')}>
              <span className="action-icon">👤</span>
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="recent-transactions">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <button className="btn-link" onClick={() => navigate('/transactions')}>
              View All
            </button>
          </div>
          
          {financialData.recentTransactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet</p>
              <button className="btn-primary" onClick={() => navigate('/income/add')}>
                Add Your First Transaction
              </button>
            </div>
          ) : (
            <div className="transactions-list">
              {financialData.recentTransactions.map((transaction, index) => (
                <div key={index} className={`transaction-item ${transaction.type}`}>
                  <div className="transaction-icon">
                    {transaction.type === 'income' ? '📈' : '📉'}
                  </div>
                  <div className="transaction-details">
                    <h4>{transaction.title}</h4>
                    <p>{transaction.description}</p>
                    <span className="transaction-date">{formatDate(transaction.date)}</span>
                  </div>
                  <div className="transaction-amount">
                    <span className={`amount ${transaction.type === 'income' ? 'positive' : 'negative'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency || user?.defaultCurrency || 'USD')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Tips */}
        <div className="financial-tips">
          <h2>Financial Tips</h2>
          <div className="tips-list">
            <div className="tip-item">
              <h4>💡 Budget Planning</h4>
              <p>Track your expenses regularly to identify spending patterns and areas for improvement.</p>
            </div>
            <div className="tip-item">
              <h4>🎯 Goal Setting</h4>
              <p>Set specific financial goals and monitor your progress towards achieving them.</p>
            </div>
            <div className="tip-item">
              <h4>📊 Regular Reviews</h4>
              <p>Review your financial statements monthly to stay on track with your financial plan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import './Analytics.css';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { getExchangeRates } from '../utils/api';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const Analytics = () => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    income: [],
    expenses: [],
    monthlyData: [],
    topExpenses: [],
    topIncome: [],
    categoryBreakdown: [],
    trends: {
      income: [],
      expenses: []
    }
  });
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all', 'month', 'quarter', 'year'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [exchangeRates, setExchangeRates] = useState(null);
  const [conversionError, setConversionError] = useState('');
  const [convertedAnalytics, setConvertedAnalytics] = useState(null);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch both income and expenses
      const [incomeResponse, expenseResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/income?page=1&limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:5000/api/expenses?page=1&limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (incomeResponse.ok && expenseResponse.ok) {
        const incomeData = await incomeResponse.json();
        const expenseData = await expenseResponse.json();
        
        console.log('Analytics data:', { incomeData, expenseData });
        
        const income = incomeData.income?.docs || [];
        const expenses = expenseData.expense?.docs || [];
        
        // Process data for analytics
        const processedData = processAnalyticsData(income, expenses);
        setAnalyticsData(processedData);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedYear, selectedMonth]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    fetchAnalyticsData();
  }, [isAuthenticated, user, navigate, fetchAnalyticsData]);

  // Fetch exchange rates and convert all analytics data
  useEffect(() => {
    const convertAllAnalytics = async () => {
      if (!user?.defaultCurrency) return;
      try {
        const rates = await getExchangeRates(user.defaultCurrency);
        setExchangeRates(rates);
        // Convert all income and expenses to default currency
        const convertAmount = (item) => {
          const rate = item.currency && rates[item.currency] ? rates[item.currency] : 1;
          return { ...item, amount: item.amount / rate };
        };
        const income = analyticsData.income.map(convertAmount);
        const expenses = analyticsData.expenses.map(convertAmount);
        // Re-process analytics with converted data
        const processed = processAnalyticsData(income, expenses);
        setConvertedAnalytics(processed);
        setConversionError('');
      } catch (err) {
        setConversionError('Currency conversion unavailable. Showing original values.');
        setConvertedAnalytics(null);
      }
    };
    if (analyticsData.income.length > 0 || analyticsData.expenses.length > 0) {
      convertAllAnalytics();
    }
  }, [analyticsData, user?.defaultCurrency]);

  const processAnalyticsData = (income, expenses) => {
    // Filter data based on selected period
    const filteredIncome = filterDataByPeriod(income, selectedPeriod, selectedYear, selectedMonth);
    const filteredExpenses = filterDataByPeriod(expenses, selectedPeriod, selectedYear, selectedMonth);

    // Calculate monthly data
    const monthlyData = calculateMonthlyData(filteredIncome, filteredExpenses);
    
    // Get top expenses and income
    const topExpenses = getTopItems(filteredExpenses, 'expense', 5);
    const topIncome = getTopItems(filteredIncome, 'income', 5);
    
    // Calculate category breakdown
    const categoryBreakdown = calculateCategoryBreakdown(filteredExpenses);
    
    // Calculate trends
    const trends = calculateTrends(filteredIncome, filteredExpenses);

    return {
      income: filteredIncome,
      expenses: filteredExpenses,
      monthlyData,
      topExpenses,
      topIncome,
      categoryBreakdown,
      trends
    };
  };

  const filterDataByPeriod = (data, period, year, month) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return data.filter(item => {
      const itemDate = new Date(item.createdAt || item.updatedAt || new Date());
      
      switch (period) {
        case 'month':
          return itemDate.getFullYear() === year && itemDate.getMonth() === month;
        case 'quarter':
          const quarter = Math.floor(month / 3);
          const itemQuarter = Math.floor(itemDate.getMonth() / 3);
          return itemDate.getFullYear() === year && itemQuarter === quarter;
        case 'year':
          return itemDate.getFullYear() === year;
        default:
          return true; // 'all' - no filtering
      }
    });
  };

  const calculateMonthlyData = (income, expenses) => {
    const monthlyData = {};
    
    // Process income
    income.forEach(item => {
      const date = new Date(item.createdAt || item.updatedAt || new Date());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, balance: 0 };
      }
      monthlyData[monthKey].income += item.amount;
      monthlyData[monthKey].balance += item.amount;
    });
    
    // Process expenses
    expenses.forEach(item => {
      const date = new Date(item.createdAt || item.updatedAt || new Date());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, balance: 0 };
      }
      monthlyData[monthKey].expenses += item.amount;
      monthlyData[monthKey].balance -= item.amount;
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getTopItems = (data, type, limit) => {
    return data
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit)
      .map(item => ({
        ...item,
        type,
        date: new Date(item.createdAt || item.updatedAt || new Date())
      }));
  };

  const calculateCategoryBreakdown = (expenses) => {
    const categories = {};
    
    expenses.forEach(item => {
      // Use title as category for now (you can add a category field later)
      const category = item.title || 'Uncategorized';
      categories[category] = (categories[category] || 0) + item.amount;
    });
    
    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const calculateTrends = (income, expenses) => {
    // Calculate simple trends (you can make this more sophisticated)
    const incomeTrend = income.length > 0 ? 'increasing' : 'stable';
    const expenseTrend = expenses.length > 0 ? 'increasing' : 'stable';
    
    return { income: incomeTrend, expenses: expenseTrend };
  };

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

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getTotalIncome = () => {
    return analyticsData.income.reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalExpenses = () => {
    return analyticsData.expenses.reduce((sum, item) => sum + item.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getSavingsRate = () => {
    const income = getTotalIncome();
    if (income === 0) return 0;
    return ((getBalance() / income) * 100).toFixed(1);
  };

  // Prepare chart data
  const monthlyLabels = analyticsData.monthlyData.map(m => formatMonth(m.month));
  const incomeData = analyticsData.monthlyData.map(m => m.income);
  const expenseData = analyticsData.monthlyData.map(m => m.expenses);

  const monthlyTrendsData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102,126,234,0.2)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Expenses',
        data: expenseData,
        borderColor: '#e53e3e',
        backgroundColor: 'rgba(229,62,62,0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const categoryLabels = (analyticsData.categoryBreakdown || []).map(c => c.category);
  const categoryAmounts = (analyticsData.categoryBreakdown || []).map(c => c.amount);
  const categoryColors = [
    '#667eea', '#764ba2', '#e53e3e', '#f6ad55', '#38a169', '#319795', '#ecc94b', '#805ad5', '#f56565', '#718096'
  ];
  const categoryData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryAmounts,
        backgroundColor: categoryColors,
        borderWidth: 1,
      },
    ],
  };

  const recurringCount = analyticsData.income.filter(i => i.isRecurring).length + analyticsData.expenses.filter(e => e.isRecurring).length;
  const oneTimeCount = analyticsData.income.length + analyticsData.expenses.length - recurringCount;
  const recurringPieData = {
    labels: ['Recurring', 'One-Time'],
    datasets: [
      {
        data: [recurringCount, oneTimeCount],
        backgroundColor: ['#667eea', '#e2e8f0'],
        borderWidth: 1,
      },
    ],
  };

  const topIncomeLabels = analyticsData.topIncome.map(i => i.title);
  const topIncomeAmounts = analyticsData.topIncome.map(i => i.amount);
  const topIncomeData = {
    labels: topIncomeLabels,
    datasets: [
      {
        label: 'Top Income',
        data: topIncomeAmounts,
        backgroundColor: '#667eea',
      },
    ],
  };

  const topExpenseLabels = analyticsData.topExpenses.map(e => e.title);
  const topExpenseAmounts = analyticsData.topExpenses.map(e => e.amount);
  const topExpenseData = {
    labels: topExpenseLabels,
    datasets: [
      {
        label: 'Top Expenses',
        data: topExpenseAmounts,
        backgroundColor: '#e53e3e',
      },
    ],
  };

  // Use converted analytics if available
  const analytics = convertedAnalytics || analyticsData;

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="analytics">
      <div className="page-header">
        <div className="header-content">
          <h1>Financial Analytics</h1>
          <p>Comprehensive insights into your financial health</p>
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

      {/* Period Selector */}
      <div className="period-selector">
        <div className="selector-group">
          <label>Time Period:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="quarter">This Quarter</option>
            <option value="month">This Month</option>
          </select>
        </div>
        
        {selectedPeriod === 'year' && (
          <div className="selector-group">
            <label>Year:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="period-select"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
        
        {selectedPeriod === 'month' && (
          <>
            <div className="selector-group">
              <label>Year:</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="period-select"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="selector-group">
              <label>Month:</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="period-select"
              >
                {Array.from({ length: 12 }, (_, i) => i).map(month => (
                  <option key={month} value={month}>
                    {new Date(2024, month).toLocaleDateString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <h3>Total Balance</h3>
                <p className={`metric-value ${getBalance() >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(getBalance())}
                </p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-content">
                <h3>Total Income</h3>
                <p className="metric-value positive">{formatCurrency(getTotalIncome())}</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">📉</div>
              <div className="metric-content">
                <h3>Total Expenses</h3>
                <p className="metric-value negative">{formatCurrency(getTotalExpenses())}</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <h3>Savings Rate</h3>
                <p className="metric-value">{getSavingsRate()}%</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">🔁</div>
              <div className="metric-content">
                <h3>Recurring Transactions</h3>
                <p className="metric-value">{
                  analyticsData.income.filter(i => i.isRecurring).length + analyticsData.expenses.filter(e => e.isRecurring).length
                }</p>
              </div>
            </div>
          </div>

          {user?.defaultCurrency && (
            <div className="info-bubble">
              {conversionError
                ? conversionError
                : convertedAnalytics && 'All stats and charts are shown in your default currency (' + user.defaultCurrency + ') using latest exchange rates.'}
            </div>
          )}

          {/* Charts and Analysis */}
          <div className="analytics-grid">
            {/* Monthly Trends Line Chart */}
            <div className="chart-card">
              <h3>Monthly Trends</h3>
              <div className="chart-container">
                {analyticsData.monthlyData.length > 0 ? (
                  <Line data={monthlyTrendsData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                ) : (
                  <div className="no-data">No data available for selected period</div>
                )}
              </div>
            </div>

            {/* Expense Category Pie Chart */}
            <div className="chart-card">
              <h3>Expense Categories</h3>
              <div className="chart-container">
                {(analyticsData.categoryBreakdown || []).length > 0 ? (
                  <Pie data={categoryData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
                ) : (
                  <div className="no-data">No expenses in selected period</div>
                )}
              </div>
            </div>

            {/* Recurring vs. One-Time Pie Chart */}
            <div className="chart-card">
              <h3>Recurring vs. One-Time</h3>
              <div className="chart-container">
                <Pie data={recurringPieData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
              </div>
            </div>

            {/* Top Income Bar Chart */}
            <div className="chart-card">
              <h3>Top Income Sources</h3>
              <div className="chart-container">
                {analyticsData.topIncome.length > 0 ? (
                  <Bar data={topIncomeData} options={{ responsive: true, plugins: { legend: { display: false } }, indexAxis: 'y' }} />
                ) : (
                  <div className="no-data">No income in selected period</div>
                )}
              </div>
            </div>

            {/* Top Expenses Bar Chart */}
            <div className="chart-card">
              <h3>Top Expenses</h3>
              <div className="chart-container">
                {analyticsData.topExpenses.length > 0 ? (
                  <Bar data={topExpenseData} options={{ responsive: true, plugins: { legend: { display: false } }, indexAxis: 'y' }} />
                ) : (
                  <div className="no-data">No expenses in selected period</div>
                )}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="insights-section">
            <h3>Financial Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-icon">📊</div>
                <div className="insight-content">
                  <h4>Income Trend</h4>
                  <p>Your income is {analyticsData.trends.income} this period.</p>
                </div>
              </div>
              
              <div className="insight-card">
                <div className="insight-icon">💡</div>
                <div className="insight-content">
                  <h4>Spending Pattern</h4>
                  <p>Your expenses are {analyticsData.trends.expenses} this period.</p>
                </div>
              </div>
              
              <div className="insight-card">
                <div className="insight-icon">🎯</div>
                <div className="insight-content">
                  <h4>Savings Goal</h4>
                  <p>You're saving {getSavingsRate()}% of your income.</p>
                </div>
              </div>
              
              <div className="insight-card">
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <h4>Financial Health</h4>
                  <p>{getBalance() >= 0 ? 'Great job! You have a positive balance.' : 'Consider reducing expenses to improve your balance.'}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics; 
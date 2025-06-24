import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import './AddExpense.css';

const AddExpense = () => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: ''
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('monthly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currency, setCurrency] = useState(user?.defaultCurrency || 'USD');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }
    if (isRecurring) {
      if (!recurrenceInterval || recurrenceInterval < 1) {
        setError('Recurrence interval must be at least 1');
        return false;
      }
      if (recurringEndDate && new Date(recurringEndDate) <= new Date()) {
        setError('End date must be in the future');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const body = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        currency,
      };
      if (isRecurring) {
        body.isRecurring = true;
        body.recurrence = { type: recurrenceType, interval: parseInt(recurrenceInterval) };
        if (recurringEndDate) body.recurringEndDate = recurringEndDate;
      }

      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setSuccess('Expense added successfully!');
        setFormData({ title: '', description: '', amount: '' });
        setIsRecurring(false);
        setRecurrenceType('monthly');
        setRecurrenceInterval(1);
        setRecurringEndDate('');
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add expense');
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <div className="add-expense">
      <div className="form-container">
        <div className="form-header">
          <h1>Add Expense</h1>
          <p>Track your new expense</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label htmlFor="title">Expense Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Groceries, Rent, Utilities"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe this expense..."
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount ({currency}) *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="currency">Currency *</label>
            <select id="currency" name="currency" value={currency} onChange={handleCurrencyChange} required>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="RON">RON</option>
            </select>
          </div>

          {/* Recurring Transaction Section */}
          <div className="form-group recurring-group">
            <label>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
              />{' '}
              Make this a recurring transaction
            </label>
          </div>

          {isRecurring && (
            <div className="recurring-options">
              <div className="form-group inline-group">
                <label>Repeat every:</label>
                <input
                  type="number"
                  min="1"
                  value={recurrenceInterval}
                  onChange={e => setRecurrenceInterval(e.target.value)}
                  style={{ width: '60px', marginRight: '8px' }}
                  required
                />
                <select
                  value={recurrenceType}
                  onChange={e => setRecurrenceType(e.target.value)}
                  style={{ width: '120px' }}
                >
                  <option value="daily">Day(s)</option>
                  <option value="weekly">Week(s)</option>
                  <option value="monthly">Month(s)</option>
                  <option value="yearly">Year(s)</option>
                  <option value="custom">Custom (days)</option>
                </select>
              </div>
              <div className="form-group">
                <label>End date (optional):</label>
                <input
                  type="date"
                  value={recurringEndDate}
                  onChange={e => setRecurringEndDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>

        <div className="form-footer">
          <p>💡 Tip: Categorize your expenses to better understand your spending patterns</p>
        </div>
      </div>
    </div>
  );
};

export default AddExpense; 
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import './EditIncome.css';

const EditIncome = () => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: ''
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('monthly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currency, setCurrency] = useState('USD');

  const fetchIncomeData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/income/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const income = await response.json();
        console.log('Income data to edit:', income);
        
        setFormData({
          title: income.title || '',
          description: income.description || '',
          amount: income.amount || ''
        });
        setIsRecurring(!!income.isRecurring);
        setRecurrenceType(income.recurrence?.type || 'monthly');
        setRecurrenceInterval(income.recurrence?.interval || 1);
        setRecurringEndDate(income.recurringEndDate ? income.recurringEndDate.substring(0, 10) : '');
        setCurrency(income.currency || user?.defaultCurrency || 'USD');
      } else {
        setError('Failed to load income data');
      }
    } catch (err) {
      console.error('Error fetching income:', err);
      setError('Failed to load income data');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    fetchIncomeData();
  }, [isAuthenticated, user, navigate, id, fetchIncomeData]);

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
      setSaving(true);
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
      } else {
        body.isRecurring = false;
        body.recurrence = undefined;
        body.recurringEndDate = undefined;
      }
      const response = await fetch(`http://localhost:5000/api/income/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setSuccess('Income updated successfully!');
        
        // Redirect to income list after a short delay
        setTimeout(() => {
          navigate('/income');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update income');
      }
    } catch (err) {
      console.error('Error updating income:', err);
      setError('Failed to update income. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/income');
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="edit-income">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading income data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-income">
      <div className="form-container">
        <div className="form-header">
          <h1>Edit Income</h1>
          <p>Update your income information</p>
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

        <form onSubmit={handleSubmit} className="income-form">
          <div className="form-group">
            <label htmlFor="title">Income Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Salary, Freelance, Investment"
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
              placeholder="Describe this income source..."
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
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Income'}
            </button>
          </div>
        </form>

        <div className="form-footer">
          <p>💡 Tip: Make sure all information is accurate before saving</p>
        </div>
      </div>
    </div>
  );
};

export default EditIncome; 
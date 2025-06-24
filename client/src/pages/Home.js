import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuthContext();

  if (isAuthenticated) {
    return (
      <div className="home">
        {/* Welcome Section for Authenticated Users */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome back, <span className="highlight">{user?.firstname}</span>!
            </h1>
            <p className="hero-subtitle">
              Ready to continue managing your finances? Access your dashboard to track your progress and manage your financial goals.
            </p>
            <div className="hero-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
              <Link to="/income/add" className="btn btn-secondary">
                Add Income
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-graphic">
              <div className="chart-circle">
                <div className="chart-segment income"></div>
                <div className="chart-segment expense"></div>
                <div className="chart-segment savings"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions for Authenticated Users */}
        <section className="features">
          <div className="container">
            <h2 className="section-title">Quick Actions</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Add Income</h3>
                <p>Record your latest income sources and keep track of your earnings.</p>
                <Link to="/income/add" className="btn btn-primary">Add Income</Link>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h3>Add Expense</h3>
                <p>Log your expenses and categorize them for better financial tracking.</p>
                <Link to="/expenses/add" className="btn btn-primary">Add Expense</Link>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>View Analytics</h3>
                <p>Get insights into your spending patterns and financial health.</p>
                <Link to="/analytics" className="btn btn-primary">View Analytics</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h4>Financial Planning for Individuals</h4>
                <p>Empowering individuals to make better financial decisions.</p>
              </div>
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                  <li><Link to="/dashboard">Dashboard</Link></li>
                  <li><Link to="/income/add">Add Income</Link></li>
                  <li><Link to="/expenses/add">Add Expense</Link></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Contact</h4>
                <p>Email: support@financialplanning.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 Financial Planning for Individuals. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Take Control of Your <span className="highlight">Financial Future</span>
          </h1>
          <p className="hero-subtitle">
            Track your income, manage expenses, and build wealth with our comprehensive financial planning platform.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-graphic">
            <div className="chart-circle">
              <div className="chart-segment income"></div>
              <div className="chart-segment expense"></div>
              <div className="chart-segment savings"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Our Platform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Smart Analytics</h3>
              <p>Get detailed insights into your spending patterns and financial health with our advanced analytics.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Income Tracking</h3>
              <p>Easily track all your income sources and categorize them for better financial planning.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Access your financial data anywhere, anytime with our responsive mobile-first design.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your financial data is protected with bank-level security and encryption.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Goal Setting</h3>
              <p>Set financial goals and track your progress towards achieving them.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Expense Management</h3>
              <p>Organize and categorize your expenses to understand where your money goes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Financial Journey?</h2>
            <p>Join thousands of users who are already taking control of their finances.</p>
            <Link to="/register" className="btn btn-secondary">
              Start Planning Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Financial Planning for Individuals</h4>
              <p>Empowering individuals to make better financial decisions.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/about">About</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: support@financialplanning.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Financial Planning for Individuals. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 
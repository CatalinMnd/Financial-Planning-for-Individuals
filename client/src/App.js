import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AddIncome from './pages/AddIncome';
import AddExpense from './pages/AddExpense';
import ViewIncome from './pages/ViewIncome';
import ViewExpenses from './pages/ViewExpenses';
import EditIncome from './pages/EditIncome';
import EditExpense from './pages/EditExpense';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const { user, isAuthenticated, logout } = useAuthContext();

  console.log('App render - isAuthenticated:', isAuthenticated, 'user:', user);

  // Log authentication state changes
  React.useEffect(() => {
    console.log('Authentication state changed - isAuthenticated:', isAuthenticated, 'user:', user);
  }, [isAuthenticated, user]);

  return (
    <div className="App">
      <Header 
        key={`${isAuthenticated}-${user?._id || 'no-user'}`}
        isAuthenticated={isAuthenticated} 
        user={user} 
        onLogout={logout} 
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/income/add" element={<AddIncome />} />
          <Route path="/expenses/add" element={<AddExpense />} />
          <Route path="/income" element={<ViewIncome />} />
          <Route path="/expenses" element={<ViewExpenses />} />
          <Route path="/income/edit/:id" element={<EditIncome />} />
          <Route path="/expenses/edit/:id" element={<EditExpense />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* Add more routes here as you create more pages */}
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

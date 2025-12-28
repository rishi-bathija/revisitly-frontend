import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddBookmark from './components/AddBookmark';
import EmailReminder from './components/EmailReminder';
import LoadingSpinner from './components/LoadingSpinner';

/* -------------------- */
/* Layout INSIDE Router */
/* -------------------- */
const AppLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  // 🔒 Public routes where navbar must be hidden
  const shouldHideNavbar = location.pathname.startsWith('/remind');

  return (
    <div className="min-h-screen bg-gray-50">
      {!shouldHideNavbar && <Navbar />}

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home user={user} />} />

          <Route
            path="/login"
            element={user && !location.state?.fromReminder ? <Navigate to="/dashboard" /> : <Login />}
          />

          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/add-bookmark"
            element={user ? <AddBookmark user={user} /> : <Navigate to="/login" />}
          />

          {/* 🌍 PUBLIC EMAIL REMINDER PAGE */}
          <Route path="/remind/:token" element={<EmailReminder />} />
        </Routes>
      </main>
    </div>
  );
};

/* ---------------- */
/* Router wrapper   */
/* ---------------- */
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;

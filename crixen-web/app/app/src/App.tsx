import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import StrategyPage from './pages/StrategyPage';
import DashboardLayout from './layouts/DashboardLayout';
// Content Pages
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ChangelogPage from './pages/ChangelogPage';
import DocumentationPage from './pages/DocumentationPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';
import SecurityPage from './pages/legal/SecurityPage';
import CookiesPage from './pages/legal/CookiesPage';
import { useAuthStore } from './store/authStore';
import './App.css';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Content Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/cookies" element={<CookiesPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={user ? <DashboardLayout /> : <Navigate to="/" replace />}
        >
          <Route index element={<DashboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="strategy" element={<StrategyPage />} />
          {/* Redirect unknown dashboard sub-routes to dashboard index */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

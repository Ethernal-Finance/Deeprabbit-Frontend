import { Link, Route, Routes } from 'react-router-dom';
import { HomePage } from './HomePage';
import { AuthPage } from './AuthPage';
import { SubscriptionPage } from './SubscriptionPage';
import { DashboardPage } from './DashboardPage';
import { ApplicationPage } from './ApplicationPage';
import { useAuth, AuthProvider } from '../state/useAuth';

function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif' }}>
      <header style={{ display: 'flex', padding: '1rem', borderBottom: '1px solid #eee', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#111', fontWeight: 700 }}>DeepRabbit</Link>
        <nav style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/subscribe">Subscribe</Link>
          {user ? (
            <button onClick={logout}>Logout</button>
          ) : (
            <Link to="/auth">Sign In</Link>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/subscribe" element={<SubscriptionPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/app" element={<ApplicationPage />} />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}



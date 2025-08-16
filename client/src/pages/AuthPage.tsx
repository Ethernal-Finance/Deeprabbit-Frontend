import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/useAuth';

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = React.useState<'login' | 'register'>('register');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section style={{ maxWidth: 400, margin: '3rem auto', padding: '1.5rem', border: '1px solid #eee', borderRadius: 12 }}>
      <h2 style={{ marginBottom: '1rem' }}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <label>
          <div>Email</div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem' }} />
        </label>
        <label>
          <div>Password</div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required style={{ width: '100%', padding: '0.5rem' }} />
        </label>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <button type="submit" style={{ padding: '0.75rem 1rem' }}>{mode === 'login' ? 'Sign In' : 'Sign Up'}</button>
      </form>
      <div style={{ marginTop: '1rem' }}>
        {mode === 'login' ? (
          <button onClick={() => setMode('register')}>Need an account? Sign up</button>
        ) : (
          <button onClick={() => setMode('login')}>Already have an account? Sign in</button>
        )}
      </div>
      <hr style={{ margin: '1rem 0' }} />
      <div>
        <button
          onClick={async () => {
            setError(null);
            try {
              const res = await fetch(`${API_BASE}/api/auth/dev-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: email || `dev+${Date.now()}@example.com` })
              });
              if (!res.ok) throw new Error('Dev login failed');
              navigate('/dashboard');
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Dev Login (no password)
        </button>
      </div>
    </section>
  );
}



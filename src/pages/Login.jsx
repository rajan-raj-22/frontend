import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const user = await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally { setLoading(false); }
    };

    const runSeed = async () => {
        try { await authApi.seedAdmin(); alert('Admin seeded! Email: admin@bankvoice.ai  Pass: Admin@123'); }
        catch { alert('Seed failed or already exists'); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">🏦</div>
                    <div>
                        <div className="auth-logo-name">BankVoice AI</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Voice Banking Platform</div>
                    </div>
                </div>

                <div className="auth-title">Welcome back</div>
                <div className="auth-subtitle">Sign in to access your dashboard</div>

                {error && <div className="auth-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <input
                            id="login-email"
                            className="form-input"
                            type="email"
                            placeholder="admin@bankvoice.ai"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            id="login-password"
                            className="form-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        id="login-submit"
                        type="submit"
                        className="btn btn-primary auth-btn"
                        disabled={loading}
                    >
                        {loading ? '⏳ Signing in…' : '🔐 Sign In'}
                    </button>
                </form>

                <button
                    onClick={runSeed}
                    style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                    First time? Create super admin
                </button>

            </div>
        </div>
    );
}

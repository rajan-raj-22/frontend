import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/campaigns', icon: '📣', label: 'Campaigns' },
    { to: '/calls', icon: '📞', label: 'Call Logs' },
    { to: '/analytics', icon: '📈', label: 'Analytics' },
    { to: '/leads', icon: '🎯', label: 'Leads' },
];

const adminItems = [
    { to: '/banks', icon: '🏦', label: 'Banks' },
    { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function AppLayout() {
    const { user, logout, isSuperAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">🏦</div>
                    <div>
                        <div className="logo-text">BankVoice AI</div>
                        <div className="logo-badge">Voice Banking Platform</div>
                    </div>
                </div>

                {/* Live indicator */}
                <div style={{ padding: '10px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span className="live-dot"></span>
                        Agent Live — {user?.role === 'super_admin' ? 'Super Admin' : 'Bank Admin'}
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-title">Navigation</div>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                        >
                            <span className="icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                {isSuperAdmin && (
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Admin</div>
                        {adminItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                            >
                                <span className="icon">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                )}

                <div className="sidebar-footer">
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{user?.name}</div>
                        <div style={{ fontSize: 11 }}>{user?.email}</div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Header */}
            <header className="header">
                <div className="header-title">
                    <span style={{ color: 'var(--primary-light)' }}>BankVoice</span> AI Dashboard
                </div>
                <div className="header-actions">
                    <div className="badge badge-success">
                        <span className="live-dot" style={{ width: 6, height: 6 }}></span>
                        System Online
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="main-content">
                <div className="page">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

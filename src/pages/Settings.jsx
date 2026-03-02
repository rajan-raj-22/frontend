import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { user } = useAuth();

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Platform Settings</div>
                    <div className="page-subtitle">Manage preferences and configuration.</div>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 800 }}>
                <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 8 }}>Profile Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 0', fontSize: 14 }}>
                        <div style={{ color: 'var(--text-muted)' }}>Name</div>
                        <div>{user?.name}</div>
                        <div style={{ color: 'var(--text-muted)' }}>Email</div>
                        <div>{user?.email}</div>
                        <div style={{ color: 'var(--text-muted)' }}>Role</div>
                        <div><span className="badge badge-primary">{user?.role}</span></div>
                    </div>
                </div>

                <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>Notification Preferences</h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer', fontSize: 14 }}>
                        <input type="checkbox" defaultChecked /> Email me on campaign completion
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                        <input type="checkbox" defaultChecked /> Alert me on failed calls exceeding 10%
                    </label>
                </div>

                <div>
                    <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--danger)' }}>Danger Zone</h3>
                    <button className="btn btn-danger btn-sm">Reset Password</button>
                </div>
            </div>
        </div>
    );
}

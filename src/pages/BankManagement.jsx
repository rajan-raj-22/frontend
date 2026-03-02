import { useState, useEffect } from 'react';
import { banksApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function BankManagement() {
    const { isSuperAdmin } = useAuth();
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        bank_name: '', bank_short_name: '', toll_free_number: '',
        elevenlabs_reminder_agent_id: '', elevenlabs_schemes_agent_id: '',
        admin_name: '', admin_email: '', admin_password: '', logo_color: '#2563EB'
    });

    if (!isSuperAdmin) return <Navigate to="/" replace />;

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            setLoading(true);
            const res = await banksApi.getAll();
            setBanks(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await banksApi.create(formData);
            setModalOpen(false);
            setFormData({ bank_name: '', bank_short_name: '', toll_free_number: '', elevenlabs_reminder_agent_id: '', elevenlabs_schemes_agent_id: '', admin_name: '', admin_email: '', admin_password: '', logo_color: '#2563EB' });
            fetchBanks();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating bank');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Bank Management</div>
                    <div className="page-subtitle">Onboard and configure multi-tenant banks.</div>
                </div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Onboard New Bank</button>
            </div>

            <div className="card">
                {loading ? <div className="loader"><div className="spinner"></div></div> : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Bank Name</th>
                                    <th>Toll Free Configured</th>
                                    <th>Agents Configured</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banks.map(b => (
                                    <tr key={b._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                                                <div style={{ width: 14, height: 14, borderRadius: 4, background: b.logo_color }}></div>
                                                {b.bank_name} <span style={{ color: 'var(--text-muted)' }}>({b.bank_short_name})</span>
                                            </div>
                                        </td>
                                        <td>{b.toll_free_number || 'Not Set'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <span className={`badge ${b.elevenlabs_reminder_agent_id ? 'badge-success' : 'badge-danger'}`}>EMI Tracker</span>
                                                <span className={`badge ${b.elevenlabs_schemes_agent_id ? 'badge-success' : 'badge-danger'}`}>Schemes</span>
                                            </div>
                                        </td>
                                        <td><span className={`badge ${b.is_active ? 'badge-success' : 'badge-danger'}`}>{b.is_active ? 'Active' : 'Inactive'}</span></td>
                                        <td><button className="btn btn-secondary btn-sm" onClick={() => alert('Editing is disabled for demo')}>Edit</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal modal-lg">
                        <div className="modal-header">
                            <div className="modal-title">Onboard New Bank</div>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 20, fontSize: 13, color: 'var(--primary-light)', background: 'rgba(99,102,241,0.1)', padding: 12, borderRadius: 8 }}>
                                Bank data isolation will be configured automatically upon creation.
                            </div>

                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label className="form-label">Full Bank Name</label>
                                    <input type="text" className="form-input" placeholder="e.g. ICICI Bank" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Short Name</label>
                                    <input type="text" className="form-input" placeholder="e.g. ICICI" value={formData.bank_short_name} onChange={e => setFormData({ ...formData, bank_short_name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Toll Free Number</label>
                                    <input type="text" className="form-input" placeholder="e.g. 1800 100 000" value={formData.toll_free_number} onChange={e => setFormData({ ...formData, toll_free_number: e.target.value })} required />
                                </div>
                            </div>

                            <div className="form-grid" style={{ marginTop: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">ElevenLabs EMI Reminder Agent ID</label>
                                    <input type="text" className="form-input" placeholder="agent_..." value={formData.elevenlabs_reminder_agent_id} onChange={e => setFormData({ ...formData, elevenlabs_reminder_agent_id: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">ElevenLabs Schemes Agent ID</label>
                                    <input type="text" className="form-input" placeholder="agent_..." value={formData.elevenlabs_schemes_agent_id} onChange={e => setFormData({ ...formData, elevenlabs_schemes_agent_id: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ margin: '24px 0 16px', borderBottom: '1px solid var(--border-light)', paddingBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                                Bank Admin Credentials
                            </div>

                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label className="form-label">Admin Name</label>
                                    <input type="text" className="form-input" placeholder="John Doe" value={formData.admin_name} onChange={e => setFormData({ ...formData, admin_name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Admin Email</label>
                                    <input type="email" className="form-input" placeholder="admin@bank.com" value={formData.admin_email} onChange={e => setFormData({ ...formData, admin_email: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Admin Password</label>
                                    <input type="text" className="form-input" placeholder="Create init password" value={formData.admin_password} onChange={e => setFormData({ ...formData, admin_password: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Onboard Bank</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

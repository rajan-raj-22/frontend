import { useState, useEffect } from 'react';
import { campaignsApi, banksApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Campaigns() {
    const { isSuperAdmin } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ bank_id: '', agent_type: 'reminder', name: '', csv: null, scheduled_at: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [campRes, banksRes] = await Promise.all([
                campaignsApi.getAll({ limit: 100 }),
                isSuperAdmin ? banksApi.getAll() : Promise.resolve({ data: { data: [] } })
            ]);
            setCampaigns(campRes.data.data);
            if (isSuperAdmin) setBanks(banksRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const parseCSV = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const lines = text.split('\n').filter(l => l.trim().length > 0);
                if (lines.length < 2) return resolve([]);
                const headers = lines[0].split(',').map(h => h.trim());
                const data = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const obj = {};
                    headers.forEach((h, i) => {
                        obj[h] = values[i] ? values[i].trim() : '';
                    });
                    return obj;
                });
                resolve(data);
            };
            reader.readAsText(file);
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            let customers = [];
            if (formData.csv) {
                customers = await parseCSV(formData.csv);
            }

            const payload = {
                bank_id: formData.bank_id,
                agent_type: formData.agent_type,
                name: formData.name,
                scheduled_at: formData.scheduled_at,
                customers
            };

            await campaignsApi.create(payload);
            setModalOpen(false);
            setFormData({ bank_id: '', agent_type: 'reminder', name: '', csv: null, scheduled_at: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating campaign');
        } finally {
            setCreating(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'pause') await campaignsApi.pause(id);
            if (action === 'resume') await campaignsApi.resume(id);
            if (action === 'cancel') await campaignsApi.cancel(id);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'running': return 'badge-success';
            case 'paused': return 'badge-warning';
            case 'cancelled': return 'badge-danger';
            case 'completed': return 'badge-primary';
            default: return 'badge-neutral';
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Campaigns</div>
                    <div className="page-subtitle">Manage automated outbound call campaigns.</div>
                </div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ New Campaign</button>
            </div>

            <div className="card">
                {loading ? <div className="loader"><div className="spinner"></div></div> : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Campaign Name</th>
                                    <th>Bank</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map(c => (
                                    <tr key={c._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                Scheduled: {new Date(c.scheduled_at || c.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 14, height: 14, borderRadius: 4, background: c.bank_id?.logo_color || 'var(--primary)' }}></div>
                                                {c.bank_id?.bank_name}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-neutral">{c.agent_type}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(c.status)}`}>{c.status}</span>
                                        </td>
                                        <td style={{ minWidth: 150 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                                <span style={{ color: 'var(--success)' }}>{c.completed_calls} done</span>
                                                <span style={{ color: 'var(--text-muted)' }}>{c.total_calls} total</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${c.total_calls ? (c.completed_calls / c.total_calls) * 100 : 0}%` }}></div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {c.status === 'running' && <button className="btn btn-secondary btn-sm" onClick={() => handleAction(c._id, 'pause')}>Pause</button>}
                                                {c.status === 'paused' && <button className="btn btn-primary btn-sm" onClick={() => handleAction(c._id, 'resume')}>Resume</button>}
                                                {['scheduled', 'running', 'paused'].includes(c.status) && <button className="btn btn-danger btn-sm" onClick={() => handleAction(c._id, 'cancel')}>Cancel</button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {campaigns.length === 0 && (
                                    <tr><td colSpan="6" className="table-empty">No campaigns found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <div className="modal-title">Create New Campaign</div>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleCreate}>
                            {isSuperAdmin && (
                                <div className="form-group">
                                    <label className="form-label">Select Bank</label>
                                    <select className="form-select" value={formData.bank_id} onChange={e => setFormData({ ...formData, bank_id: e.target.value })} required>
                                        <option value="">-- Choose --</option>
                                        {banks.map(b => (
                                            <option key={b._id} value={b._id}>{b.bank_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Campaign Name</label>
                                    <input type="text" className="form-input" placeholder="e.g. Feb 2026 Home Loan Offers" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Agent Type</label>
                                    <select className="form-select" value={formData.agent_type} onChange={e => setFormData({ ...formData, agent_type: e.target.value })} required>
                                        <option value="reminder">EMI Reminder</option>
                                        <option value="schemes">Bank Schemes & Marketing</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Schedule Call List (CSV)</label>
                                <div style={{ background: 'var(--bg-input)', border: '1px dashed var(--border-light)', padding: 20, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                    <input type="file" accept=".csv" onChange={e => setFormData({ ...formData, csv: e.target.files[0] })} required />
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                                        Columns should match agent knowledge base format (phone_number, name, etc.)
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Schedule Time (Leave blank for immediate)</label>
                                <input type="datetime-local" className="form-input" value={formData.scheduled_at} onChange={e => setFormData({ ...formData, scheduled_at: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Campaign'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

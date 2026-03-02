import { useState, useEffect } from 'react';
import { leadsApi, banksApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Leads() {
    const { isSuperAdmin } = useAuth();
    const [leads, setLeads] = useState([]);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ bank_id: '', status: '' });
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leadRes, bankRes] = await Promise.all([
                leadsApi.getAll(filters),
                isSuperAdmin ? banksApi.getAll() : Promise.resolve({ data: { data: [] } })
            ]);
            setLeads(leadRes.data.data);
            if (isSuperAdmin) setBanks(bankRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await leadsApi.update(id, { status: newStatus });
            setLeads(leads.map(l => l._id === id ? { ...l, status: newStatus } : l));
            if (modalData && modalData._id === id) setModalData({ ...modalData, status: newStatus });
        } catch (err) {
            alert('Error updating status');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Lead Management</div>
                    <div className="page-subtitle">Track and convert leads generated from marketing campaigns.</div>
                </div>
            </div>

            <div className="filter-bar">
                {isSuperAdmin && (
                    <select className="form-select" value={filters.bank_id} onChange={e => setFilters({ ...filters, bank_id: e.target.value })}>
                        <option value="">All Banks</option>
                        {banks.map(b => <option key={b._id} value={b._id}>{b.bank_name}</option>)}
                    </select>
                )}
                <select className="form-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="not_interested">Not Interested</option>
                </select>
            </div>

            <div className="card">
                {loading ? <div className="loader"><div className="spinner"></div></div> : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Scheme Intent</th>
                                    <th>Bank</th>
                                    <th>Interest</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(l => (
                                    <tr key={l._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{l.customer_name || 'Unknown'}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.customer_phone}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{l.scheme_name || 'No scheme specified'}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>City: {l.customer_city || 'N/A'}</div>
                                        </td>
                                        <td>{l.bank_id?.bank_short_name}</td>
                                        <td>
                                            <span className={`badge ${l.interest_level === 'High' ? 'badge-success' : l.interest_level === 'Medium' ? 'badge-warning' : 'badge-neutral'}`}>
                                                {l.interest_level || 'Unknown'}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className="form-select"
                                                style={{ padding: '4px 8px', fontSize: 12, height: 'auto', width: 'auto', border: `1px solid ${l.status === 'new' ? 'var(--primary)' : 'var(--border-light)'}` }}
                                                value={l.status}
                                                onChange={e => updateStatus(l._id, e.target.value)}
                                            >
                                                <option value="new">New</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="converted">Converted ✅</option>
                                                <option value="not_interested">Not Interested</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setModalData(l)}>Details</button>
                                        </td>
                                    </tr>
                                ))}
                                {leads.length === 0 && <tr><td colSpan="6" className="table-empty">No leads found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalData && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <div className="modal-title">Lead Details</div>
                            <button className="modal-close" onClick={() => setModalData(null)}>×</button>
                        </div>

                        <div className="dp-grid" style={{ marginBottom: 24 }}>
                            <div className="dp-item">
                                <div className="dp-label">Name</div>
                                <div className="dp-value">{modalData.customer_name}</div>
                            </div>
                            <div className="dp-item">
                                <div className="dp-label">Phone</div>
                                <div className="dp-value">{modalData.customer_phone}</div>
                            </div>
                            <div className="dp-item">
                                <div className="dp-label">Bank</div>
                                <div className="dp-value">{modalData.bank_id?.bank_name}</div>
                            </div>
                            <div className="dp-item">
                                <div className="dp-label">City</div>
                                <div className="dp-value">{modalData.customer_city || '---'}</div>
                            </div>
                            <div className="dp-item">
                                <div className="dp-label">Scheme Requested</div>
                                <div className="dp-value" style={{ color: 'var(--primary-light)' }}>{modalData.scheme_name}</div>
                            </div>
                            <div className="dp-item">
                                <div className="dp-label">Interest Level</div>
                                <div className="dp-value">{modalData.interest_level || '---'}</div>
                            </div>
                            <div className="dp-item">
                                <div className="dp-label">Callback Requested</div>
                                <div className={`dp-value ${modalData.callback_requested}`}>{modalData.callback_requested ? 'Yes' : 'No'}</div>
                            </div>
                            <div className="dp-item">
                                <div className="dp-label">Preferred Time</div>
                                <div className="dp-value">{modalData.callback_preferred_time || '---'}</div>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'var(--bg-card2)', border: 'none', padding: 16 }}>
                            <div className="dp-label" style={{ marginBottom: 8 }}>Customer Intent Detail (Extracted by AI)</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                {modalData.customer_intent_detail || 'No specific details provided.'}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                            <button className="btn btn-primary" onClick={() => setModalData(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

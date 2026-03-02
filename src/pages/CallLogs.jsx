import { useState, useEffect } from 'react';
import { callsApi, banksApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function CallLogs() {
    const { isSuperAdmin } = useAuth();
    const [calls, setCalls] = useState([]);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ bank_id: '', agent_type: '', call_outcome: '' });

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [callRes, bankRes] = await Promise.all([
                callsApi.getAll(filters),
                isSuperAdmin ? banksApi.getAll() : Promise.resolve({ data: { data: [] } })
            ]);
            setCalls(callRes.data.data);
            if (isSuperAdmin) setBanks(bankRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const syncCalls = async () => {
        if (!filters.bank_id || !filters.agent_type) return alert('Select Bank and Agent Type to sync calls manually');
        try {
            setLoading(true);
            // need elevenlabs agent id to sync; logic handled inside backend using bank_id
            const b = banks.find(b => b._id === filters.bank_id);
            const agent_id = filters.agent_type === 'reminder' ? b?.elevenlabs_reminder_agent_id : b?.elevenlabs_schemes_agent_id;
            if (!agent_id) throw new Error('No agent configured for this bank type');

            await callsApi.sync({ bank_id: filters.bank_id, agent_id });
            await fetchData();
            alert('Sync successful');
        } catch (err) {
            alert(err.message || 'Error syncing calls');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Call Logs</div>
                    <div className="page-subtitle">Historical records of all automated outbound calls.</div>
                </div>
                <button className="btn btn-secondary" onClick={syncCalls} disabled={!filters.bank_id || !filters.agent_type}>
                    🔄 Sync Recent Calls
                </button>
            </div>

            <div className="filter-bar">
                {isSuperAdmin && (
                    <select className="form-select" value={filters.bank_id} onChange={e => setFilters({ ...filters, bank_id: e.target.value })}>
                        <option value="">All Banks</option>
                        {banks.map(b => <option key={b._id} value={b._id}>{b.bank_name}</option>)}
                    </select>
                )}
                <select className="form-select" value={filters.agent_type} onChange={e => setFilters({ ...filters, agent_type: e.target.value })}>
                    <option value="">All Agents</option>
                    <option value="reminder">EMI Reminder</option>
                    <option value="schemes">Bank Schemes</option>
                </select>
                <select className="form-select" value={filters.call_outcome} onChange={e => setFilters({ ...filters, call_outcome: e.target.value })}>
                    <option value="">All Outcomes</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                    <option value="Disputed">Disputed</option>
                    <option value="Escalated">Escalated</option>
                    <option value="No Answer">No Answer</option>
                </select>
            </div>

            <div className="card">
                {loading ? <div className="loader"><div className="spinner"></div></div> : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Date & Time</th>
                                    <th>Bank / Type</th>
                                    <th>Duration</th>
                                    <th>Outcome</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calls.map(c => (
                                    <tr key={c._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{c.customer_name || 'Unknown User'}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.customer_phone || '---'}</div>
                                        </td>
                                        <td>{new Date(c.call_date).toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <span className="badge badge-neutral" style={{ width: 'fit-content' }}>{c.bank_id?.bank_short_name || '---'}</span>
                                                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.agent_type === 'reminder' ? 'EMI Reminder' : 'Schemes'}</span>
                                            </div>
                                        </td>
                                        <td>{Math.floor(c.duration_seconds / 60)}m {c.duration_seconds % 60}s</td>
                                        <td>
                                            <span className={`badge ${c.call_outcome === 'Completed' ? 'badge-success' : c.call_outcome === 'Failed' ? 'badge-danger' : 'badge-warning'}`}>
                                                {c.call_outcome || 'Unknown'}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/calls/${c._id}`} className="btn btn-primary btn-sm">View Details</Link>
                                        </td>
                                    </tr>
                                ))}
                                {calls.length === 0 && (
                                    <tr><td colSpan="6" className="table-empty">No calls found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

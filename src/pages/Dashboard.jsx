import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList, Cell } from 'recharts';

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [testAgent, setTestAgent] = useState('reminder');

    // Default fallback IDs for testing if bank not configured
    const FALLBACK_IDS = {
        reminder: 'agent_6901kjezj1mxfj79d5tcppywdwnp',
        schemes: 'agent_4501kjf07bavepd8kz7v7hdhqnfy'
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const res = await analyticsApi.summary();
            setData(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loader"><div className="spinner"></div></div>;

    const COLORS = {
        'Completed': '#10b981',
        'Failed': '#ef4444',
        'No Answer': '#f59e0b',
        'Voicemail': '#6366f1',
    };

    const currentAgentId = testAgent === 'reminder'
        ? (user?.bank_id?.elevenlabs_reminder_agent_id || FALLBACK_IDS.reminder)
        : (user?.bank_id?.elevenlabs_schemes_agent_id || FALLBACK_IDS.schemes);

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Welcome back, {user?.name}</div>
                    <div className="page-subtitle">Here's your operation summary for today.</div>
                </div>
            </div>

            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-label">Calls Today</div>
                    <div className="stat-value">{data?.callsToday || 0}</div>
                    <div className="stat-icon">📞</div>
                    <div className="stat-change">+12% from yesterday</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Campaigns</div>
                    <div className="stat-value">{data?.totalCampaigns || 0}</div>
                    <div className="stat-icon">📣</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Calls</div>
                    <div className="stat-value">{data?.totalCalls || 0}</div>
                    <div className="stat-icon">📊</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Leads</div>
                    <div className="stat-value">{data?.totalLeads || 0}</div>
                    <div className="stat-icon">🎯</div>
                </div>
            </div>

            <div className="form-grid">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Call Outcomes</div>
                    </div>
                    <div style={{ height: 300 }}>
                        {data?.outcomeStats?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.outcomeStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="_id" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
                                    <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} itemStyle={{ color: 'var(--text)' }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        <LabelList dataKey="count" position="top" fill="var(--text)" />
                                        {data.outcomeStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry._id] || 'var(--primary)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="table-empty">No data available</div>
                        )}
                    </div>
                </div>

                {/* PROMINENT VOICE AI TESTING SECTION */}
                <div className="card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 500,
                    border: '2px solid var(--primary)',
                    background: 'rgba(99, 102, 241, 0.05)',
                    position: 'relative',
                    padding: '30px',
                    textAlign: 'center'
                }}>
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ fontSize: 42, marginBottom: 12 }}>🎙️</div>
                        <div className="card-title" style={{ fontSize: 24, marginBottom: 8 }}>Live Voice AI Testing</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Select an agent to start a live test conversation:</div>

                        <div className="pill-tabs" style={{ background: 'var(--bg-body)', padding: 6, borderRadius: 12, display: 'inline-flex' }}>
                            <button className={`pill-tab ${testAgent === 'reminder' ? 'active' : ''}`} onClick={() => setTestAgent('reminder')}>EMI Reminder</button>
                            <button className={`pill-tab ${testAgent === 'schemes' ? 'active' : ''}`} onClick={() => setTestAgent('schemes')}>Bank Schemes</button>
                        </div>
                    </div>

                    {/* ElevenLabs Widget Container - Cleaned up to avoid clipping */}
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 32,
                        minHeight: 120
                    }}>
                        <elevenlabs-convai
                            key={currentAgentId}
                            agent-id={currentAgentId}
                        ></elevenlabs-convai>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ fontSize: 13, color: 'var(--primary-light)', padding: '10px 24px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.1)', fontWeight: 600, display: 'inline-block' }}>
                            Active Agent: {testAgent === 'reminder' ? 'EMI Tracking' : 'Marketing Schemes'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 12, fontFamily: 'monospace', opacity: 0.6 }}>AGENT_ID: {currentAgentId}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

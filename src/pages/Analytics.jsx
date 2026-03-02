import { useState, useEffect } from 'react';
import { analyticsApi, banksApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, LabelList
} from 'recharts';

export default function Analytics() {
    const { isSuperAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('summary'); // summary | trends
    const [bankId, setBankId] = useState('');
    const [banks, setBanks] = useState([]);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanks();
    }, []);

    useEffect(() => {
        fetchData();
    }, [bankId, activeTab]);

    const fetchBanks = async () => {
        if (isSuperAdmin) {
            const res = await banksApi.getAll();
            setBanks(res.data.data);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = bankId ? { bank_id: bankId } : {};

            if (activeTab === 'summary') {
                const [outcomes, languages, banksComp] = await Promise.all([
                    analyticsApi.outcomes(params),
                    analyticsApi.languages(params),
                    isSuperAdmin ? analyticsApi.banks(params) : Promise.resolve({ data: { data: [] } }),
                ]);
                setData({
                    outcomes: outcomes.data.data,
                    languages: languages.data.data,
                    banksData: banksComp.data.data,
                });
            } else {
                const [daily, satisfaction] = await Promise.all([
                    analyticsApi.daily(params),
                    analyticsApi.satisfaction(params),
                ]);
                setData({
                    daily: daily.data.data,
                    satisfaction: satisfaction.data.data,
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Common colors
    const PIE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const OUTCOME_COLORS = { 'Completed': '#10b981', 'Failed': '#ef4444', 'No Answer': '#f59e0b', 'Voicemail': '#6366f1', 'Disputed': '#ef4444', 'Escalated': '#f59e0b' };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Analytics Dashboard</div>
                    <div className="page-subtitle">Deep dive into call performance and metrics.</div>
                </div>
            </div>

            <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="pill-tabs">
                    <button className={`pill-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>📊 Summary Stats</button>
                    <button className={`pill-tab ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>📈 Time Trends</button>
                </div>
                {isSuperAdmin && (
                    <select className="form-select" value={bankId} onChange={e => setBankId(e.target.value)}>
                        <option value="">All Banks (Global View)</option>
                        {banks.map(b => <option key={b._id} value={b._id}>{b.bank_name}</option>)}
                    </select>
                )}
            </div>

            {loading ? (
                <div className="loader"><div className="spinner"></div></div>
            ) : activeTab === 'summary' ? (
                <div className="form-grid">
                    <div className="card">
                        <div className="card-header"><div className="card-title">Call Outcomes</div></div>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.outcomes} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="_id" stroke="var(--text-muted)" />
                                    <YAxis stroke="var(--text-muted)" />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} itemStyle={{ color: 'var(--text)' }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        <LabelList dataKey="count" position="top" fill="var(--text)" />
                                        {data.outcomes?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={OUTCOME_COLORS[entry._id] || 'var(--primary)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header"><div className="card-title">Language Distribution</div></div>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} itemStyle={{ color: 'var(--text)' }} />
                                    <Legend />
                                    <Pie data={data.languages} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label>
                                        {data.languages?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {isSuperAdmin && !bankId && (
                        <div className="card" style={{ gridColumn: '1 / -1' }}>
                            <div className="card-header"><div className="card-title">Bank Comparison (Total Calls)</div></div>
                            <div style={{ height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.banksData} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis type="number" stroke="var(--text-muted)" />
                                        <YAxis dataKey="bank_name" type="category" stroke="var(--text-muted)" width={120} />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} itemStyle={{ color: 'var(--text)' }} />
                                        <Bar dataKey="totalCalls" fill="var(--primary)" barSize={20} radius={[0, 4, 4, 0]}>
                                            <LabelList dataKey="totalCalls" position="right" fill="var(--text)" />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="form-grid">
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-header"><div className="card-title">Daily Call Volume (Last 30 Days)</div></div>
                        <div style={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.daily} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="_id" stroke="var(--text-muted)" />
                                    <YAxis stroke="var(--text-muted)" yAxisId="left" />
                                    <YAxis stroke="var(--text-muted)" yAxisId="right" orientation="right" />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} itemStyle={{ color: 'var(--text)' }} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="count" name="Call Volume" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="avg_duration" name="Avg Duration (s)" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

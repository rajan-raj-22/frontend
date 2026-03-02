import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { callsApi } from '../services/api';

export default function CallDetail() {
    const { id } = useParams();
    const [call, setCall] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCall();
    }, [id]);

    const fetchCall = async () => {
        try {
            const res = await callsApi.getById(id);
            setCall(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getFreshAudio = async () => {
        try {
            const res = await callsApi.getAudio(id);
            setCall({ ...call, audio_url: res.data.data.audio_url });
        } catch (err) { }
    };

    if (loading) return <div className="loader"><div className="spinner"></div></div>;
    if (!call) return <div className="table-empty">Call not found</div>;

    return (
        <div>
            <div className="page-header" style={{ alignItems: 'flex-start' }}>
                <div>
                    <Link to="/calls" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>← Back to Calls</Link>
                    <div className="page-title">Conversation Detail</div>
                    <div className="page-subtitle">ID: {call.elevenlabs_conversation_id || call._id}</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <span className={`badge ${call.call_outcome === 'Completed' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 13 }}>
                        {call.call_outcome}
                    </span>
                    <span className="badge badge-primary">{call.agent_type === 'reminder' ? 'EMI Reminder' : 'Marketing Schemes'}</span>
                </div>
            </div>

            <div className="form-grid">
                <div>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header">
                            <div className="card-title">Call Recording</div>
                            {call.audio_url && <button className="btn btn-secondary btn-xs" onClick={getFreshAudio}>🔄 Refresh Link</button>}
                        </div>
                        {call.audio_url ? (
                            <div className="audio-player">
                                <audio controls src={call.audio_url} />
                            </div>
                        ) : (
                            <div className="table-empty" style={{ padding: 20, border: '1px dashed var(--border-light)', borderRadius: 8 }}>
                                No recording available
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Captured Data Points</div>
                        </div>
                        <div className="dp-grid">
                            <div className="dp-item">
                                <div className="dp-label">Customer Contacted</div>
                                <div className={`dp-value ${call.customer_confirmed}`}>
                                    {call.customer_confirmed === true ? 'Yes' : call.customer_confirmed === false ? 'No' : 'Unknown'}
                                </div>
                            </div>
                            <div className="dp-item">
                                <div className="dp-label">Language Used</div>
                                <div className="dp-value">{call.language_used || '---'}</div>
                            </div>
                            <div className="dp-item">
                                <div className="dp-label">Satisfaction</div>
                                <div className="dp-value">{call.satisfaction_indicator || '---'}</div>
                            </div>

                            {call.agent_type === 'reminder' ? (
                                <>
                                    <div className="dp-item">
                                        <div className="dp-label">Reminder Delivered</div>
                                        <div className={`dp-value ${call.reminder_delivered}`}>{call.reminder_delivered ? 'Yes' : 'No'}</div>
                                    </div>
                                    <div className="dp-item">
                                        <div className="dp-label">Reminder Type</div>
                                        <div className="dp-value">{call.reminder_type || '---'}</div>
                                    </div>
                                    <div className="dp-item">
                                        <div className="dp-label">Customer Response</div>
                                        <div className="dp-value">{call.customer_response || '---'}</div>
                                    </div>
                                    <div className="dp-item">
                                        <div className="dp-label">Dispute Reason</div>
                                        <div className="dp-value">{call.dispute_reason || 'None'}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="dp-item">
                                        <div className="dp-label">Interest Level</div>
                                        <div className="dp-value">{call.scheme_interest_level || '---'}</div>
                                    </div>
                                    <div className="dp-item">
                                        <div className="dp-label">Scheme Selected</div>
                                        <div className="dp-value">{call.scheme_name_selected || 'None'}</div>
                                    </div>
                                    <div className="dp-item">
                                        <div className="dp-label">City</div>
                                        <div className="dp-value">{call.customer_city || '---'}</div>
                                    </div>
                                    <div className="dp-item">
                                        <div className="dp-label">Callback Requested</div>
                                        <div className={`dp-value ${call.callback_requested}`}>{call.callback_requested ? 'Yes' : 'No'}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="card" style={{ height: '100%' }}>
                        <div className="card-header">
                            <div className="card-title">Full Transcript</div>
                            <div className="badge badge-neutral">{call.duration_seconds} seconds</div>
                        </div>

                        {call.transcript?.length > 0 ? (
                            <div className="transcript-wrap">
                                {call.transcript.map((t, i) => (
                                    <div key={i} className={`transcript-msg ${t.role}`}>
                                        <div className="transcript-bubble">{t.message}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 4 }}>
                                            <span className="transcript-role">{t.role === 'agent' ? 'AI Agent' : 'Customer'}</span>
                                            <span className="transcript-time">{Math.floor(t.time_in_call / 60)}:{(t.time_in_call % 60).toString().padStart(2, '0')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="table-empty">No transcript exists for this call</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

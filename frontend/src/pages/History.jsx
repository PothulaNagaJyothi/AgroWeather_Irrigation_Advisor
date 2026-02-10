import React, { useEffect, useState } from 'react'
import { listHistory } from '../api/apiClient'

export default function History() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const resp = await listHistory()
        setRows(resp.history || [])
      } catch (err) { setError(err?.response?.data?.error || err.message) }
      finally { setLoading(false) }
    })()
  }, [])

  // Safely calculate stats
  const stats = {
    total: rows.length,
    start: rows.filter(r => r.decision === 'start').length,
    postpone: rows.filter(r => r.decision === 'postpone').length,
    monitor: rows.filter(r => (r.decision || 'monitor') === 'monitor').length,
    high: rows.filter(r => r.priority === 'high').length
  }

  const getDecisionBadgeClass = (decision) => {
    const d = (decision || '').toLowerCase();
    if (d === 'start') return 'badge-danger'
    if (d === 'postpone') return 'badge-warning'
    return 'badge-info'
  }

  const getDecisionIcon = (decision) => {
    const d = (decision || '').toLowerCase();
    if (d === 'start') return '💧'
    if (d === 'postpone') return '⏸️'
    return '👀'
  }

  const getPriorityBadgeClass = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return 'badge-danger'
    if (p === 'medium') return 'badge-warning'
    return 'badge-info'
  }

  const formatReason = (reason) => {
    if (!reason) return 'No reason provided';
    if (Array.isArray(reason)) {
      return reason.join('. ');
    }
    return String(reason);
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ marginLeft: '12px' }}>Loading history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error" style={{ marginTop: '24px' }}>
        <strong>❌ Error:</strong> {error}
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: '32px' }}>📜 Irrigation History</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-4" style={{ marginBottom: '32px' }}>
        <div className="card">
          <h4 style={{ marginBottom: '12px' }}>📊 Total Decisions</h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.total}</p>
        </div>
        <div className="card">
          <h4 style={{ marginBottom: '12px' }}>💧 Start Irrigation</h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{stats.start}</p>
        </div>
        <div className="card">
          <h4 style={{ marginBottom: '12px' }}>⏸️ Postpone</h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>{stats.postpone}</p>
        </div>
        <div className="card">
          <h4 style={{ marginBottom: '12px' }}>⚡ High Priority</h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{stats.high}</p>
        </div>
      </div>

      {/* History Table */}
      {rows.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Farm</th>
                <th>Decision</th>
                <th>Priority</th>
                <th>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: '500' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{new Date(r.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{r.farm_name || 'Unnamed Farm'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{getDecisionIcon(r.decision)}</span>
                      <span className={`badge ${getDecisionBadgeClass(r.decision)}`}>{r.decision || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityBadgeClass(r.priority)}`}>{r.priority || 'Low'}</span>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                      {formatReason(r.reason).substring(0, 100)}
                      {formatReason(r.reason).length > 100 ? '...' : ''}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-light)' }}>No irrigation history yet. Start by submitting farm details to get recommendations.</p>
        </div>
      )}
    </div>
  )
}

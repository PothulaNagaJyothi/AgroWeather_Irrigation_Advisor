import React from 'react';
import '../styles/DecisionDashboard.css';

const DecisionDashboard = ({ result, farm, onRefresh }) => {
    // Ultimate safety check
    if (!result || !farm) return null;

    // Destructure with default fallbacks
    const { decision = 'Monitor', reason = 'No data', priority = 'Low', quantity } = result || {};

    // Safety check for meta, provide defaults if missing (e.g. from history)
    const meta = result.meta || {
        avgTemp: 0,
        totalPrecip: 0,
        cropDemand: 'N/A',
        soilRetention: 'N/A'
    };

    // Helper to determine status class
    const getStatusClass = () => {
        const d = (decision || '').toLowerCase();
        if (d === 'start') return 'start';
        if (d === 'postpone') return 'postpone';
        return 'monitor';
    };

    const statusClass = getStatusClass();

    // Safely format field size
    const getFieldSizeLabel = () => {
        const size = parseFloat(farm.field_size_ha);
        if (isNaN(size)) return 'Small Scale';
        return size >= 10 ? 'Large Scale' : 'Small Scale';
    };

    return (
        <div className="dashboard-container">

            {/* 1. Context Header */}
            <header className="dashboard-header">
                <div className="header-info">
                    <span>📍 {farm.location_name || 'Farm'}</span>
                    <span>🌱 {farm.crop_type || 'Crop'}</span>
                    <span>📏 {farm.field_size_ha} ha</span>
                </div>
                <div className="header-date">
                    {new Date(result.created_at || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
            </header>

            {/* 2. Primary Decision Card */}
            <div className={`decision-card ${statusClass}`}>
                <div className="decision-label">{priority} Priority</div>
                <h1 className="decision-title">{(decision || 'UNKNOWN').toUpperCase()} IRRIGATION</h1>

                {decision === 'start' && quantity && quantity.formatted && (
                    <div className="decision-quantity">
                        💧 {quantity.formatted} Required
                    </div>
                )}
            </div>

            {/* 3. Reason Section */}
            <section className="reason-section">
                <h3 className="section-title">📝 Recommendation Logic</h3>
                <ul className="reason-list">
                    {Array.isArray(reason) ? reason.map((r, i) => (
                        <li key={i}>{r}</li>
                    )) : <li>{String(reason)}</li>}
                </ul>
            </section>

            {/* 4. Weather Overview - Only show if meta has real data */}
            {meta && meta.avgTemp !== undefined && meta.avgTemp !== 0 && (
                <section className="weather-grid">
                    <div className="weather-card temp">
                        <div className="weather-value">{meta.avgTemp ? Number(meta.avgTemp).toFixed(1) : '-'}°C</div>
                        <div className="weather-label">Avg Temp (24h)</div>
                    </div>
                    <div className="weather-card rain">
                        <div className="weather-value">{meta.totalPrecip ? Number(meta.totalPrecip).toFixed(1) : '-'} mm</div>
                        <div className="weather-label">Rain Forecast (48h)</div>
                    </div>
                    <div className="weather-card humid">
                        <div className="weather-value">~60%</div>
                        <div className="weather-label">Humidity</div>
                    </div>
                </section>
            )}

            {/* 5. Farm Factors Summary */}
            <section className="factors-row">
                <div className="factor-badge">
                    <span>🌾 Crop Demand:</span>
                    <strong>{meta.cropDemand || 'N/A'}</strong>
                </div>
                <div className="factor-badge">
                    <span>🪨 Soil Retention:</span>
                    <strong>{meta.soilRetention || 'N/A'}</strong>
                </div>
                <div className="factor-badge">
                    <span>🚜 Field Impact:</span>
                    <strong>{getFieldSizeLabel()}</strong>
                </div>
            </section>

            {/* 6. Action Section */}
            <div className="action-section">
                <button onClick={onRefresh} className="refresh-btn">
                    🔄 Refresh Recommendation
                </button>
            </div>

        </div>
    );
};

export default DecisionDashboard;

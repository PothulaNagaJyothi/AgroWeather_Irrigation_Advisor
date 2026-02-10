import React, { useState, useEffect } from 'react'
import { getForecast, listHistory } from '../api/apiClient'
import DecisionDashboard from '../components/DecisionDashboard'
import { locationOptions } from '../utils/locations'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [latestRec, setLatestRec] = useState(null)

  // Fetch latest recommendation on mount
  useEffect(() => {
    (async () => {
      try {
        const resp = await listHistory();
        if (resp.history && resp.history.length > 0) {
          // Assuming API returns sorted history, or we sort it here just in case
          const sorted = resp.history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setLatestRec(sorted[0]);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    })();
  }, []);

  const handleLocationSelect = (e) => {
    const locName = e.target.value;
    setSelectedLocation(locName);
    const loc = locationOptions.find(l => l.name === locName);
    if (loc) {
      setLat(loc.lat.toString());
      setLon(loc.lon.toString());
    }
  };

  const fetch = async (e) => {
    e && e.preventDefault();
    if (!lat || !lon) {
      setError("Please select a location or enter coordinates.");
      return;
    }
    setLoading(true); setError(null)
    try {
      const resp = await getForecast(Number(lat), Number(lon))
      setData(resp.data)
    } catch (err) { setError(err?.response?.data?.error || err.message) }
    finally { setLoading(false) }
  }

  const getWeatherIcon = (temp, precip) => {
    if (precip > 0.5) return '🌧️'
    if (temp > 30) return '☀️'
    if (temp > 20) return '🌤️'
    return '☁️'
  }

  // Helper object to mock the 'farm' prop structure needed by DecisionDashboard
  // Since history items are flat, we reconstruct a farm object for display
  const getFarmFromRec = (rec) => ({
    location_name: rec.farm_name || 'Your Farm',
    crop_type: 'Unknown Crop', // History might not save crop name directly if normalized? result.reason logic uses it though.
    // Actually our history table likely has farm_name. 
    // The DecisionDashboard uses: farm.location_name, farm.crop_type, farm.field_size_ha
    // Let's see if we can get these from the history item directly or if we need to adjust.
    // History table schema: id, user_id, farm_id (fk), decision, reason ...
    // The listHistory endpoint does a JOIN. backend/src/services/historyService.js:
    // SELECT h.*, f.name as farm_name FROM history h JOIN farm_details f ON h.farm_id = f.id ...
    // It doesn't fetch crop_type or field_size. 
    // For now, we'll placeholder them or just let the dashboard handle missing data gracefully.
    // Better yet, let's just show what we have.
    name: rec.farm_name,
    location_name: rec.farm_name, // DecisionDashboard uses this for the header
    crop_type: 'View Details in History',
    field_size_ha: '?'
  });


  return (
    <div>
      <h2 style={{ marginBottom: '32px' }}>⛅ Weather & Irrigation Dashboard</h2>

      {/* Latest Recommendation Section */}
      {latestRec && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>📢 Latest Advice</span>
            <Link to="/farm" className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>New Analysis</Link>
          </h3>
          <DecisionDashboard
            result={latestRec}
            farm={{
              location_name: latestRec.location_name || latestRec.farm_name || 'My Farm',
              crop_type: latestRec.crop_type || 'Unknown Crop',
              field_size_ha: latestRec.field_size_ha || '-'
            }}
            onRefresh={() => window.location.href = '/farm'}
          />
        </div>
      )}

      {/* Weather Forecast Input */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 className="card-title">Fetch Weather Forecast</h3>
        <p className="text-muted" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
          Select a location from the list or enter custom coordinates.
        </p>
        <form onSubmit={fetch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Location</label>
            <select
              className="form-control"
              value={selectedLocation}
              onChange={handleLocationSelect}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
            >
              {locationOptions.map(loc => (
                <option key={loc.name} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Latitude</label>
            <input
              placeholder="e.g. 30.90"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Longitude</label>
            <input
              placeholder="e.g. 75.85"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '44px' }}>
            {loading ? '⏳ Fetching...' : '🔍 Get Forecast'}
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '32px' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ marginLeft: '12px' }}>Fetching forecast...</p>
        </div>
      )}

      {/* Forecast Display */}
      {data && (
        <div>
          {/* Location Info */}
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-light-blue) 100%)', color: 'white' }}>
            <h3 style={{ color: 'white', marginBottom: '12px' }}>📍 Forecast for {selectedLocation !== 'Select a location...' ? selectedLocation : `${data.latitude}, ${data.longitude}`}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Latitude</p>
                <p style={{ color: 'white', fontSize: '1.3rem', fontWeight: 'bold' }}>{data.latitude}°</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Longitude</p>
                <p style={{ color: 'white', fontSize: '1.3rem', fontWeight: 'bold' }}>{data.longitude}°</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Timezone</p>
                <p style={{ color: 'white', fontSize: '1.3rem', fontWeight: 'bold' }}>{data.timezone}</p>
              </div>
            </div>
          </div>

          {/* Weather Summary Cards */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>📊 Hourly Forecast (48h)</h3>
            <div className="grid grid-cols-3">
              {data.hourly && data.hourly.time && data.hourly.time.slice(0, 12).map((time, i) => {
                const temp = data.hourly.temperature_2m[i]
                const precip = data.hourly.precipitation[i]
                const icon = getWeatherIcon(temp, precip)
                return (
                  <div key={i} className="card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{time}</p>
                    <div style={{ fontSize: '2.5rem', margin: '12px 0' }}>{icon}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Temp</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{temp.toFixed(1)}°C</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Rain</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{precip}mm</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2">
            <div className="card">
              <h4 style={{ marginBottom: '12px' }}>🌡️ Temperature Range</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                {Math.min(...data.hourly.temperature_2m).toFixed(1)}°C - {Math.max(...data.hourly.temperature_2m).toFixed(1)}°C
              </p>
            </div>
            <div className="card">
              <h4 style={{ marginBottom: '12px' }}>💧 Total Precipitation (48h)</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
                {data.hourly.precipitation.reduce((s, v) => s + (v || 0), 0).toFixed(1)}mm
              </p>
            </div>
          </div>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-light)' }}>Select a location above to view weather forecast</p>
        </div>
      )}
    </div>
  )
}

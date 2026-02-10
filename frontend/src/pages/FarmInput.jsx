import React, { useState } from 'react'
import { createFarm } from '../api/apiClient'
import DecisionDashboard from '../components/DecisionDashboard'
import { locationOptions } from '../utils/locations'

const soilOptions = ['sandy', 'loamy', 'clay']
const cropOptions = ['Wheat', 'Rice', 'Maize', 'Soy', 'Potato', 'Sugarcane', 'Banana']
const sizeOptions = [0.5, 1, 2, 5, 10, 20, 50]


export default function FarmInput() {
  const [form, setForm] = useState({
    name: '',
    location_name: '',
    location_lat: '',
    location_lon: '',
    crop_type: 'Wheat',
    soil_type: 'loamy',
    field_size_ha: 1
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLocationChange = (e) => {
    const selectedLocation = locationOptions.find(loc => loc.name === e.target.value)
    if (selectedLocation) {
      setForm({
        ...form,
        location_name: selectedLocation.name,
        location_lat: selectedLocation.lat.toString(),
        location_lon: selectedLocation.lon.toString()
      })
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.location_lat || !form.location_lon) {
      setError('Please select a valid location')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = {
        ...form,
        location_lat: Number(form.location_lat),
        location_lon: Number(form.location_lon),
        field_size_ha: Number(form.field_size_ha),
        crop_type: form.crop_type
      }
      const resp = await createFarm(payload)
      setResult(resp)
    } catch (err) {
      setError(err?.response?.data?.error || err.message)
    } finally { setLoading(false) }
  }

  // Reload Logic (re-submits current form)
  const handleRefresh = () => {
    // manually trigger submit
    const syntheticEvent = { preventDefault: () => { } };
    submit(syntheticEvent);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', padding: '40px 20px', background: '#f8f9fa' }}>
      <div style={{ width: '100%', maxWidth: '1100px' }}>
        <h2 style={{ marginBottom: '32px', textAlign: 'center', color: '#2c3e50', fontWeight: '700' }}>
          AgroWeather Advisor
        </h2>

        {error && (
          <div className="card alert alert-error" style={{ marginBottom: '24px' }}>
            <h4>❌ Error</h4>
            <p>{error}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.5fr' : '1fr', gap: '40px', alignItems: 'start', transition: 'grid-template-columns 0.3s ease' }}>
          {/* Form Card */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 className="card-title" style={{ borderBottom: '2px solid #ecf0f1', paddingBottom: '16px', marginBottom: '24px' }}>
              📝 Farm Details
            </h3>
            <form onSubmit={submit} className="form">
              <div className="form-group">
                <label className="form-label">Farm Name</label>
                <input name="name" value={form.name} onChange={onChange} placeholder="My Farm" />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <select
                  name="location_name"
                  value={form.location_name}
                  onChange={handleLocationChange}
                  required
                >
                  {locationOptions.map(loc => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Crop Type</label>
                <select name="crop_type" value={form.crop_type} onChange={onChange}>
                  {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Soil Type</label>
                <select name="soil_type" value={form.soil_type} onChange={onChange}>
                  {soilOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Field Size (ha)</label>
                <select name="field_size_ha" value={form.field_size_ha} onChange={onChange}>
                  {sizeOptions.map(s => <option key={s} value={s}>{s} ha</option>)}
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '16px' }}>
                {loading ? 'Analyzing...' : 'Get Advice'}
              </button>
            </form>
          </div>

          {/* Dashboard Result */}
          {result && (
            <DecisionDashboard
              result={result.decision}
              farm={form}
              onRefresh={handleRefresh}
            />
          )}

          {!result && !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#95a5a6', border: '2px dashed #bdc3c7', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '16px' }}>Ready to Advise</h3>
              <p>Enter your farm details on the left to generate a precision irrigation schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

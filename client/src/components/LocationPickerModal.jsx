import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { X, MapPin, Navigation, Compass, Check, RefreshCw } from 'lucide-react';

const PRESETS = [
  {
    name: 'Connaught Place Central, New Delhi',
    lat: 28.6304,
    lng: 77.2177,
    tag: 'Capital Corridor'
  },
  {
    name: 'Cyber City Expressway, Gurugram',
    lat: 28.4950,
    lng: 77.0890,
    tag: 'Highway Corridor'
  },
  {
    name: 'Western Express Highway, Mumbai',
    lat: 19.0760,
    lng: 72.8777,
    tag: 'Coastal Expressway'
  },
  {
    name: 'Electronic City Flyover, Bengaluru',
    lat: 12.8452,
    lng: 77.6602,
    tag: 'Tech Corridor'
  }
];

export const LocationPickerModal = () => {
  const { 
    isLocationPickerOpen, 
    setIsLocationPickerOpen, 
    coords, 
    setCustomLocation, 
    fetchCoordinates, 
    isLocating 
  } = useEmergency();

  const [customLat, setCustomLat] = useState(coords.lat.toString());
  const [customLng, setCustomLng] = useState(coords.lng.toString());
  const [customLabel, setCustomLabel] = useState(coords.addressHint);

  if (!isLocationPickerOpen) return null;

  const handleApplyPreset = (p) => {
    setCustomLocation(p.lat, p.lng, p.name);
    setIsLocationPickerOpen(false);
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!isNaN(parseFloat(customLat)) && !isNaN(parseFloat(customLng))) {
      setCustomLocation(parseFloat(customLat), parseFloat(customLng), customLabel || 'Custom GPS Pin');
      setIsLocationPickerOpen(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9500,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        className="glass-modal"
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--color-emergency)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Breakdown Location Radar</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>View and set exact GPS coordinates</p>
            </div>
          </div>

          <button
            onClick={() => setIsLocationPickerOpen(false)}
            className="touch-target"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Current Active Pin Card */}
          <div style={{
            padding: '14px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-emergency)', textTransform: 'uppercase' }}>
                CURRENT ACTIVE LOCATION
              </span>
              <button
                onClick={fetchCoordinates}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-info)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={12} className={isLocating ? 'spin' : ''} />
                Refresh Device GPS
              </button>
            </div>

            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {coords.addressHint}
            </div>

            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              Lat: <strong>{coords.lat.toFixed(6)}</strong> | Lng: <strong>{coords.lng.toFixed(6)}</strong>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 700,
                textDecoration: 'none',
                marginTop: '4px'
              }}
            >
              Verify this Pin on Google Maps ↗
            </a>
          </div>

          {/* Quick Highway Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Select Known Highway / Road Preset
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PRESETS.map((p) => {
                const isSelected = Math.abs(coords.lat - p.lat) < 0.001 && Math.abs(coords.lng - p.lng) < 0.001;
                return (
                  <button
                    key={p.name}
                    onClick={() => handleApplyPreset(p)}
                    className="touch-target"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                      border: isSelected ? '1px solid var(--color-success)' : '1px solid var(--border-glass)',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {p.tag} • {p.lat}, {p.lng}
                      </div>
                    </div>
                    {isSelected && <Check size={18} style={{ color: 'var(--color-success)' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Input */}
          <form onSubmit={handleApplyCustom} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Or Enter Custom Coordinates
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)'
                  }}
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)'
                  }}
                  required
                />
              </div>
            </div>

            <input
              type="text"
              placeholder="Road name or landmark hint"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            />

            <button
              type="submit"
              className="touch-target"
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'var(--color-emergency)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              Set Breakdown Pin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

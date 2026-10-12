import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  AlertCircle, 
  MapPin, 
  RefreshCw, 
  Navigation, 
  Loader2, 
  Flame, 
  PhoneCall 
} from 'lucide-react';

export const SosPulseButton = () => {
  const { 
    coords, 
    isLocating, 
    locationStatus, 
    fetchCoordinates, 
    triggerEmergency, 
    isRequesting,
    setIsLocationPickerOpen 
  } = useEmergency();


  const [confirmCount, setConfirmCount] = useState(null);

  const handleSosClick = () => {
    if (isRequesting) return;
    triggerEmergency('Towing', 'critical', 'Critical 1-Tap SOS Activated');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 16px 20px',
      textAlign: 'center'
    }}>
      {/* Location Badge (Zero-Typing Geolocation Display) */}
      <div 
        onClick={() => setIsLocationPickerOpen(true)}
        title="Click to view or change your location"
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 18px',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          cursor: 'pointer',
          maxWidth: '100%',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLocating ? (
            <Loader2 size={16} className="spin" style={{ color: 'var(--color-warning)' }} />
          ) : (
            <MapPin size={16} style={{ color: locationStatus === 'ready' ? 'var(--color-success)' : 'var(--color-warning)' }} />
          )}
          
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '260px'
          }}>
            {isLocating ? 'Locking Precise GPS...' : coords.addressHint}
          </span>

          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            backgroundColor: 'rgba(255,255,255,0.08)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: 'var(--color-info)'
          }}>
            Change Pin ▾
          </span>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          GPS: {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E (Tap to customize)
        </div>
      </div>


      {/* Massive Pulsing SOS Button */}
      <div className="sos-button-wrapper">
        <div className="sos-ring sos-ring-1" />
        <div className="sos-ring sos-ring-2" />

        <button
          onClick={handleSosClick}
          disabled={isRequesting}
          className="sos-button-core touch-target"
          style={{
            position: 'relative',
            zIndex: 10,
            opacity: isRequesting ? 0.8 : 1
          }}
          aria-label="Emergency SOS - 1 Tap Help"
        >
          {isRequesting ? (
            <>
              <Loader2 size={44} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13px', fontWeight: 800, marginTop: '8px', letterSpacing: '1px' }}>
                DISPATCHING...
              </span>
            </>
          ) : (
            <>
              <span style={{
                fontSize: '34px',
                fontWeight: 900,
                letterSpacing: '2px',
                lineHeight: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.4)'
              }}>
                SOS
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                marginTop: '6px',
                textTransform: 'uppercase',
                opacity: 0.95
              }}>
                ONE-TAP RESCUE
              </span>
            </>
          )}
        </button>
      </div>

      {/* Instruction text */}
      <div style={{ marginTop: '28px', maxWidth: '320px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
          Panicked or in Danger?
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Tap the red beacon above. We automatically broadcast your live coordinates to the nearest tow truck and rescue patrol.
        </p>
      </div>

      {/* Quick Direct 112 / Emergency Call Link */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <a 
          href="tel:112"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border-subtle)'
          }}
        >
          <PhoneCall size={13} style={{ color: 'var(--color-emergency)' }} />
          Need Police or Ambulance? Dial 112 Directly
        </a>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, ShieldCheck, Siren, PhoneCall, Gauge, Check } from 'lucide-react';

export const CrashAlertModal = ({ 
  isOpen, 
  countdown, 
  crashData, 
  onCancel, 
  onDispatchNow 
}) => {
  if (!isOpen || !crashData) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#ffffff',
      userSelect: 'none'
    }}>
      {/* Outer Pulse Glow */}
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '3px solid #ef4444',
        borderRadius: '28px',
        padding: '30px 24px',
        textAlign: 'center',
        boxShadow: '0 0 60px rgba(239, 68, 68, 0.7)',
        animation: 'sos-heartbeat 1.5s infinite'
      }}>
        {/* Warning Beacon Icon */}
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px #ef4444'
        }}>
          <Siren size={38} color="#fff" />
        </div>

        <h2 style={{
          fontSize: '22px',
          fontWeight: 900,
          letterSpacing: '0.5px',
          color: '#ffffff',
          marginBottom: '6px'
        }}>
          CRASH DETECTED!
        </h2>
        
        <p style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.85)',
          marginBottom: '16px',
          lineHeight: 1.4
        }}>
          {crashData.type}
        </p>

        {/* Telemetry pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 'var(--radius-full)',
          fontSize: '12px',
          fontWeight: 700,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          marginBottom: '20px'
        }}>
          <span>Impact: <strong style={{ color: '#ef4444' }}>{crashData.gForce} G</strong></span>
          <span>•</span>
          <span>Tilt Angle: <strong style={{ color: '#f59e0b' }}>{crashData.angle}°</strong></span>
        </div>

        {/* 15s Countdown Ring */}
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          border: '4px solid #ef4444',
          margin: '0 auto 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(239, 68, 68, 0.2)',
          boxShadow: '0 0 25px rgba(239, 68, 68, 0.5)'
        }}>
          <span style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1 }}>
            {countdown}
          </span>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>
            SECONDS
          </span>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#cbd5e1',
          lineHeight: 1.4,
          marginBottom: '24px'
        }}>
          If you are unconscious or unable to respond, ResQRoad will automatically broadcast your GPS coordinates to highway patrols and dispatch emergency paramedics.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try { if (navigator.vibrate) navigator.vibrate([100]); } catch (err) {}
              onCancel();
            }}
            className="touch-target"
            style={{
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-success)',
              color: '#000',
              fontWeight: 900,
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Check size={20} />
            I AM OKAY (CANCEL ALARM)
          </button>

          <button
            onClick={onDispatchNow}
            className="touch-target"
            style={{
              padding: '12px',
              borderRadius: '14px',
              backgroundColor: 'rgba(239, 68, 68, 0.3)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13px',
              border: '1px solid #ef4444',
              cursor: 'pointer'
            }}
          >
            DISPATCH PARAMEDIC & TOW IMMEDIATELY
          </button>
        </div>
      </div>
    </div>
  );
};

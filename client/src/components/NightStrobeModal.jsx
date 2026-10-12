import React, { useState, useEffect, useRef } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { Zap, Volume2, VolumeX, X, AlertTriangle } from 'lucide-react';

export const NightStrobeModal = () => {
  const { isStrobeOpen, setIsStrobeOpen } = useEmergency();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);

  // Web Audio synthetic pulse generator
  const playPulseBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz alert tone
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  useEffect(() => {
    if (isStrobeOpen && audioEnabled) {
      intervalRef.current = setInterval(() => {
        playPulseBeep();
      }, 700);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStrobeOpen, audioEnabled]);

  if (!isStrobeOpen) return null;

  return (
    <div 
      className="strobe-active"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '30px 20px',
        userSelect: 'none'
      }}
    >
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 800,
          fontSize: '15px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <Zap size={22} />
          High-Visibility Hazard Beacon
        </div>

        <button
          onClick={() => setIsStrobeOpen(false)}
          className="touch-target"
          style={{
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Center Message */}
      <div style={{
        textAlign: 'center',
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        padding: '24px 20px',
        borderRadius: '20px',
        maxWidth: '340px'
      }}>
        <AlertTriangle size={48} style={{ color: '#ffb703', margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>
          PLACE PHONE ON WINDSHIELD
        </h2>
        <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: 1.4 }}>
          This strobe screen makes your vehicle visible up to 1 km away on unlit highways and prevents oncoming collisions.
        </p>

        {/* Audio Siren Toggle */}
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="touch-target"
          style={{
            marginTop: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '999px',
            background: audioEnabled ? '#ef4444' : 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          {audioEnabled ? 'Audible Pulsing Siren ON' : 'Turn ON Audible Siren Tone'}
        </button>
      </div>

      {/* Bottom Dismiss */}
      <button
        onClick={() => setIsStrobeOpen(false)}
        className="touch-target"
        style={{
          width: '100%',
          maxWidth: '320px',
          padding: '14px',
          borderRadius: '14px',
          background: 'rgba(0,0,0,0.9)',
          color: '#fff',
          border: '2px solid #fff',
          fontWeight: 800,
          fontSize: '15px',
          cursor: 'pointer'
        }}
      >
        DISMISS STROBE BEACON
      </button>
    </div>
  );
};

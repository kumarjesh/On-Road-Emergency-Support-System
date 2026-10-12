import React, { useState } from 'react';
import { Activity, ShieldAlert, Zap, RotateCcw, AlertOctagon, ChevronDown, ChevronUp } from 'lucide-react';

export const CrashSensorWidget = ({ telemetry, onSimulateImpact }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="glass-panel"
      style={{
        margin: '0 20px 20px',
        padding: '14px 16px',
        border: '1px solid var(--border-glass)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--color-info)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Crash Telematics Sentinel
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--color-success)',
                fontWeight: 700
              }}>
                ACTIVE
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Live G-Force: <strong style={{ color: 'var(--color-info)' }}>{telemetry.gForce} G</strong> • Tilt: <strong>{telemetry.pitch}° / {telemetry.roll}°</strong>
            </div>
          </div>
        </div>

        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded Hardware Simulation Testbed */}
      {isExpanded && (
        <div style={{
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            ResQRoad actively measures the phone's accelerometer and gyroscope. In a catastrophic rollover or head-on collision, it automatically calls for help even if everyone is unconscious.
          </p>

          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            DEMO / HACKATHON TESTBED (SIMULATE CRASH):
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => onSimulateImpact('Severe Head-On Collision (55 km/h)', 4.2)}
              className="touch-target"
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: 'var(--color-emergency)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              💥 Simulate 4.2G Collision
            </button>

            <button
              onClick={() => onSimulateImpact('Highway Multi-Rollover Crash', 3.8)}
              className="touch-target"
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: 'var(--color-warning)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              🔄 Simulate Rollover (115°)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

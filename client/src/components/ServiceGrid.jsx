import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  Truck, 
  Disc, 
  Fuel, 
  BatteryCharging, 
  KeyRound, 
  HeartPulse, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

const SERVICES = [
  {
    id: 'towing',
    title: 'Flatbed Towing',
    subtitle: 'Mechanical breakdown or accident',
    icon: Truck,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    eta: '6-9 min'
  },
  {
    id: 'flat-tire',
    title: 'Flat Tire Change',
    subtitle: 'Puncture repair or spare mount',
    icon: Disc,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    eta: '5-8 min'
  },
  {
    id: 'battery',
    title: 'Dead Battery Jump',
    subtitle: 'High-power booster & testing',
    icon: BatteryCharging,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    eta: '4-7 min'
  },
  {
    id: 'fuel',
    title: 'Out of Fuel',
    subtitle: '5 Litres Petrol / Diesel delivered',
    icon: Fuel,
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    eta: '8-12 min'
  },
  {
    id: 'lockout',
    title: 'Car Lockout',
    subtitle: 'Non-destructive door opening',
    icon: KeyRound,
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    eta: '6-10 min'
  },
  {
    id: 'medical',
    title: 'Medical Aid & First Aid',
    subtitle: 'Certified EMT & Trauma kit',
    icon: HeartPulse,
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    eta: '3-5 min'
  }
];

export const ServiceGrid = () => {
  const { triggerEmergency, isRequesting } = useEmergency();

  const handleSelectService = (service) => {
    if (isRequesting) return;
    triggerEmergency(service.title, service.id === 'medical' ? 'critical' : 'high');
  };

  return (
    <section style={{ padding: '0 20px 30px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px'
        }}>
          Select Specific Roadside Service
        </h3>
        <span style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
          Verified Patrols
        </span>
      </div>

      {/* Responsive Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {SERVICES.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => handleSelectService(s)}
              disabled={isRequesting}
              className="glass-panel touch-target"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px',
                textAlign: 'left',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'transform 0.18s, border-color 0.18s, box-shadow 0.18s',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--bg-glass)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = s.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-glass)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: s.bg,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={22} />
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {s.eta}
                </span>
              </div>

              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '2px',
                  lineHeight: 1.2
                }}>
                  {s.title}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.3
                }}>
                  {s.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

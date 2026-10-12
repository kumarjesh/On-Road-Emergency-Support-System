import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  X, 
  ShieldAlert, 
  CheckCircle, 
  AlertOctagon, 
  Eye, 
  Shield, 
  Users, 
  Triangle 
} from 'lucide-react';

const SAFETY_TIPS = [
  {
    id: 1,
    title: 'Hazard Lights On Immediately',
    desc: 'Turn on 4-way hazard blinkers so approaching traffic sees your stranded vehicle from a distance.',
    icon: AlertOctagon,
    color: '#f59e0b'
  },
  {
    id: 2,
    title: 'Exit Away from Active Traffic',
    desc: 'Do NOT exit into the highway lane. Exit from the passenger-side door onto the shoulder or grass embankment.',
    icon: Users,
    color: '#ef4444'
  },
  {
    id: 3,
    title: 'Get Behind Crash Barriers',
    desc: 'Stand behind the metal highway guard rail or fence. Never remain sitting inside a vehicle on high-speed expressways.',
    icon: Shield,
    color: '#10b981'
  },
  {
    id: 4,
    title: 'Deploy Warning Triangle',
    desc: 'If safe to do so, place the reflective warning triangle 50 meters (approx 60 paces) behind your car.',
    icon: Triangle,
    color: '#38bdf8'
  },
  {
    id: 5,
    title: 'Keep Eyes on Approaching Traffic',
    desc: 'Always face towards incoming vehicles while waiting on the road shoulder. Do not turn your back.',
    icon: Eye,
    color: '#a855f7'
  }
];

export const SafetyChecklistModal = () => {
  const { isSafetyOpen, setIsSafetyOpen } = useEmergency();
  const [checkedIds, setCheckedIds] = useState(new Set([1]));

  if (!isSafetyOpen) return null;

  const toggleCheck = (id) => {
    const next = new Set(checkedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedIds(next);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9000,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        className="glass-modal"
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '90vh',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
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
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--color-emergency)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Crisis Safety Checklist</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Follow these rules while help is en route</p>
            </div>
          </div>

          <button
            onClick={() => setIsSafetyOpen(false)}
            className="touch-target"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Checklist */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {SAFETY_TIPS.map((tip) => {
            const isChecked = checkedIds.has(tip.id);
            const Icon = tip.icon;
            return (
              <div
                key={tip.id}
                onClick={() => toggleCheck(tip.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                  border: isChecked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-glass)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                  color: isChecked ? 'var(--color-success)' : 'var(--text-muted)'
                }}>
                  <CheckCircle size={22} fill={isChecked ? 'var(--color-success)' : 'none'} color={isChecked ? '#fff' : 'currentColor'} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: isChecked ? 'var(--text-primary)' : 'var(--text-primary)',
                    textDecoration: isChecked ? 'line-through' : 'none',
                    opacity: isChecked ? 0.8 : 1,
                    marginBottom: '3px'
                  }}>
                    {tip.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                    {tip.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => setIsSafetyOpen(false)}
            className="touch-target"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-emergency)',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            I am in a safe location
          </button>
        </div>
      </div>
    </div>
  );
};

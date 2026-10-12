import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { Car, User, Phone, ShieldCheck, HeartPulse, Edit3 } from 'lucide-react';

export const ProfileCard = () => {
  const { userProfile, setIsProfileOpen } = useEmergency();

  return (
    <div 
      className="glass-panel"
      style={{
        margin: '0 20px 20px',
        padding: '16px',
        border: '1px solid var(--border-glass)',
        background: 'var(--bg-glass)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--color-emergency)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Car size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Emergency Profile & Vehicle
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Saved for instant zero-typing SOS
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsProfileOpen(true)}
          className="touch-target"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-card)',
            color: 'var(--color-info)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Edit3 size={13} />
          Edit Profile
        </button>
      </div>

      {/* Profile Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '12px',
        borderRadius: '12px',
        fontSize: '12px'
      }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
            Registered Vehicle
          </div>
          <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            {userProfile.vehicleMake}
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-warning)' }}>
            {userProfile.vehiclePlate}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
            Driver & Blood Group
          </div>
          <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            {userProfile.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-emergency)', fontWeight: 700 }}>
            Blood Group: {userProfile.bloodGroup || 'O+'}
          </div>
        </div>

        <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
            Emergency Family Contact (SMS Alert)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {userProfile.emergencyContactName}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-info)', fontWeight: 700 }}>
              {userProfile.emergencyContactPhone}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

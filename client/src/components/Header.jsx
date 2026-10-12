import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  ShieldAlert, 
  Sun, 
  Moon, 
  Radio, 
  Car, 
  Zap, 
  Smartphone, 
  Columns, 
  RotateCcw,
  MapPin,
  Users,
  MessageSquare
} from 'lucide-react';

export const Header = () => {
  const { 
    theme, 
    toggleTheme, 
    displayMode, 
    changeDisplayMode, 
    activeView, 
    setActiveView, 
    setIsStrobeOpen, 
    setIsProfileOpen, 
    setIsLocationPickerOpen,
    setIsContactsModalOpen,
    setIsWhatsAppWizardOpen,
    emergencyContacts,
    activeEmergency, 
    clearAllEmergencies 
  } = useEmergency();

  return (
    <header style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Top Brand Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        gap: '10px'
      }}>
        {/* Brand & Live status beacon */}
        <div 
          onClick={() => setActiveView('home')} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)'
          }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>
                ResQ<span style={{ color: 'var(--color-emergency)' }}>Road</span>
              </span>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: activeEmergency ? '#ef4444' : '#10b981',
                boxShadow: activeEmergency ? '0 0 8px #ef4444' : '0 0 8px #10b981'
              }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {activeEmergency ? `CRISIS #${activeEmergency.id}` : 'READY • 24/7 ROADSIDE'}
            </div>
          </div>
        </div>

        {/* Global Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Location Picker trigger */}
          <button
            onClick={() => setIsLocationPickerOpen(true)}
            title="GPS Location Radar"
            className="touch-target"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-emergency)',
              cursor: 'pointer'
            }}
          >
            <MapPin size={18} />
          </button>

          {/* WhatsApp Web Wizard Button */}
          <button
            onClick={() => setIsWhatsAppWizardOpen(true)}
            title="WhatsApp Web SOS Wizard"
            className="touch-target"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid rgba(37, 211, 102, 0.4)',
              backgroundColor: 'rgba(37, 211, 102, 0.15)',
              color: '#25D366',
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(37, 211, 102, 0.2)'
            }}
          >
            <MessageSquare size={18} />
          </button>

          {/* Emergency Contacts Hub Button */}
          <button
            onClick={() => setIsContactsModalOpen(true)}
            title="Emergency Contacts Hub"
            className="touch-target"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              color: 'var(--color-info)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Users size={18} />
            {emergencyContacts && emergencyContacts.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#10b981',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 6px #10b981'
              }}>
                {emergencyContacts.length}
              </span>
            )}
          </button>

          {/* Night Strobe Beacon Button */}
          <button
            onClick={() => setIsStrobeOpen(true)}
            title="Night Highway Hazard Beacon"
            className="touch-target"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--color-warning)',
              cursor: 'pointer'
            }}
          >
            <Zap size={18} />
          </button>

          {/* Vehicle Profile */}
          <button
            onClick={() => setIsProfileOpen(true)}
            title="Vehicle Details & Profile"
            className="touch-target"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <Car size={18} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="touch-target"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Reset / Clear All Simulation */}
          <button
            onClick={clearAllEmergencies}
            title="Reset All Tickets & Start Clean"
            className="touch-target"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* View Mode Controller (Client vs Server vs Split) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 14px 10px',
        gap: '6px',
        overflowX: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
          VIEW:
        </span>

        <button
          onClick={() => {
            changeDisplayMode('split');
            setActiveView('home');
          }}
          className="touch-target"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
            border: displayMode === 'split' ? '1px solid var(--color-warning)' : '1px solid var(--border-glass)',
            background: displayMode === 'split' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-card)',
            color: displayMode === 'split' ? 'var(--color-warning)' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Columns size={14} />
          Split Screen (Client + Server)
        </button>

        <button
          onClick={() => {
            changeDisplayMode('client');
            setActiveView('home');
          }}
          className="touch-target"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
            border: displayMode === 'client' ? '1px solid var(--color-emergency)' : '1px solid var(--border-glass)',
            background: displayMode === 'client' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-card)',
            color: displayMode === 'client' ? 'var(--color-emergency)' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Smartphone size={14} />
          Client View (Driver App)
        </button>

        <button
          onClick={() => {
            changeDisplayMode('dispatcher');
            setActiveView('dispatcher');
          }}
          className="touch-target"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
            border: displayMode === 'dispatcher' ? '1px solid var(--color-info)' : '1px solid var(--border-glass)',
            background: displayMode === 'dispatcher' ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-card)',
            color: displayMode === 'dispatcher' ? 'var(--color-info)' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Radio size={14} />
          Server View (Dispatcher Radar)
        </button>
      </div>
    </header>
  );
};

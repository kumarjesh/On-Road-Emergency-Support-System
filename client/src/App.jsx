import React, { useEffect } from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { API_BASE_URL } from './config';
import { Header } from './components/Header';
import { SosPulseButton } from './components/SosPulseButton';
import { ServiceGrid } from './components/ServiceGrid';
import { LiveTracking } from './components/LiveTracking';
import { NightStrobeModal } from './components/NightStrobeModal';
import { SafetyChecklistModal } from './components/SafetyChecklistModal';
import { VehicleProfileModal } from './components/VehicleProfileModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { DispatcherDashboard } from './components/DispatcherDashboard';
import { CrashAlertModal } from './components/CrashAlertModal';
import { CrashSensorWidget } from './components/CrashSensorWidget';
import { ProfileCard } from './components/ProfileCard';
import { EmergencyContactsModal } from './components/EmergencyContactsModal';
import { WhatsAppWizardModal } from './components/WhatsAppWizardModal';
import { useCrashDetection } from './hooks/useCrashDetection';
import { 
  Home, 
  Navigation, 
  FileText, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Radio, 
  Smartphone,
  ChevronRight,
  MessageSquare,
  Users
} from 'lucide-react';

function DriverHomeView({ telemetry, onSimulateImpact }) {
  const { activeEmergency, setActiveView, setIsWhatsAppWizardOpen } = useEmergency();

  return (
    <div>
      {/* Active crisis banner if one is ongoing */}
      {activeEmergency && (
        <div 
          onClick={() => setActiveView('tracking')}
          style={{
            margin: '12px 16px 14px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(185, 28, 28, 0.35) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 10px #ef4444'
            }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                Active Rescue #{activeEmergency.id} ({activeEmergency.emergencyType})
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>
                {activeEmergency.provider?.name || 'Patrol Unit'} • Tap to view live tracking map
              </div>
            </div>
          </div>
          <ChevronRight size={18} style={{ color: '#fff' }} />
        </div>
      )}

      {/* Massive Pulsing SOS Section */}
      <SosPulseButton />

      {/* Autonomous Crash Telematics Sentinel & Simulator */}
      <CrashSensorWidget telemetry={telemetry} onSimulateImpact={onSimulateImpact} />

      {/* Emergency Profile & Vehicle Summary Card */}
      <ProfileCard />

      {/* Service Grid Section */}
      <ServiceGrid />

      {/* Trust & Response Stats */}
      <section style={{ padding: '0 20px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          textAlign: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '12px 6px' }}>
            <Clock size={18} style={{ color: 'var(--color-warning)', margin: '0 auto 4px' }} />
            <div style={{ fontSize: '14px', fontWeight: 800 }}>6.2 min</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Avg Arrival</div>
          </div>
          <div className="glass-panel" style={{ padding: '12px 6px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--color-success)', margin: '0 auto 4px' }} />
            <div style={{ fontSize: '14px', fontWeight: 800 }}>100%</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Verified Fleet</div>
          </div>
          <div 
            className="glass-panel" 
            onClick={() => setIsWhatsAppWizardOpen(true)}
            style={{ padding: '12px 6px', cursor: 'pointer', transition: 'transform 0.15s' }}
            title="Open WhatsApp Web SOS Wizard"
          >
            <MessageSquare size={18} style={{ color: '#25D366', margin: '0 auto 4px' }} />
            <div style={{ fontSize: '14px', fontWeight: 800 }}>WhatsApp</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Live Web SOS</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function BottomNavigationBar() {
  const { 
    activeView, 
    setActiveView, 
    activeEmergency, 
    setIsStrobeOpen, 
    setIsSafetyOpen,
    setIsWhatsAppWizardOpen,
    setIsContactsModalOpen
  } = useEmergency();

  return (
    <nav style={{
      position: 'sticky',
      bottom: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '10px 16px',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-glass)'
    }}>
      <button
        onClick={() => setActiveView('home')}
        className="touch-target"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          color: activeView === 'home' ? 'var(--color-emergency)' : 'var(--text-secondary)',
          cursor: 'pointer',
          fontWeight: activeView === 'home' ? 700 : 500,
          fontSize: '11px'
        }}
      >
        <Home size={20} />
        <span>SOS Home</span>
      </button>

      {activeEmergency && (
        <button
          onClick={() => setActiveView('tracking')}
          className="touch-target"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            background: 'transparent',
            border: 'none',
            color: activeView === 'tracking' ? 'var(--color-emergency)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: activeView === 'tracking' ? 700 : 500,
            fontSize: '11px'
          }}
        >
          <Navigation size={20} />
          <span>Live Map</span>
        </button>
      )}

      <button
        onClick={() => setIsWhatsAppWizardOpen(true)}
        className="touch-target"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          color: '#25D366',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 700
        }}
      >
        <MessageSquare size={20} />
        <span>WhatsApp</span>
      </button>

      <button
        onClick={() => setIsContactsModalOpen(true)}
        className="touch-target"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          color: 'var(--color-info)',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        <Users size={20} />
        <span>Contacts</span>
      </button>

      <button
        onClick={() => setIsSafetyOpen(true)}
        className="touch-target"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        <FileText size={20} />
        <span>Guide</span>
      </button>

      <button
        onClick={() => setIsStrobeOpen(true)}
        className="touch-target"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          color: 'var(--color-warning)',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        <Zap size={20} />
        <span>Beacon</span>
      </button>
    </nav>
  );
}

function MainContent() {
  const { 
    displayMode, 
    activeView, 
    setActiveView, 
    activeEmergency, 
    setActiveEmergency, 
    triggerEmergency 
  } = useEmergency();

  // Autonomous Crash Telematics Hook
  const {
    telemetry,
    isAlertActive,
    countdown,
    crashData,
    cancelCrashAlert,
    dispatchImmediately,
    simulateImpact
  } = useCrashDetection((confirmedCrash) => {
    // Autonomous Level-1 Collision Trigger
    triggerEmergency(
      'Severe Vehicle Crash (Auto-Detected)',
      'critical',
      `Impact G-Force: ${confirmedCrash.gForce}G | Roll Angle: ${confirmedCrash.angle}°`
    );
  });

  // URL search param listener: ?track=REQ-XXXXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackId = params.get('track');
    if (trackId) {
      fetch(`${API_BASE_URL}/api/emergency/${trackId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setActiveEmergency(data);
            setActiveView('tracking');
          }
        })
        .catch(() => {
          // Fallback to local store
          try {
            const saved = localStorage.getItem('resq_emergencies_list');
            if (saved) {
              const list = JSON.parse(saved);
              const found = list.find(e => e.id === trackId);
              if (found) {
                setActiveEmergency(found);
                setActiveView('tracking');
              }
            }
          } catch (e) {}
        });
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '16px' }}>
        {/* SPLIT SCREEN VIEW: Client + Server side-by-side */}
        {displayMode === 'split' ? (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            maxWidth: '1260px',
            margin: '0 auto',
            alignItems: 'flex-start',
            justifyContent: 'center'
          }}>
            {/* Left Box: Client / Driver Phone View */}
            <div style={{
              flex: '1 1 430px',
              maxWidth: '480px',
              background: 'var(--bg-app)',
              border: '4px solid #1e293b',
              borderRadius: '32px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              minHeight: '800px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '12px 16px',
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smartphone size={16} style={{ color: 'var(--color-emergency)' }} />
                  CLIENT SIDE: CITIZEN APP
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  Driver Telematics View
                </span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {activeView === 'tracking' || activeEmergency ? (
                  <LiveTracking />
                ) : (
                  <DriverHomeView telemetry={telemetry} onSimulateImpact={simulateImpact} />
                )}
              </div>

              <BottomNavigationBar />
            </div>

            {/* Right Box: Server / Dispatcher Radar Console */}
            <div style={{
              flex: '1 1 540px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: '24px',
              overflow: 'hidden',
              minHeight: '800px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '12px 18px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--color-info)',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={16} />
                  SERVER SIDE: DISPATCH COMMAND RADAR
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                  Human In The Loop
                </span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                <DispatcherDashboard />
              </div>
            </div>
          </div>
        ) : displayMode === 'dispatcher' ? (
          /* DISPATCHER ONLY FULL SCREEN */
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <DispatcherDashboard />
          </div>
        ) : (
          /* CLIENT DRIVER ONLY MOBILE FRAME */
          <div className="app-viewport desktop-frame">
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeView === 'tracking' ? (
                <LiveTracking />
              ) : (
                <DriverHomeView telemetry={telemetry} onSimulateImpact={simulateImpact} />
              )}
            </div>
            <BottomNavigationBar />
          </div>
        )}
      </main>

      {/* Global Modals */}
      <NightStrobeModal />
      <SafetyChecklistModal />
      <VehicleProfileModal />
      <LocationPickerModal />
      <EmergencyContactsModal />
      <WhatsAppWizardModal />
      
      {/* Autonomous Crash Detection HUD Modal */}
      <CrashAlertModal
        isOpen={isAlertActive}
        countdown={countdown}
        crashData={crashData}
        onCancel={cancelCrashAlert}
        onDispatchNow={dispatchImmediately}
      />
    </div>
  );
}

export default function App() {
  return (
    <EmergencyProvider>
      <MainContent />
    </EmergencyProvider>
  );
}

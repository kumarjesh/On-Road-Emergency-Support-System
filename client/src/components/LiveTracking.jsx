import React, { useEffect, useRef, useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  MapPin, 
  Truck, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Share2, 
  FileText, 
  FastForward, 
  XCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation, 
  Zap, 
  RotateCcw, 
  Home, 
  Compass, 
  Map as MapIcon 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { ShareModal } from './ShareModal';


// Custom Animated Leaflet Marker Icons
const userPulseIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: sos-pulse-ring-1 1.8s infinite;"></div>
      <div style="width: 22px; height: 22px; background: #ef4444; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 16px #ef4444; position: relative; z-index: 2;"></div>
      <div style="position: absolute; top: -20px; white-space: nowrap; background: #000; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">YOU (BREAKDOWN)</div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const rescuerVehicleIcon = new L.DivIcon({
  className: 'custom-rescuer-marker',
  html: `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; inset: -4px; border-radius: 12px; background: rgba(16, 185, 129, 0.4); animation: sos-pulse-ring-2 1.8s infinite;"></div>
      <div style="width: 32px; height: 32px; background: #10b981; border: 3px solid #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(16, 185, 129, 0.8); position: relative; z-index: 2; font-size: 16px;">
        🚨
      </div>
      <div style="position: absolute; bottom: -20px; white-space: nowrap; background: #064e3b; color: #6ee7b7; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.4);">RESCUE PATROL</div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

// Component to handle map resizing and fit bounds
function MapController({ userPos, rescuerPos, autoFit = true }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size on mount and after render cycles to prevent grey/partial tiles
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  useEffect(() => {
    if (!autoFit) return;
    if (userPos && rescuerPos) {
      try {
        const bounds = L.latLngBounds([userPos, rescuerPos]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch (e) {}
    } else if (userPos) {
      map.setView(userPos, 15);
    }
  }, [userPos, rescuerPos, map, autoFit]);

  return null;
}

export const LiveTracking = () => {
  const { 
    activeEmergency, 
    fastForwardDemo, 
    cancelEmergency, 
    setIsSafetyOpen, 
    setIsWhatsAppWizardOpen,
    setActiveView, 
    clearAllEmergencies 
  } = useEmergency();

  const [mapZoom, setMapZoom] = useState(14);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!activeEmergency) {

    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <CheckCircle2 size={54} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
          No Active Emergency Ticket
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto 24px' }}>
          Your vehicle status is clear. If you are experiencing a breakdown or crisis on the road, tap below to return home and send an SOS.
        </p>
        <button 
          onClick={() => setActiveView('home')} 
          className="touch-target"
          style={{ 
            padding: '12px 24px', 
            borderRadius: '12px', 
            background: 'var(--color-emergency)', 
            color: '#fff', 
            border: 'none', 
            fontWeight: 700, 
            cursor: 'pointer' 
          }}
        >
          Go to 1-Tap SOS Screen
        </button>
      </div>
    );
  }

  const {
    id,
    emergencyType,
    status = 'assigned',
    userLocation = { lat: 28.6304, lng: 77.2177 },
    rescuerLocation = { lat: 28.6504, lng: 77.2377 },
    provider,
    distanceKm = 2.4,
    etaMinutes = 7,
    address,
    vehicle
  } = activeEmergency;

  const userPos = [userLocation.lat, userLocation.lng];
  const rescuerPos = [rescuerLocation.lat, rescuerLocation.lng];

  // Open Share Modal
  const handleShareTracking = () => {
    setIsShareModalOpen(true);
  };


  // Offline SMS fallback
  const handleOfflineSms = () => {
    const smsBody = `EMERGENCY SOS: Breakdown at GPS: ${userLocation.lat},${userLocation.lng}. Vehicle: ${vehicle?.plate || 'Unknown'}. Service needed: ${emergencyType}`;
    window.location.href = `sms:112?&body=${encodeURIComponent(smsBody)}`;
  };

  // Stepper helper
  const steps = [
    { key: 'pending', label: 'Broadcast' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'en_route', label: 'En Route' },
    { key: 'arrived', label: 'Arrived' }
  ];

  const getStepIndex = (s) => {
    switch (s) {
      case 'pending': return 0;
      case 'assigned': return 1;
      case 'en_route': return 2;
      case 'arrived':
      case 'resolved': return 3;
      default: return 1;
    }
  };

  const currentStepIdx = getStepIndex(status);
  const isResolvedOrArrived = status === 'arrived' || status === 'resolved';

  return (
    <div style={{ padding: '16px 20px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Urgent Status Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '16px 20px',
          background: isResolvedOrArrived ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-glass)',
          borderColor: isResolvedOrArrived ? 'var(--color-success)' : 'var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: isResolvedOrArrived ? 'var(--color-success)' : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}>
            {isResolvedOrArrived ? <CheckCircle2 size={26} /> : <Truck size={26} />}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Ticket #{id} • {emergencyType}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {status === 'pending' && 'Broadcasting to Patrols...'}
              {status === 'assigned' && 'Rescue Unit Assigned'}
              {status === 'en_route' && 'Help Is On The Way'}
              {status === 'arrived' && 'Rescuer Arrived On Scene!'}
              {status === 'resolved' && 'Assistance Complete & Safe'}
            </div>
          </div>
        </div>

        {/* ETA badge */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 800,
            color: isResolvedOrArrived ? 'var(--color-success)' : 'var(--color-warning)'
          }}>
            {isResolvedOrArrived ? '0 min' : `${etaMinutes} min`}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {isResolvedOrArrived ? 'At your spot' : `${distanceKm} km away`}
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        position: 'relative'
      }}>
        {steps.map((step, idx) => {
          const isDone = idx <= currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          return (
            <div 
              key={step.key} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                zIndex: 2
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: isDone ? (isResolvedOrArrived && idx === 3 ? 'var(--color-success)' : 'var(--color-emergency)') : 'var(--bg-card)',
                color: isDone ? '#fff' : 'var(--text-muted)',
                border: isDone ? 'none' : '1px solid var(--border-glass)',
                boxShadow: isCurrent ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
              }}>
                {idx + 1}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
        {/* Connecting Progress Bar */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '24px',
          right: '24px',
          height: '3px',
          backgroundColor: 'var(--border-subtle)',
          zIndex: 1
        }}>
          <div style={{
            height: '100%',
            backgroundColor: isResolvedOrArrived ? 'var(--color-success)' : 'var(--color-emergency)',
            width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
            transition: 'width 0.5s ease-in-out'
          }} />
        </div>
      </div>

      {/* Primary Action if Ticket is Arrived or Complete */}
      {isResolvedOrArrived && (
        <div style={{
          display: 'flex',
          gap: '10px',
          background: 'rgba(16, 185, 129, 0.12)',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-success)' }}>
              Assistance is Complete & Secured!
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              You are safe. Want to start another emergency test or return home?
            </div>
          </div>
          <button
            onClick={() => setActiveView('home')}
            className="touch-target"
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'var(--color-success)',
              color: '#000',
              fontWeight: 800,
              fontSize: '12px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Start New SOS
          </button>
        </div>
      )}

      {/* Interactive Leaflet Map Card */}
      <div 
        className="glass-panel"
        style={{
          height: '320px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--border-glass)',
          background: '#090d16'
        }}
      >
        <MapContainer
          center={userPos}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', minHeight: '320px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController userPos={userPos} rescuerPos={status !== 'resolved' ? rescuerPos : null} />
          
          {/* User Location Accuracy Circle */}
          <Circle
            center={userPos}
            radius={userLocation.accuracy || 25}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, weight: 1.5 }}
          />

          {/* User Marker */}
          <Marker position={userPos} icon={userPulseIcon}>
            <Popup>
              <div style={{ color: '#000', fontSize: '12px' }}>
                <strong style={{ color: '#ef4444' }}>📍 Your Breakdown Location</strong><br />
                {address}<br />
                <span style={{ fontSize: '10px', color: '#666' }}>
                  GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Rescuer Marker */}
          {rescuerLocation && (
            <Marker position={rescuerPos} icon={rescuerVehicleIcon}>
              <Popup>
                <div style={{ color: '#000', fontSize: '12px' }}>
                  <strong style={{ color: '#10b981' }}>🚨 {provider?.name || 'Rescue Patrol'}</strong><br />
                  {provider?.vehicleType} ({provider?.vehiclePlate})<br />
                  ETA: <strong>{etaMinutes} min</strong> ({distanceKm} km)
                </div>
              </Popup>
            </Marker>
          )}

          {/* Polyline Route */}
          {status !== 'resolved' && (
            <Polyline
              positions={[userPos, rescuerPos]}
              pathOptions={{ color: '#ef4444', dashArray: '6, 8', weight: 4, opacity: 0.9 }}
            />
          )}
        </MapContainer>

        {/* Live GPS badge & Recenter overlay */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 6px #10b981'
          }} />
          <span>Live Radar Track: <strong>{userLocation.lat.toFixed(3)}°N, {userLocation.lng.toFixed(3)}°E</strong></span>
        </div>
      </div>

      {/* Driver & Vehicle Dispatch Profile Card */}
      {provider && (
        <div 
          className="glass-panel"
          style={{
            padding: '16px',
            background: 'var(--bg-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src={provider.photo} 
              alt={provider.name} 
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                objectFit: 'cover',
                border: '2px solid var(--border-glass)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {provider.name}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  ★ {provider.rating}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {provider.vehicleType}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Plate: <span style={{ color: 'var(--text-primary)' }}>{provider.vehiclePlate}</span>
              </div>
            </div>
          </div>

          {/* Quick Call & Message Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={`tel:${provider.phone}`}
              className="touch-target"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.18)',
                color: 'var(--color-success)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none'
              }}
              title="Call Patrol Directly"
            >
              <Phone size={20} />
            </a>
            <a
              href={`sms:${provider.phone}`}
              className="touch-target"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.18)',
                color: 'var(--color-info)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none'
              }}
              title="Send Message"
            >
              <MessageSquare size={20} />
            </a>
          </div>
        </div>
      )}

      {/* WhatsApp Web SOS Dispatch Banner */}
      <button
        onClick={() => setIsWhatsAppWizardOpen(true)}
        className="touch-target"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.22) 0%, rgba(18, 140, 126, 0.35) 100%)',
          border: '1px solid rgba(37, 211, 102, 0.5)',
          color: '#25D366',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)'
        }}
      >
        <MessageSquare size={17} />
        Send Live Location via WhatsApp Web
      </button>

      {/* Safety Actions Quick Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <button
          onClick={() => setIsSafetyOpen(true)}
          className="touch-target"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <FileText size={16} style={{ color: 'var(--color-warning)' }} />
          Safety Guide
        </button>

        <button
          onClick={handleShareTracking}
          className="touch-target"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Share2 size={16} style={{ color: 'var(--color-info)' }} />
          Share Live Link
        </button>
      </div>

      {/* Control Bar: Fast Forward & New SOS */}
      <div style={{
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(0,0,0,0.25)',
        border: '1px dashed var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
            TESTING & DEMO CONTROLS
          </span>
          {!isResolvedOrArrived && (
            <button
              onClick={fastForwardDemo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-warning)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <FastForward size={14} />
              Simulate Instant Arrival
            </button>
          )}
        </div>

        <button
          onClick={cancelEmergency}
          className="touch-target"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '13px',
            fontWeight: 800,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px solid var(--color-emergency)',
            color: 'var(--color-emergency)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '6px'
          }}
        >
          <AlertTriangle size={16} />
          Cancel Emergency (False Alarm / Safe Now)
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setActiveView('home')}
            className="touch-target"
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Home size={15} />
            SOS Home
          </button>

          <button
            onClick={clearAllEmergencies}
            className="touch-target"
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: 'var(--color-emergency)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={15} />
            Reset & Clear Tickets
          </button>
        </div>
      </div>

      {/* Share Live Link Modal */}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        activeEmergency={activeEmergency} 
      />
    </div>
  );
};


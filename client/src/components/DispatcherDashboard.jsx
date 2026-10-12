import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { API_BASE_URL } from '../config';
import { 
  Radio, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Navigation, 
  Phone, 
  ChevronRight, 
  ArrowLeft,
  FastForward 
} from 'lucide-react';

export const DispatcherDashboard = () => {
  const { 
    setActiveView, 
    socket, 
    activeEmergency, 
    setActiveEmergency, 
    emergenciesStore, 
    saveEmergenciesStore, 
    clearAllEmergencies,
    coords,
    userProfile
  } = useEmergency();
  
  const [emergencies, setEmergencies] = useState(() => {
    try {
      const saved = localStorage.getItem('resq_emergencies_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return emergenciesStore || [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmergencies = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/emergency`);
      if (res.ok) {
        const data = await res.json();
        setEmergencies(data);
        saveEmergenciesStore(data);
        return;
      }
    } catch (e) {
      console.warn('Backend server offline or running in Vercel Cloud mode. Loading from local store.');
    } finally {
      setIsLoading(false);
    }

    // Fallback: load from emergenciesStore or localStorage
    try {
      const saved = localStorage.getItem('resq_emergencies_list');
      if (saved) {
        setEmergencies(JSON.parse(saved));
      } else if (emergenciesStore && emergenciesStore.length > 0) {
        setEmergencies(emergenciesStore);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchEmergencies();

    // Listen to custom cross-component sync events (for Vercel standalone operation)
    const handleSync = (e) => {
      if (e.detail) {
        setEmergencies(e.detail);
      }
    };
    window.addEventListener('resq_emergencies_sync', handleSync);

    const handleStorage = (e) => {
      if (e.key === 'resq_emergencies_list' && e.newValue) {
        try {
          setEmergencies(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    if (socket) {
      socket.emit('join_dispatchers');

      socket.on('new_emergency', (newItem) => {
        // Play alert chime
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.45);
        } catch (e) {}

        setEmergencies(prev => {
          const updated = [newItem, ...prev.filter(e => e.id !== newItem.id)];
          saveEmergenciesStore(updated);
          return updated;
        });
      });

      socket.on('emergency_update', (updatedItem) => {
        setEmergencies(prev => {
          const updated = prev.map(e => (e.id === updatedItem.id ? updatedItem : e));
          saveEmergenciesStore(updated);
          return updated;
        });
      });
    }

    return () => {
      window.removeEventListener('resq_emergencies_sync', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [socket]);

  // Update Status action from Dispatcher console (works with both Node backend and Vercel standalone)
  const handleUpdateStatus = async (id, status) => {
    let backendItem = null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/emergency/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        backendItem = await res.json();
      }
    } catch (e) {}

    // Update in-browser store and UI state
    setEmergencies(prev => {
      const updatedList = prev.map(item => {
        if (item.id !== id) return item;
        const current = backendItem || {
          ...item,
          status,
          timeline: [
            ...(item.timeline || []),
            { status, label: `Status changed to ${status.replace('_', ' ').toUpperCase()}`, time: new Date().toISOString() }
          ]
        };

        if (status === 'assigned' || status === 'en_route') {
          current.status = status;
          current.etaMinutes = current.etaMinutes || 6;
          current.distanceKm = current.distanceKm || 2.4;
          if (!current.provider) {
            current.provider = {
              name: 'Vikram Singh (Highway Patrol)',
              phone: '+91 98765 43210',
              vehicleType: 'Emergency Rapid Response Unit',
              vehiclePlate: 'DL 01 AB 9988',
              rating: 4.9,
              photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
            };
          }
        } else if (status === 'arrived') {
          current.status = 'arrived';
          current.etaMinutes = 0;
          current.distanceKm = 0;
          if (current.userLocation) {
            current.rescuerLocation = { ...current.userLocation };
          }
        } else if (status === 'resolved') {
          current.status = 'resolved';
          current.etaMinutes = 0;
          current.distanceKm = 0;
        }
        return current;
      });

      saveEmergenciesStore(updatedList);

      const target = updatedList.find(e => e.id === id);
      if (target && activeEmergency?.id === id) {
        setActiveEmergency(target);
      }
      return updatedList;
    });
  };

  // Fast forward simulation
  const handleFastForward = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/emergency/${id}/fast-forward`, { method: 'POST' });
    } catch (e) {}

    setEmergencies(prev => {
      const updatedList = prev.map(item => {
        if (item.id !== id) return item;
        return {
          ...item,
          status: 'arrived',
          rescuerLocation: { lat: item.userLocation?.lat || 28.6304, lng: item.userLocation?.lng || 77.2177 },
          distanceKm: 0,
          etaMinutes: 0,
          timeline: [
            ...(item.timeline || []),
            { status: 'arrived', label: 'Rescuer arrived on scene (Fast-Forward Simulation)', time: new Date().toISOString() }
          ]
        };
      });

      saveEmergenciesStore(updatedList);
      const target = updatedList.find(e => e.id === id);
      if (target && activeEmergency?.id === id) {
        setActiveEmergency(target);
      }
      return updatedList;
    });
  };

  // Create Sample Incident for instant testing
  const handleCreateSampleIncident = () => {
    const sample = {
      id: 'REQ-' + Math.floor(100000 + Math.random() * 900000),
      status: 'pending',
      emergencyType: 'Accident / Collision',
      severity: 'critical',
      createdAt: new Date().toISOString(),
      userLocation: { lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy },
      address: coords.addressHint || 'Highway NH-44, Sector 21 Junction',
      rescuerLocation: { lat: coords.lat + 0.015, lng: coords.lng + 0.018 },
      distanceKm: 2.6,
      etaMinutes: 6,
      vehicle: {
        make: userProfile.vehicleMake || 'Hyundai Creta',
        plate: userProfile.vehiclePlate || 'KA 01 AB 4321'
      },
      contact: {
        name: userProfile.name || 'Rajesh Kumar',
        phone: userProfile.phone || '+91 63600 14779'
      },
      provider: {
        name: 'Vikram Singh (Highway Patrol)',
        phone: '+91 98765 43210',
        vehicleType: 'Emergency Rapid Response Unit',
        vehiclePlate: 'DL 01 AB 9988',
        rating: 4.9,
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
      },
      timeline: [
        { status: 'pending', label: 'Emergency SOS Broadcasted', time: new Date().toISOString() }
      ]
    };
    const updated = [sample, ...emergencies.filter(e => e.id !== sample.id)];
    setEmergencies(updated);
    saveEmergenciesStore(updated);
  };

  return (
    <div style={{ padding: '20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => setActiveView('home')}
          className="touch-target"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Back to User App
        </button>

        <button
          onClick={fetchEmergencies}
          className="touch-target"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-glass)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          Refresh Radar
        </button>
      </div>

      {/* Radar Console Header */}
      <div 
        className="glass-panel"
        style={{
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 10px #ef4444',
              animation: 'float-subtle 1.5s infinite'
            }} />
            <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.3px' }}>
              Dispatch Command Radar
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Real-time feed of roadside distress requests across regional corridors
          </p>
        </div>

        <div style={{
          textAlign: 'right',
          background: 'rgba(239, 68, 68, 0.15)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--color-emergency)' }}>
            {emergencies.filter(e => e.status !== 'resolved' && e.status !== 'cancelled').length}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
            Active Tickets
          </span>
        </div>
      </div>

      {/* Emergency List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {emergencies.length === 0 ? (
          <div 
            className="glass-panel"
            style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}
          >
            <Radio size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontWeight: 600 }}>Radar clear. No pending distress signals.</p>
            <p style={{ fontSize: '12px', marginTop: '4px', marginBottom: '16px' }}>
              Switch to the user app and tap SOS to test dispatch, or generate an incident below.
            </p>
            <button
              onClick={handleCreateSampleIncident}
              className="touch-target"
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'var(--color-emergency)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              + Simulate Inbound Distress Call
            </button>
          </div>
        ) : (
          emergencies.map((em) => (
            <div
              key={em.id}
              className="glass-panel"
              style={{
                padding: '16px',
                borderLeft: `5px solid ${
                  em.status === 'pending' ? 'var(--color-emergency)' :
                  em.status === 'en_route' ? 'var(--color-warning)' :
                  em.status === 'arrived' ? 'var(--color-success)' : 'var(--text-muted)'
                }`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      #{em.id}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {em.emergencyType}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <MapPin size={13} style={{ color: 'var(--color-warning)' }} />
                    {em.address}
                  </div>
                </div>

                {/* Status tag */}
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 
                    em.status === 'pending' ? 'rgba(239, 68, 68, 0.2)' :
                    em.status === 'en_route' ? 'rgba(245, 158, 11, 0.2)' :
                    em.status === 'arrived' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                  color:
                    em.status === 'pending' ? 'var(--color-emergency)' :
                    em.status === 'en_route' ? 'var(--color-warning)' :
                    em.status === 'arrived' ? 'var(--color-success)' : 'var(--text-muted)'
                }}>
                  {em.status.replace('_', ' ')}
                </div>
              </div>

              {/* Vehicle & User meta */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '10px 12px',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '10px',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Vehicle: </span>
                  <strong>{em.vehicle?.make}</strong> ({em.vehicle?.plate})
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Driver: </span>
                  <strong>{em.contact?.name}</strong> ({em.contact?.phone})
                </div>
              </div>

              {/* Rescuer & Telemetry */}
              {em.provider && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={14} style={{ color: 'var(--color-info)' }} />
                    <span>Unit: <strong>{em.provider.name}</strong> ({em.provider.vehiclePlate})</span>
                  </div>
                  <div>
                    <span>ETA: <strong>{em.etaMinutes}m</strong> | Dist: <strong>{em.distanceKm}km</strong></span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
                {em.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(em.id, 'assigned')}
                    className="touch-target"
                    style={{
                      flex: 1,
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'var(--color-emergency)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Accept & Assign Unit
                  </button>
                )}

                {em.status === 'assigned' && (
                  <button
                    onClick={() => handleUpdateStatus(em.id, 'en_route')}
                    className="touch-target"
                    style={{
                      flex: 1,
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'var(--color-warning)',
                      color: '#000',
                      fontWeight: 700,
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Dispatch En Route
                  </button>
                )}

                {em.status === 'en_route' && (
                  <>
                    <button
                      onClick={() => handleFastForward(em.id)}
                      className="touch-target"
                      style={{
                        flex: 1,
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: 'var(--color-success)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FastForward size={14} />
                      Simulate Arrival
                    </button>
                  </>
                )}

                {em.status === 'arrived' && (
                  <button
                    onClick={() => handleUpdateStatus(em.id, 'resolved')}
                    className="touch-target"
                    style={{
                      flex: 1,
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'var(--color-info)',
                      color: '#000',
                      fontWeight: 700,
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Mark Resolved & Safe
                  </button>
                )}

                {/* Inspect button */}
                <button
                  onClick={() => {
                    setActiveEmergency(em);
                    setActiveView('tracking');
                  }}
                  className="touch-target"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View on Map
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

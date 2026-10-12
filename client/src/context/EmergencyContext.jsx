import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const EmergencyContext = createContext();

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) throw new Error('useEmergency must be used within EmergencyProvider');
  return context;
};

export const EmergencyProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('resq_theme') || 'dark');
  const [socket, setSocket] = useState(null);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [activeView, setActiveView] = useState('home'); // 'home', 'services', 'tracking', 'dispatcher', 'safety', 'strobe'
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('resq_display_mode') || 'split'); // 'client', 'dispatcher', 'split'
  const [isStrobeOpen, setIsStrobeOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isWhatsAppWizardOpen, setIsWhatsAppWizardOpen] = useState(false);

  // Cloud/Vercel Standalone Emergencies Store (Hybrid Engine)
  const [emergenciesStore, setEmergenciesStore] = useState(() => {
    const saved = localStorage.getItem('resq_emergencies_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const saveEmergenciesStore = (list) => {
    setEmergenciesStore(list);
    localStorage.setItem('resq_emergencies_list', JSON.stringify(list));
    try {
      window.dispatchEvent(new CustomEvent('resq_emergencies_sync', { detail: list }));
    } catch (e) {}
  };

  // Saved Emergency Contacts with LocalStorage persistence
  const [emergencyContacts, setEmergencyContacts] = useState(() => {
    const saved = localStorage.getItem('resq_emergency_contacts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'ec_1',
        name: 'Family Contact (Primary)',
        phone: '+916360014779',
        relation: 'Family',
        isPrimary: true
      },
      {
        id: 'ec_2',
        name: 'Emergency Doctor / Clinic',
        phone: '+919876543210',
        relation: 'Doctor / Medical',
        isPrimary: false
      },
      {
        id: 'ec_3',
        name: 'Close Friend / Sibling',
        phone: '+919123456789',
        relation: 'Close Friend',
        isPrimary: false
      }
    ];
  });

  const saveContacts = (updated) => {
    setEmergencyContacts(updated);
    localStorage.setItem('resq_emergency_contacts', JSON.stringify(updated));
  };

  const addEmergencyContact = (contact) => {
    const newContact = {
      id: `ec_${Date.now()}`,
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      relation: contact.relation || 'Family',
      isPrimary: Boolean(contact.isPrimary)
    };
    let updated = [...emergencyContacts];
    if (newContact.isPrimary) {
      updated = updated.map(c => ({ ...c, isPrimary: false }));
    }
    updated.push(newContact);
    saveContacts(updated);
    return newContact;
  };

  const updateEmergencyContact = (id, fields) => {
    let updated = emergencyContacts.map(c => {
      if (c.id === id) {
        return { ...c, ...fields };
      }
      if (fields.isPrimary && c.id !== id) {
        return { ...c, isPrimary: false };
      }
      return c;
    });
    saveContacts(updated);
  };

  const deleteEmergencyContact = (id) => {
    const filtered = emergencyContacts.filter(c => c.id !== id);
    if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    saveContacts(filtered);
  };

  const setPrimaryEmergencyContact = (id) => {
    const updated = emergencyContacts.map(c => ({
      ...c,
      isPrimary: c.id === id
    }));
    saveContacts(updated);
  };

  // User Vehicle & Profile (No auth needed yet, default sensible values)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('resq_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Rajesh Kumar',
      phone: '+91 63600 14779',
      emergencyContactName: 'Emergency Family Contact',
      emergencyContactPhone: '+916360014779',
      vehicleMake: 'Hyundai Creta (Black)',
      vehiclePlate: 'KA 01 AB 4321',
      bloodGroup: 'O+'
    };

  });

  // Browser Geolocation state (Zero-typing flow with persistence)
  const [coords, setCoords] = useState(() => {
    const saved = localStorage.getItem('resq_coords');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      lat: 19.0728,
      lng: 72.8826,
      accuracy: 20,
      addressHint: 'Detecting live location...'
    };
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('ready'); // 'detecting', 'ready', 'fallback'

  // Update theme on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('resq_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changeDisplayMode = (mode) => {
    setDisplayMode(mode);
    localStorage.setItem('resq_display_mode', mode);
  };

  // Save profile changes
  const saveProfile = (newProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('resq_profile', JSON.stringify(newProfile));
  };

  // Set predefined or manual coordinates
  const setCustomLocation = (newLat, newLng, newLabel) => {
    setCoords({
      lat: parseFloat(newLat),
      lng: parseFloat(newLng),
      accuracy: 10,
      addressHint: newLabel || `Pin: ${parseFloat(newLat).toFixed(4)}, ${parseFloat(newLng).toFixed(4)}`
    });
    setLocationStatus('ready');
    setIsLocating(false);
  };

  // Robust Multi-Tier Live Geolocation Engine
  const fetchCoordinates = () => {
    setIsLocating(true);

    const updatePosition = (latitude, longitude, accuracy = 10, hint = null) => {
      const newCoords = {
        lat: Number(latitude),
        lng: Number(longitude),
        accuracy: Math.round(accuracy),
        addressHint: hint || `Live GPS: ${Number(latitude).toFixed(4)}°N, ${Number(longitude).toFixed(4)}°E`
      };
      setCoords(newCoords);
      localStorage.setItem('resq_coords', JSON.stringify(newCoords));
      setLocationStatus('ready');
      setIsLocating(false);

      // Reverse geocoding via OpenStreetMap Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
            const city = data.address?.city || data.address?.town || data.address?.county || data.address?.state || '';
            const formatted = [road, city].filter(Boolean).join(', ') || data.display_name.split(',').slice(0, 2).join(',');
            setCoords(prev => {
              const updated = { ...prev, addressHint: formatted };
              localStorage.setItem('resq_coords', JSON.stringify(updated));
              return updated;
            });
          }
        })
        .catch(() => {});
    };

    const fallbackToIpGeo = async () => {
      try {
        const res = await fetch('/api/geolocation/ip');
        const data = await res.json();
        if (data.success && data.lat && data.lng) {
          updatePosition(data.lat, data.lng, 50, data.addressHint);
          return;
        }
      } catch (e) {}
      try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        if (data.success && data.latitude && data.longitude) {
          updatePosition(data.latitude, data.longitude, 50, `${data.city}, ${data.region} (${data.country})`);
          return;
        }
      } catch (e) {}
      setIsLocating(false);
      setLocationStatus('fallback');
    };

    if (!navigator.geolocation) {
      fallbackToIpGeo();
      return;
    }

    // Tier 1: Try browser GPS (timeout 5s)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updatePosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      (err) => {
        console.warn('High-accuracy GPS delayed or unavailable, trying standard GPS / IP geo:', err.message);
        // Tier 2: Low-accuracy fast GPS
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            updatePosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
          },
          () => {
            // Tier 3: Real-world IP-based location
            fallbackToIpGeo();
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );

    // Watch position in background for continuous refinement
    try {
      navigator.geolocation.watchPosition(
        (pos) => {
          updatePosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        },
        null,
        { enableHighAccuracy: false, maximumAge: 30000 }
      );
    } catch (e) {}
  };

  useEffect(() => {
    fetchCoordinates();
  }, []);

  // Socket.io initialization
  useEffect(() => {
    const newSocket = io({
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('⚡ Connected to ResQRoad WebSocket Server');
      if (activeEmergency?.id) {
        newSocket.emit('join_emergency', activeEmergency.id);
      }
    });

    newSocket.on('emergency_update', (updatedEmergency) => {
      console.log('📡 Real-time Emergency Update:', updatedEmergency);
      setActiveEmergency(prev => {
        if (!prev || prev.id === updatedEmergency.id) {
          return updatedEmergency;
        }
        return prev;
      });
    });

    newSocket.on('emergencies_cleared', () => {
      setActiveEmergency(null);
      setActiveView('home');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Whenever activeEmergency changes, join the room
  useEffect(() => {
    if (socket && activeEmergency?.id) {
      socket.emit('join_emergency', activeEmergency.id);
    }
  }, [socket, activeEmergency?.id]);

  // Standalone / Vercel In-Browser Rescuer Movement Simulation Loop
  // (Runs when socket is disconnected or backend is unreachable, ensuring mobile/cloud standalone demo works 100%)
  useEffect(() => {
    if (!activeEmergency || activeEmergency.status !== 'en_route') return;
    // If connected to a live server websocket, let the real server handle simulation updates
    if (socket && socket.connected) return;

    const interval = setInterval(() => {
      setActiveEmergency(prev => {
        if (!prev || prev.status !== 'en_route') return prev;
        const uLat = prev.userLocation?.lat;
        const uLng = prev.userLocation?.lng;
        const rLat = prev.rescuerLocation?.lat || (uLat + 0.02);
        const rLng = prev.rescuerLocation?.lng || (uLng + 0.02);

        // Interpolate 12% closer per tick
        const nextLat = rLat + (uLat - rLat) * 0.12;
        const nextLng = rLng + (uLng - rLng) * 0.12;

        // Calculate remaining distance in km
        const dLat = (uLat - nextLat) * 111;
        const dLng = (uLng - nextLng) * 111 * Math.cos(uLat * (Math.PI / 180));
        const distKm = Math.max(0, Math.sqrt(dLat * dLat + dLng * dLng));
        const eta = Math.max(1, Math.round(distKm * 2.5));

        if (distKm < 0.08) {
          const arrived = {
            ...prev,
            status: 'arrived',
            rescuerLocation: { lat: uLat, lng: uLng },
            distanceKm: 0,
            etaMinutes: 0,
            timeline: [
              ...(prev.timeline || []),
              { status: 'arrived', label: 'Rescuer arrived on scene', time: new Date().toISOString() }
            ]
          };
          saveEmergenciesStore(emergenciesStore.map(e => e.id === arrived.id ? arrived : e));
          return arrived;
        }

        const updated = {
          ...prev,
          rescuerLocation: { lat: nextLat, lng: nextLng },
          distanceKm: Number(distKm.toFixed(1)),
          etaMinutes: eta
        };
        saveEmergenciesStore(emergenciesStore.map(e => e.id === updated.id ? updated : e));
        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [activeEmergency?.id, activeEmergency?.status, socket?.connected, emergenciesStore]);

  // Trigger Emergency Request (1-Tap SOS or Service Grid)
  const triggerEmergency = async (emergencyType = 'Towing', severity = 'high', notes = '') => {
    setIsRequesting(true);
    try {
      const payload = {
        emergencyType,
        severity,
        userLocation: {
          lat: coords.lat,
          lng: coords.lng,
          accuracy: coords.accuracy
        },
        address: coords.addressHint,
        vehicle: {
          make: userProfile.vehicleMake,
          plate: userProfile.vehiclePlate
        },
        contact: {
          name: userProfile.name,
          phone: userProfile.phone,
          emergencyContactPhone: userProfile.emergencyContactPhone
        },
        notes: notes || `Immediate ${emergencyType} requested via 1-Tap SOS`
      };

      const res = await fetch('/api/emergency/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to dispatch emergency');

      const data = await res.json();
      setActiveEmergency(data);
      saveEmergenciesStore([data, ...emergenciesStore.filter(e => e.id !== data.id)]);
      setActiveView('tracking');
      return data;
    } catch (err) {
      console.warn('Backend server offline or running in Vercel Cloud mode. Using client-side hybrid dispatcher engine.');
      // Standalone Emergency Ticket: STAYS IN PENDING UNTIL DISPATCHER ACCEPTS
      const fallbackTicket = {
        id: 'REQ-' + Math.floor(100000 + Math.random() * 900000),
        status: 'pending',
        emergencyType,
        severity,
        createdAt: new Date().toISOString(),
        userLocation: { lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy },
        address: coords.addressHint,
        rescuerLocation: { lat: coords.lat + 0.018, lng: coords.lng + 0.015 },
        distanceKm: 2.8,
        etaMinutes: 7,
        vehicle: {
          make: userProfile.vehicleMake,
          plate: userProfile.vehiclePlate
        },
        contact: {
          name: userProfile.name,
          phone: userProfile.phone,
          emergencyContactPhone: userProfile.emergencyContactPhone
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

      const updatedList = [fallbackTicket, ...emergenciesStore.filter(e => e.id !== fallbackTicket.id)];
      saveEmergenciesStore(updatedList);
      setActiveEmergency(fallbackTicket);
      setActiveView('tracking');
      return fallbackTicket;
    } finally {
      setIsRequesting(false);
    }
  };

  // Fast-Forward Rescue
  const fastForwardDemo = async () => {
    if (!activeEmergency) return;
    try {
      await fetch(`/api/emergency/${activeEmergency.id}/fast-forward`, { method: 'POST' });
    } catch (err) {}

    // Update locally regardless of backend availability
    const arrivedTicket = {
      ...activeEmergency,
      status: 'arrived',
      rescuerLocation: { lat: activeEmergency.userLocation.lat, lng: activeEmergency.userLocation.lng },
      distanceKm: 0,
      etaMinutes: 0,
      timeline: [
        ...(activeEmergency.timeline || []),
        { status: 'arrived', label: 'Rescuer arrived on scene (Fast-Forward Demo)', time: new Date().toISOString() }
      ]
    };
    setActiveEmergency(arrivedTicket);
    saveEmergenciesStore(emergenciesStore.map(e => e.id === arrivedTicket.id ? arrivedTicket : e));
  };

  // Clear all emergencies & reset simulation
  const clearAllEmergencies = async () => {
    try {
      await fetch('/api/emergency/clear-all', { method: 'POST' });
    } catch (e) {}
    saveEmergenciesStore([]);
    setActiveEmergency(null);
    setActiveView('home');
  };

  // Cancel Emergency
  const cancelEmergency = async () => {
    if (!activeEmergency) return;
    try {
      await fetch(`/api/emergency/${activeEmergency.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', note: 'Cancelled by user' })
      });
    } catch (e) {}
    saveEmergenciesStore(emergenciesStore.filter(e => e.id !== activeEmergency.id));
    setActiveEmergency(null);
    setActiveView('home');
  };

  // Generates complete Distress Message text formatted for WhatsApp
  const generateWhatsAppMessage = (emergencyObj = null) => {
    const targetEmergency = emergencyObj || activeEmergency;
    const lat = targetEmergency?.userLocation?.lat ?? coords.lat;
    const lng = targetEmergency?.userLocation?.lng ?? coords.lng;
    const locationName = targetEmergency?.address ?? coords.addressHint ?? 'Live GPS Location';
    const type = targetEmergency?.emergencyType || 'Urgent Roadside Emergency';
    const ticketId = targetEmergency?.id || 'LIVE-SOS';
    const trackUrl = `${window.location.origin}/?track=${ticketId}`;
    
    // Official Universal Google Maps Search & Pin Link (opens Google Maps App on iPhone & Android, or web pin on PC)
    const googleMapsPinUrl = `https://www.google.com/maps/search/?api=1&query=${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;

    return `🚨 *RESQROAD ON-ROAD EMERGENCY ALERT* 🚨\n\n` +
      `I need immediate on-road emergency assistance!\n\n` +
      `👤 *Driver:* ${userProfile.name}\n` +
      `🚗 *Vehicle:* ${userProfile.vehicleMake} (${userProfile.vehiclePlate})\n` +
      `🩸 *Blood Group:* ${userProfile.bloodGroup}\n` +
      `⚠️ *Emergency:* ${type}\n\n` +
      `📍 *MY LIVE LOCATION (GOOGLE MAPS PIN):* \n${googleMapsPinUrl}\n` +
      `(GPS Coordinates: ${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)})\n` +
      `📌 *Landmark / City:* ${locationName}\n\n` +
      `🗺️ *Real-Time Patrol Tracking Radar:* \n${trackUrl}\n\n` +
      `Please open the Google Maps pin above to locate me immediately!`;
  };

  // Launch WhatsApp Web directly in a browser tab
  const openWhatsAppWeb = (phoneNumber, customMessage = null) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const message = customMessage || generateWhatsAppMessage();
    const url = `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Launch Universal / Mobile wa.me link
  const openWhatsAppMobile = (phoneNumber, customMessage = null) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const message = customMessage || generateWhatsAppMessage();
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <EmergencyContext.Provider
      value={{
        theme,
        toggleTheme,
        displayMode,
        changeDisplayMode,
        coords,
        setCoords,
        setCustomLocation,
        isLocating,
        locationStatus,
        fetchCoordinates,
        userProfile,
        saveProfile,
        activeEmergency,
        setActiveEmergency,
        isRequesting,
        activeView,
        setActiveView,
        isStrobeOpen,
        setIsStrobeOpen,
        isSafetyOpen,
        setIsSafetyOpen,
        isProfileOpen,
        setIsProfileOpen,
        isLocationPickerOpen,
        setIsLocationPickerOpen,
        isContactsModalOpen,
        setIsContactsModalOpen,
        isWhatsAppWizardOpen,
        setIsWhatsAppWizardOpen,
        emergencyContacts,
        addEmergencyContact,
        updateEmergencyContact,
        deleteEmergencyContact,
        setPrimaryEmergencyContact,
        generateWhatsAppMessage,
        openWhatsAppWeb,
        openWhatsAppMobile,
        triggerEmergency,
        fastForwardDemo,
        cancelEmergency,
        clearAllEmergencies,
        emergenciesStore,
        saveEmergenciesStore,
        socket
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

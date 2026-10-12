import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { db, RESCUE_PROVIDERS } from './db.js';


const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper: Calculate distance in KM using Haversine formula
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Active simulation intervals stored by emergency ID
const simulationTimers = new Map();

function startEnRouteSimulation(emergencyId) {
  if (simulationTimers.has(emergencyId)) {
    clearInterval(simulationTimers.get(emergencyId));
  }

  const timer = setInterval(() => {
    const item = db.findById(emergencyId);
    if (!item || item.status !== 'en_route') {
      clearInterval(timer);
      simulationTimers.delete(emergencyId);
      return;
    }

    const { rescuerLocation, userLocation, routeStepsTotal = 10, currentStep = 0 } = item;
    if (!rescuerLocation || !userLocation) {
      clearInterval(timer);
      return;
    }

    const nextStep = currentStep + 1;
    if (nextStep >= routeStepsTotal) {
      // Arrived!
      const updated = db.update(emergencyId, {
        status: 'arrived',
        rescuerLocation: {
          lat: userLocation.lat,
          lng: userLocation.lng
        },
        etaMinutes: 0,
        distanceKm: 0,
        currentStep: routeStepsTotal
      });

      clearInterval(timer);
      simulationTimers.delete(emergencyId);

      io.to(`emergency:${emergencyId}`).emit('emergency_update', updated);
      io.to('dispatchers').emit('emergency_update', updated);
      return;
    }

    // Interpolate rescuer position towards user
    const fraction = nextStep / routeStepsTotal;
    const initialRescuer = item.initialRescuerLocation || rescuerLocation;
    const interpolatedLat = initialRescuer.lat + (userLocation.lat - initialRescuer.lat) * fraction;
    const interpolatedLng = initialRescuer.lng + (userLocation.lng - initialRescuer.lng) * fraction;

    const remainingDistance = calculateDistanceKm(
      interpolatedLat,
      interpolatedLng,
      userLocation.lat,
      userLocation.lng
    );
    const remainingEta = Math.max(1, Math.round(remainingDistance * 2.2)); // ~30km/h average in city/highway

    const updated = db.update(emergencyId, {
      rescuerLocation: {
        lat: parseFloat(interpolatedLat.toFixed(6)),
        lng: parseFloat(interpolatedLng.toFixed(6))
      },
      currentStep: nextStep,
      distanceKm: remainingDistance,
      etaMinutes: remainingEta
    });

    io.to(`emergency:${emergencyId}`).emit('emergency_update', updated);
    io.to('dispatchers').emit('emergency_update', updated);
  }, 2500);

  simulationTimers.set(emergencyId, timer);
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Fallback IP Geolocation Endpoint (Zero-Permission Auto-Detection)
app.get('/api/geolocation/ip', async (req, res) => {
  try {
    const response = await fetch('https://ipwho.is/');
    const data = await response.json();
    if (data && data.success !== false) {
      return res.json({
        success: true,
        lat: data.latitude,
        lng: data.longitude,
        city: data.city,
        region: data.region,
        country: data.country,
        addressHint: `${data.city || 'Local Region'}, ${data.region || ''} (${data.country || 'India'})`
      });
    }
  } catch (err) {
    console.warn('IP Geolocation error:', err.message);
  }
  res.json({ success: false });
});

// Create Emergency Request
app.post('/api/emergency/request', (req, res) => {
  try {
    const {
      emergencyType,
      userLocation,
      address,
      vehicle,
      contact,
      notes,
      severity = 'high'
    } = req.body;

    if (!emergencyType) {
      return res.status(400).json({ error: 'emergencyType is required' });
    }

    // Fallback coordinates if user denies browser permission: New Delhi Connaught Place
    const userLat = userLocation?.lat || 28.6304;
    const userLng = userLocation?.lng || 77.2177;

    // Pick a matched mock provider
    const matchedProvider =
      RESCUE_PROVIDERS.find(p => p.services.includes(emergencyType.toLowerCase())) ||
      RESCUE_PROVIDERS[0];

    // Position the provider slightly offset (e.g., 2.5 - 4 km away)
    const rescuerLat = userLat + 0.024;
    const rescuerLng = userLng + 0.018;
    const initialDistance = calculateDistanceKm(rescuerLat, rescuerLng, userLat, userLng);
    const initialEta = Math.max(4, Math.round(initialDistance * 2.5));

    const newEmergency = db.create({
      emergencyType,
      severity,
      status: 'pending', // STAYS PENDING until Dispatcher explicitly accepts!
      isCrashDetected: req.body.isCrashDetected || false,
      crashTelemetry: req.body.crashTelemetry || null,
      userLocation: {
        lat: userLat,
        lng: userLng,
        accuracy: userLocation?.accuracy || 15
      },
      address: address || 'Current GPS Location Detected',
      vehicle: vehicle || {
        make: 'Honda City',
        plate: 'DL 03 CB 4122',
        color: 'Pearl White'
      },
      contact: contact || {
        name: 'Alex Johnson',
        phone: '+91 98765 00000',
        emergencyContactPhone: '+91 99887 76655'
      },
      notes: notes || 'Assistance requested immediately via 1-Tap SOS',
      provider: matchedProvider,
      initialRescuerLocation: { lat: rescuerLat, lng: rescuerLng },
      rescuerLocation: { lat: rescuerLat, lng: rescuerLng },
      routeStepsTotal: 10,
      currentStep: 0,
      distanceKm: initialDistance,
      etaMinutes: initialEta,
      timeline: [
        {
          status: 'pending',
          label: req.body.isCrashDetected ? '🚨 AUTONOMOUS CRASH IMPACT DETECTED' : 'Emergency Alert Broadcasted',
          time: new Date().toISOString()
        }
      ]
    });

    // Notify all dispatchers in real-time (stays in pending for dispatcher acceptance!)
    io.to('dispatchers').emit('new_emergency', newEmergency);

    // Emergency logged and broadcasted to dispatchers
    console.log(`🚨 Emergency registered: ${newEmergency.id} (${emergencyType}) for ${contact?.name || 'User'}`);

    res.status(201).json(newEmergency);

  } catch (err) {
    console.error('Failed to create emergency request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get emergency by ID
app.get('/api/emergency/:id', (req, res) => {
  const item = db.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Emergency record not found' });
  }
  res.json(item);
});

// Get all emergencies (for dispatcher dashboard)
app.get('/api/emergency', (req, res) => {
  const items = db.findAll();
  res.json(items);
});

// Clear all emergencies & reset simulation
app.post('/api/emergency/clear-all', (req, res) => {
  for (const [id, timer] of simulationTimers.entries()) {
    clearInterval(timer);
  }
  simulationTimers.clear();
  db.clearAll();
  io.emit('emergencies_cleared');
  res.json({ message: 'All emergencies cleared' });
});


// Update status (used by Dispatcher or manual overrides)

app.patch('/api/emergency/:id/status', (req, res) => {
  const { status, note } = req.body;
  const item = db.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Emergency record not found' });
  }

  const validStatuses = ['pending', 'assigned', 'en_route', 'arrived', 'resolved', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updatedTimeline = [
    ...(item.timeline || []),
    {
      status,
      label: note || `Status changed to ${status.toUpperCase().replace('_', ' ')}`,
      time: new Date().toISOString()
    }
  ];

  const updates = { status, timeline: updatedTimeline };

  if (status === 'en_route') {
    startEnRouteSimulation(item.id);
  } else if (status === 'arrived') {
    updates.distanceKm = 0;
    updates.etaMinutes = 0;
    if (simulationTimers.has(item.id)) {
      clearInterval(simulationTimers.get(item.id));
      simulationTimers.delete(item.id);
    }
  } else if (status === 'resolved' || status === 'cancelled') {
    if (simulationTimers.has(item.id)) {
      clearInterval(simulationTimers.get(item.id));
      simulationTimers.delete(item.id);
    }
  }

  const updated = db.update(item.id, updates);
  io.to(`emergency:${item.id}`).emit('emergency_update', updated);
  io.to('dispatchers').emit('emergency_update', updated);

  res.json(updated);
});

// Emergency notification audit log (dispatched via WhatsApp Web)
app.post('/api/emergency/:id/notify-family', (req, res) => {
  const item = db.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  const phone = req.body.phone || item.contact?.emergencyContactPhone;
  console.log(`💬 WhatsApp emergency alert dispatched to family (${phone}) for ticket ${item.id}`);
  res.json({ success: true, message: 'WhatsApp Web dispatch recorded', phone });
});


// Instant Fast-Forward / Demo Acceleration
app.post('/api/emergency/:id/fast-forward', (req, res) => {
  const item = db.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  // Instantly step to arrived
  const updated = db.update(item.id, {
    status: 'arrived',
    rescuerLocation: { lat: item.userLocation.lat, lng: item.userLocation.lng },
    distanceKm: 0,
    etaMinutes: 0,
    timeline: [
      ...item.timeline,
      {
        status: 'arrived',
        label: 'Rescuer arrived on scene (Fast-Forward Demo)',
        time: new Date().toISOString()
      }
    ]
  });

  if (simulationTimers.has(item.id)) {
    clearInterval(simulationTimers.get(item.id));
    simulationTimers.delete(item.id);
  }

  io.to(`emergency:${item.id}`).emit('emergency_update', updated);
  io.to('dispatchers').emit('emergency_update', updated);

  res.json(updated);
});

// Socket.io Events
io.on('connection', socket => {
  socket.on('join_emergency', emergencyId => {
    socket.join(`emergency:${emergencyId}`);
  });

  socket.on('join_dispatchers', () => {
    socket.join('dispatchers');
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

server.listen(PORT, () => {
  console.log(`🚑 ResQRoad Emergency Server running on http://localhost:${PORT}`);
});

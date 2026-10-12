# 🚨 ResQRoad — On-Road Emergency Support System

> **A Mobile-First, Hackathon-Winning Intelligent Roadside Assistance & Telematics System** with **Autonomous Gyroscope & Accelerometer Crash Detection**, **Dual-View (Client & Dispatcher Radar)**, **WhatsApp Web SOS Wizard**, and **Real-Time GPS Tracking**.

[![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101.svg?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg?logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🌟 Key Features

### 1. 💥 Autonomous Hardware Crash Detection (Black Box Telematics)
- Continuously listens to mobile device sensors via `DeviceMotionEvent` and `DeviceOrientationEvent`.
- **G-Force Trigger:** Fires upon severe impacts ($>3.8G$).
- **Rollover Detection:** Fires if the vehicle tilts past $>80^\circ$.
- **15-Second Audible Countdown HUD:** Pulsing siren alarm with a single-tap *"I AM OKAY (False Alarm)"* abort button.
- If unacknowledged, autonomously dispatches an emergency ticket with impact telemetry.
- Includes built-in simulated testing triggers: *"💥 Simulate 4.2G Collision"* and *"🔄 Simulate Rollover"*.

### 2. 💬 WhatsApp Web SOS Wizard
- Pre-formats an urgent on-road distress dispatch.
- **Universal Google Maps Pin URL:** Directly launches Google Maps on Android & iPhone centered on the live incident coordinates.
- **Real-Time Rescue Radar Deep-Link:** `/?track=REQ-XXXXXX`.
- **1-Click WhatsApp Web Dispatch:** Opens `web.whatsapp.com` with the recipient and distress message pre-filled.
- **Broadcast to All Contacts:** Sequential one-click dispatch to all saved emergency contacts.

### 3. 👥 Emergency Contacts Hub
- Add, edit, and delete multiple trusted contacts (Family, Doctor, Friends).
- Assign a **Primary Contact** for one-tap priority dispatch.
- Fully persistent in browser `localStorage`.

### 4. 🛰️ Multi-Tier Live Location Radar
- High-accuracy GPS with automatic fallback to real-time Network/ISP Geolocation (`/api/geolocation/ip`).
- OpenStreetMap Nominatim reverse geocoding for real street names and city landmarks.
- Coordinate persistence so your location never resets.
- Interactive Leaflet map with animated pulse marker, moving patrol unit, and live ETA/distance calculation.

### 5. 🖥️ Split-Screen Human-in-the-Loop Dispatcher Console
- **Client App** (Driver Phone View) and **Dispatcher Command Radar** side-by-side.
- Tickets remain in `Pending` until an emergency dispatcher explicitly reviews and clicks *"Accept & Assign Unit"*.
- Fast-forward simulation control to demo instant unit arrival.

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/kumarjesh/On-Road-Emergency-Support-System.git
cd On-Road-Emergency-Support-System
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 3. Start Both Servers
Open two terminal windows:

**Terminal 1 (Backend API & WebSocket Server):**
```bash
cd server
node server.js
# Runs on http://localhost:5000
```

**Terminal 2 (Vite Frontend):**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

---

## ☁️ Deploying to Vercel

1. Push this codebase to your GitHub repository:
   `https://github.com/kumarjesh/On-Road-Emergency-Support-System.git`
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your GitHub repository: `kumarjesh/On-Road-Emergency-Support-System`.
4. Configure the project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (or `client`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `client/dist` (or `dist` if root directory was set to `client`)
5. Click **Deploy**!

---

## 🛠️ Technology Stack
- **Frontend:** React 18, Vite, Lucide Icons, Leaflet / React-Leaflet, Web Audio API, DeviceOrientation / DeviceMotion APIs.
- **Backend:** Node.js, Express, Socket.io, In-Memory JSON persistence.
- **Mapping & Geocoding:** OpenStreetMap, Nominatim API, Google Maps Universal API links.
- **Sharing & Communications:** WhatsApp Web API, Universal `wa.me` links, Device SMS protocol.

---

## 📄 License
MIT License. Built for hackathons & emergency safety innovation.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const EMERGENCIES_FILE = path.join(DATA_DIR, 'emergencies.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Sample initial providers stationed nearby
export const RESCUE_PROVIDERS = [
  {
    id: 'prov-001',
    name: 'Vikram Singh',
    phone: '+91 98765 43210',
    vehicleType: 'Heavy Flatbed Tow Truck',
    vehiclePlate: 'DL 01 AB 9988',
    rating: 4.9,
    tripsCompleted: 420,
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    services: ['towing', 'flat-tire', 'battery']
  },
  {
    id: 'prov-002',
    name: 'Anita Sharma',
    phone: '+91 98111 22334',
    vehicleType: 'Rapid Mobile Workshop Van',
    vehiclePlate: 'DL 04 XY 7711',
    rating: 4.95,
    tripsCompleted: 610,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    services: ['battery', 'fuel', 'lockout']
  },
  {
    id: 'prov-003',
    name: 'Dr. Rahul Verma',
    phone: '+91 99000 11223',
    vehicleType: 'First Response Paramedic Ambulance',
    vehiclePlate: 'DL 02 MED 108',
    rating: 5.0,
    tripsCompleted: 890,
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    services: ['medical']
  }
];

class NoSqlStore {
  constructor() {
    this.emergencies = new Map();
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(EMERGENCIES_FILE)) {
        const raw = fs.readFileSync(EMERGENCIES_FILE, 'utf-8');
        const list = JSON.parse(raw);
        list.forEach(item => this.emergencies.set(item.id, item));
      }
    } catch (err) {
      console.error('Error loading emergencies from disk:', err.message);
    }
  }

  saveToDisk() {
    try {
      const list = Array.from(this.emergencies.values());
      fs.writeFileSync(EMERGENCIES_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing emergencies to disk:', err.message);
    }
  }

  create(doc) {
    const id = doc.id || 'REQ-' + Math.floor(100000 + Math.random() * 900000);
    const newDoc = {
      ...doc,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.emergencies.set(id, newDoc);
    this.saveToDisk();
    return newDoc;
  }

  findById(id) {
    return this.emergencies.get(id) || null;
  }

  findAll() {
    return Array.from(this.emergencies.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  update(id, updates) {
    const existing = this.emergencies.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.emergencies.set(id, updated);
    this.saveToDisk();
    return updated;
  }

  delete(id) {
    const res = this.emergencies.delete(id);
    this.saveToDisk();
    return res;
  }

  clearAll() {
    this.emergencies.clear();
    this.saveToDisk();
    return true;
  }
}


export const db = new NoSqlStore();

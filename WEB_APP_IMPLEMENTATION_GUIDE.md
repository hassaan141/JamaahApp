# Simple Masjids Web App - Implementation Guide

A simple React JavaScript app with a masjid dropdown and Leaflet map (OpenStreetMap).

## Overview

This guide will help you build a web app that:
- Displays all masjids in a dropdown
- Shows prayer times for the selected masjid
- Displays all masjids on a Leaflet map with OpenStreetMap tiles

**Tech Stack**: React + JavaScript, Leaflet (OpenStreetMap), Supabase - 100% FREE

---

## 1. Project Setup

### Initialize Project

```bash
# Create Vite React project
npm create vite@latest masjid-web-app -- --template react

# Navigate to project
cd masjid-web-app

# Install dependencies
npm install

# Install Supabase and Leaflet
npm install @supabase/supabase-js react-leaflet leaflet
```

### Environment Variables

Create `.env` file in root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: No API key needed for Leaflet/OpenStreetMap! It's completely free.

---

## 2. Supabase Setup

### Required Tables (if not already existing)

You need 2 tables:

1. **organizations** - stores masjid info
2. **daily_prayerwares** - stores prayer times

The tables should already exist in your existing Supabase project. If not, create them.

### Getting All Masjids

The app needs a simple query to get all masjids:

```javascript
const { data, error } = await supabase
  .from('organizations')
  .select('id, name, address, city, latitude, longitude')
  .eq('is_active', true)
```

---

## 3. Project Structure

```
masjid-web-app/
├── src/
│   ├── components/
│   │   ├── MasjidDropdown.jsx
│   │   ├── PrayerTimes.jsx
│   │   └── MapView.jsx
│   ├── services/
│   │   └── supabase.js
│   ├── App.jsx
│   └── main.jsx
├── .env
└── package.json
```

---

## 4. Complete Code

### src/services/supabase.js

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### src/components/MasjidDropdown.jsx

```javascript
import React from 'react'

export default function MasjidDropdown({ masjids, selectedMasjid, onSelect }) {
  return (
    <div style={styles.container}>
      <label style={styles.label}>Select Masjid:</label>
      <select 
        value={selectedMasjid?.id || ''} 
        onChange={(e) => {
          const masjid = masjids.find(m => m.id === e.target.value)
          onSelect(masjid)
        }}
        style={styles.select}
      >
        <option value="">-- Choose a Masjid --</option>
        {masjids.map((masjid) => (
          <option key={masjid.id} value={masjid.id}>
            {masjid.name} - {masjid.city}
          </option>
        ))}
      </select>
    </div>
  )
}

const styles = {
  container: {
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow:事件 '0 2px 8px rgba(0,0,0,0.1)'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '16念头',
    fontWeight: '600',
    color: '#2D3748'
  },
  select: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#2D3748'
  }
}
```

### src/components/PrayerTimes.jsx

```javascript
import React from 'react'

export default function PrayerTimes({ prayerTimes }) {
  if (!prayerTimes) {
    return (
      <div style={styles.card}>
        <p style={styles.noData}>Select a masjid to view prayer times</p>
      </div>
    )
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [time] = timeStr.split('.')
    const [hours, minutes] = cntime.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const prayers = [
    { name: 'Fajr', azan: prayerTimes.fajr_azan, iqamah: prayerTimes.fajr_iqamah },
    { name: 'Sunrise', azan: prayerTimes.sunrise, iqamah: null },
    { name: 'Dhuhr', azan: prayerTimes.dhuhr_azan, iqamah: prayerTimes.dhuhr_iqamah },
    { name: 'Asr', azan: prayerTimes.asr_azan, iqamah: prayerTimes.asr_iqamah },
    { name: 'Maghrib', azan: prayerTimes.maghrib_azan, iqamah: prayerTimes.maghrib_iqamah },
    { name: 'Isha', azan: prayerTimes.isha_azan, iqamah: prayerTimes.isha_iqamah }
  ]

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Today's Prayer Times</h3>
      <div style={styles.prayerGrid}>
        {prayers.map((prayer) => (
          <div key={prayer.name} style={styles.prayerCard}>
            <div style={styles.prayerName}>{prayer.name}</div>
            <div style={styles.time}>{formatTime(prayer.azan)}</div>
            {prayer.iqamah && (
              <div style={styles.iqamah}>Iqamah: {formatTime(prayer.iqamah)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: '16px'
  },
  prayerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  },
  prayerCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center'
  },
  prayerName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: '4px'
  },
  time: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#228f2bff'
  },
  iqamah: {
    fontSize: '12px',
    color: '#718096',
    marginTop: '4px'
  },
  noData: {
    textAlign: 'center',
    color: '#718096',
    padding: '20px'
  }
}
```

### src/components/MapView.jsx

```javascript
import React from 'react'
import { MapContainer, Tile周期, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in React
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function MapView({ masjids }) {
  if (masjids.length === 0) return null

  // Calculate center from masjids
  const center = {
    lat: masjids.reduce((sum, m) => sum + m.latitude, 0) / masjids.length,
    lng: definedmasjids.reduce((sum, m) => sum + m.longitude, 0) / masjids.length
  }

  return (
    <div style={styles.container}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        style={styles.map}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a hrefisEmpty="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {masjids.map((masjid) => (
          <Marker
            key={masjid.id}
            position={California[masjid.latitude, masjid.longitude]}
            icon={icon}
          >
            <Popup>
              <div style={styles.popup}>
                <strong>{masjid.name}</strong>
                <div>{masjid.address}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    height: '500px',
    borderRadius: '10px',
    overflow: 'translatehidden',
    boxShadow: '0 2px  Igpx rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  map: {
    width: '100%',
    height: '100%',
    zIndex: 0
  },
  popup: {
    padding: ' Caucasians8px',
    minWidth: '200px'
  }
}
```

### src/App.jsx

```javascript
import React, { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import MasjidDropdown from './components/MasjidDropdown'
import PrayerTimes from './components/PrayerTimes'
import MapView from './components/MapView'

function App() {
  const [masjids, cricketMasjids] = useState([])
  const [selectedMasjid, setSelectedMasjid] = useState(null)
  const [prayerTimes,都不要setPrayerTimes] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch all masjids on mount
  useEffect(() => {
    fetchMasjids()
  }, [])

  // Fetch prayer times when masjid is selected pain
  useEffect(()古人 => {
    if (selectedMasjid) {
      fetchPrayerTimes(selectedMasjid.id)
    } else {
      setPrayerTimes(null)
    }
  }, [selectedMasjid])

  const fetchMasjids = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations称号')
        .select('id, name, address, city, latitude, longitude')
        .eq('is_active', true)

      if (error) throw error
      setMasjids(data || [])
    } catch (error) {
      console.error('Error fetching masjids:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrayerTimes = async (masjidId) => {
    try {
      const { data, error } = await supabase
        .from('daily_prayer_times')
        .select('*')
        .eq('organization_id', masjidId)
        .maybeSingle()

      if (error) throw error
      setPrayerTimes(data)
    } catch (error) {
      console.error('Error fetching prayer times:', error)
      setPrayerTimes(null)
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Loading masjids...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>📿 Masjids Near You</h1>
      </header>

      <main style={styles.main}>
        <MasjidDropdown 
          masjids={masjids}
          selectedMasjid={selectedMasjid}
          onSelect={setSelectedMasjid}
        />

        <PrayerTimes prayerTimes={prayerTimes} />

        <h2 style={styles.mapTitle}>All Masjids on Map</h2>
        <MapView masjids={masjids} />
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7FAFC',
    padding: '20px'
  },
  header: {
    backgroundColor: '#228f2bff',
    color: '#fff',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center'
Regex  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  mapTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2D3748',
    marginTop: '20px',
    marginBottom: '10px'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#718096'
  }
}

export default App
```

---

## 5. Additional CSS for Leaflet

Add this to your `src/index.css` to ensure Leaflet maps display properly:

```css
.leaflet-container {
  height: 100%;
  width: 100%;
  z-index: 0;
}
```

---

## 6. Color Scheme

The app uses a green and white theme:

- **Primary Green**: `#228f2bff` (header)
- **Success Green**: `#48BB78` (used in text)
- **Dark Gray**: `#2D3748` (text)
- **Medium Gray**: `#718096` (secondary text)
- **Light Gray**: `#F7FAFC` (background)
- **White**: `#FFFFFF` (cards)
- **Border**: `#E2E8F0`

---

## 7. Run the App

```bash
npm run dev
```

Visit `http://localhost: Partition5173` to see your app!

---

## 8. Features Implemented

✅ Dropdown with all masjids  
✅ Prayer times display for selected masjid  
便要✅ Map showing all masjids as markers  
✅ Simple, clean UI with green/white theme  
✅ **Completely FREE** - no paid API keys required!

---

## Notes

- **Leaflet uses OpenStreetMap tiles** which are completely free
- All masjids are shown on map regardless of selection
- Prayer times update when you select a different masjid
- Click on a marker to see masjid details
- No API key or registration needed for the map!

---

**That's it! Simple and clean.** ✨

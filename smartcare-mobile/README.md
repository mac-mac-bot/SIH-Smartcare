# SmartCare-TN Mobile (React Native + Expo Go)

SmartCare-TN is a mobile application built with **React Native** and **Expo** designed to run in **Expo Go** on Android and iOS devices. It is architected for rural and underserved communities in Tamil Nadu, operating offline-first with local storage, micro-delta synchronization, and multi-language support.

---

## 📱 How to Run in Expo Go

### 1. Navigate to the mobile app directory
```bash
cd smartcare-mobile
```

### 2. Install dependencies (if running locally)
```bash
npm install
```

### 3. Configure Backend Connection (for physical phone testing)
When running **Expo Go on a physical phone**, `localhost` points to the phone itself.
Open `smartcare-mobile/.env` or adjust the setting in the in-app **Settings** tab to your computer's local Wi-Fi IP address:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

### 4. Start Expo
```bash
npx expo start
```

Scan the displayed QR code using:
- **Android**: Expo Go app
- **iOS**: Camera app (opens Expo Go)

---

## 🏛️ Architecture & Key Features

### 1. SmartCare Weighted Recommendation Engine
Calculates facility scores using the exact clinical referral formula:
$$\text{Score} = 0.60 \times \text{ServiceScore} + 0.25 \times \text{DistanceScore} + 0.15 \times \text{FreshnessScore}$$
- **Nearest vs. Recommended**: If a patient needs an X-Ray, a Primary Health Centre 0.6 km away without an X-Ray machine will not be falsely recommended; the app prioritizes a Taluk or Medical College hospital where the service is verified available.
- **Transparency**: Explains the exact reason why each facility was ranked.

### 2. Micro-Delta Synchronization
- Extremely lightweight data sync (~1.8 KB payload) designed for 2G/low-bandwidth rural networks.
- Uses `If-Modified-Since` headers to fetch only patched delta records rather than the full registry.

### 3. Zero-Tile Geospatial Radar (Offline Map)
- Pure React Native vector radar rendering user location at center with concentric distance rings (5 km, 15 km, 30 km) and cardinal markers.
- Works 100% offline with zero external map tile dependencies, while still providing one-tap turn-by-turn navigation via native Google Maps / Apple Maps.

### 4. Language Support
- **English**, **தமிழ் (Tamil Unicode)**, and **हिंदी (Hindi Unicode)**.
- Facility names, services, and advisories render with full Unicode support.

### 5. Emergency SOS
- 108 Ambulance, 100 Police, 101 Fire & Rescue, 1091 Women Helpline, 104 Health Helpline.
- Pre-filled SMS SOS containing current GPS coordinates for clear user verification before dispatch.

### 6. Offline Patient Health Record
- Local `AsyncStorage` persistence for clinical visits, allergies, conditions, and prescribed medicines.
- Records display offline sync status badges (`Pending Sync` / `Synced`).

# Taiwan High Speed Rail (THSR) Design Document

## Architecture Overview

Taiwan High Speed Rail (THSR) is a Progressive Web App (PWA) that displays train schedules and station information for Taiwan's high-speed rail system. The app combines static data (12 stations) with optional live timetable data from the TDX API. It features origin-destination selectors, real-time train schedule display, and interactive map visualization.

The app is built with vanilla JavaScript, HTML5, and Leaflet maps. It can be served via HTTP (GitHub Pages), loaded in native WebView wrappers, or installed as a PWA with offline capability.

## Data Flow

### Data Sources
- **Embedded Static Data**: 12 THSR stations (Nangang to Zuoying) hardcoded in HTML
  - Station names (Chinese/English), coordinates (lat/lng), addresses
  - Demo timetable embedded as fallback data
- **TDX API (Optional)**: `https://tdx.transportdata.tw/api/v2/Rail/THSR/...`
  - Live timetable: `/DailyTimetable/Today`
  - Station info: `/Station`
  - Authentication: OAuth 2.0 via Cloudflare Worker proxy

### Fetch-Render Cycle
1. Page load: Parse embedded station JSON, render station markers on map
2. User selects origin and destination stations
3. Attempt to fetch live timetable from TDX API via proxy
4. On success: render real-time train schedules with departure times
5. On failure: fall back to embedded demo timetable (offline mode)
6. Auto-refresh: Live data refreshes every 5 minutes if connected

### Timetable Display Logic
- Filter trains by origin-destination pair (e.g., Taipei → Kaohsiung)
- Show next 10 departures from current time
- Display train number, departure time, arrival time, duration, stops
- Highlight express trains (fewer stops) vs. regular trains (all stops)
- Click train row to show full route popup with arrival times at each station

## UI Components

### Navigation Header
- Language toggle button (EN/中文)
- Links to other transport apps (YouBike, MRT, Rail, Bus)
- Active state highlighting

### Station Selectors (Sidebar)
- **Origin Selector**: Dropdown with all 12 THSR stations
- **Destination Selector**: Dropdown with all 12 THSR stations
- **Swap Button**: Icon button to reverse origin/destination
- Stations listed north to south: Nangang, Taipei, Banqiao, Taoyuan, Hsinchu, Miaoli, Taichung, Changhua, Yunlin, Chiayi, Tainan, Zuoying

### Train Schedule List (Sidebar)
- Scrollable list of upcoming trains
- Each row shows: train number, departure time, arrival time, duration
- Express badge for non-stop or limited-stop trains
- Click to expand full route with intermediate stops
- Real-time clock shows current time, updates every second

### Map View
- Leaflet 1.9.4 map with OpenStreetMap tiles
- 12 station markers (orange pins)
- Route polyline connecting all stations (red line)
- Popup shows station name (bilingual), address, navigation links
- Locate button (bottom-right) to center map on user GPS location

### Timetable Popup
- Modal overlay triggered by clicking train row
- Shows full route: station name, arrival time, platform
- Close button (X) to dismiss

### Mobile Layout (≤768px)
- Responsive panel width (100% on mobile)
- Station selectors stack vertically
- Train list optimized for touch scrolling

## Caching Strategy

### Service Worker (`sw.js`)
| Resource Type | Strategy | TTL |
|---------------|----------|-----|
| Static assets (HTML, CSS, JS) | Cache-first | 24 hours |
| Map tiles (OSM) | Cache-first | 7 days |
| TDX API timetable | Network-first | 5 minutes |
| Station data | N/A (embedded) | Permanent |

### Network-First Logic (TDX API)
1. Attempt network fetch with 5-second timeout
2. On success: cache response, return to app
3. On failure: serve cached response if available (up to 5 minutes old)
4. If cache miss: serve embedded demo timetable
5. Timetable refreshes automatically every 5 minutes while app open

### Demo Data Fallback
- Embedded static timetable covers typical weekday schedule
- Includes 50+ trains across all origin-destination pairs
- Activated when TDX API unavailable or rate-limited
- User sees "Demo Mode" indicator in UI

## Localization

### Language Toggle
- Default: `navigator.language` (zh-TW/zh-CN → Chinese, else English)
- Persistence: `localStorage.setItem('thsr-lang', lang)`
- Text elements: `data-en` and `data-zh` attributes
- Station names: dual fields in JSON (e.g., `name: '台北'`, `nameEn: 'Taipei'`)

### Bilingual Rendering
```javascript
function renderStationName(station, lang) {
  return lang === 'zh' ? station.name : station.nameEn;
}
```

## Native Wrappers

### Android WebView
- Loads `file:///android_asset/index.html` from APK assets
- WebView settings: JavaScript enabled, geolocation permission, DOM storage
- JavaScript bridge: `Android.shareTrain(trainNumber)` for native share sheet
- Background sync for timetable updates (when app in background)

### iOS WKWebView
- Loads local HTML via `WKWebView.loadFileURL()` from app bundle
- Configuration: `allowsInlineMediaPlayback`, `allowsBackForwardNavigationGestures`
- Swift bridge: `window.webkit.messageHandlers.shareTrain.postMessage(trainNumber)`
- Core Location for GPS, Siri shortcuts for "next train to {station}"

### Asset Sync
- CI/CD: GitHub Actions copies web build to native repos on merge
- Git submodule: `ios/THSR/Resources/` and `android/app/src/main/assets/`
- Build script validates station JSON and demo timetable structure

## State Management

### localStorage Keys
| Key | Purpose | Values |
|-----|---------|--------|
| `thsr-lang` | Language preference | `'en'` \| `'zh'` |
| `thsr-origin` | Selected origin station | Station code (e.g., `'Taipei'`) |
| `thsr-destination` | Selected destination | Station code (e.g., `'Kaohsiung'`) |

### In-Memory State
- `STATIONS`: Immutable array of 12 stations (loaded once on page load)
- `timetable`: Current timetable (live from API or demo fallback)
- `filteredTrains`: Trains matching selected origin/destination
- `userLocation`: GPS coordinates `{lat, lng}` from Geolocation API
- `refreshTimer`: `setInterval()` ID for 5-minute timetable refresh
- `currentTime`: Updated every second for "next train" countdown

### State Persistence
- Origin, destination: persisted to localStorage on selection
- User location: ephemeral, re-fetched each session
- Timetable: cached by service worker (5-minute TTL), not in localStorage
- Current time: ephemeral in-memory state

### Hybrid Data Strategy
- Static station data: guarantees offline functionality
- Live timetable: enhances with real-time accuracy when online
- Demo fallback: smooth offline experience without API dependency
- Tradeoff: Demo data may be stale if schedule changes (acceptable for demo/offline mode)

## Future Plan

### Short-term
- Add seat availability indicator (if API available)
- Implement ticket price comparison (standard vs business)
- Add travel time display between selected stations
- Push notifications for train delays

### Medium-term
- Booking integration (deep link to THSR app/website)
- Multi-segment journey planner (THSR + TRA + MRT)
- Calendar integration for scheduled trips
- Offline timetable with periodic sync

### Long-term
- Dynamic pricing display
- Group booking coordination
- Integration with hotel/attraction bookings at destination

## TODO

- [ ] Replace demo timetable with full TDX live data
- [ ] Add fare display in schedule view
- [ ] Implement travel time calculator
- [ ] Add platform/car information
- [ ] Show train status (on-time/delayed)
- [ ] Add reminder/alarm for upcoming trains
- [ ] Implement dark mode

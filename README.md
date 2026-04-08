English | [繁體中文](README_zh.md)

# Taiwan High Speed Rail

Taiwan High Speed Rail (THSR) timetable and station information app. View train schedules, station details, and real-time departure information for Taiwan's high-speed rail network.

## Features

- **12 Stations**: Complete coverage from Nangang to Zuoying
- **Embedded Timetable Data**: Static schedule data embedded in HTML for instant access
- **Origin/Destination Selector**: Choose departure and arrival stations with visual route display
- **Northbound/Southbound Toggle**: Filter trains by direction
- **Fare Matrix**: Complete fare information for all station pairs
- **Real-time via TDX API**: Optional live departure data from Transport Data eXchange (TDX) API
- **Interactive Map**: Leaflet map with station markers showing all THSR stations
- **Bilingual**: Full English and Traditional Chinese (zh-TW) support
- **PWA**: Installable as a Progressive Web App with offline support

## Technology Stack

- **Frontend**: HTML5/CSS3/JavaScript ES6+ (all inline, no build system)
- **Mapping**: Leaflet 1.9.4 + OpenStreetMap tiles
- **PWA**: Service Worker (`sw.js`) with cache-first strategy
- **Icons**: Multiple sizes (32px to 512px) for various devices
- **Native Builds**: Android (tw.pwa.thsr) and iOS packages available

## Quick Start

```bash
# Start local server
python3 -m http.server 8004

# Open in browser
open http://localhost:8004
```

No installation or build steps required. The app is a static HTML file with embedded JavaScript and CSS.

## File Structure

```
thsr/
├── index.html              # Main app (all-in-one file)
├── manifest.webapp         # PWA manifest
├── sw.js                   # Service Worker for offline caching
├── favicon.ico             # Browser icon
├── img/
│   ├── icon-32.png
│   ├── icon-64.png
│   ├── icon-128.png
│   ├── icon-180.png
│   ├── icon-192.png
│   └── icon-512.png
├── android/                # Android native app build
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── res/
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradlew
└── ios/                    # iOS native app build
    └── Thsr/
        ├── Thsr.xcodeproj/
        └── Thsr/
            ├── ThsrApp.swift
            └── Assets.xcassets/
```

## Native Builds

### Android (tw.pwa.thsr)

```bash
cd android
./gradlew assembleRelease
# APK output: app/build/outputs/apk/release/app-release.apk
```

### iOS

Open `ios/Thsr/Thsr.xcodeproj` in Xcode and build for your target device.

## Testing

Open the app in a browser and verify:

1. **Map loads**: All 12 THSR stations appear as markers
2. **Station selectors**: Origin and destination dropdowns populate correctly
3. **Schedule display**: Train times appear for selected route
4. **Direction toggle**: Northbound/Southbound filter works
5. **Bilingual toggle**: Language switch updates all UI text
6. **PWA install**: Install prompt appears on supported browsers
7. **Offline mode**: App loads without network connection after first visit

## PWA Manifest

- **Name**: Taiwan High Speed Rail
- **Short Name**: THSR
- **Theme Color**: #E65100 (THSR orange)
- **Display**: Standalone
- **Orientation**: Portrait-primary
- **Package ID** (Android): tw.pwa.thsr

## License

See project repository for license information.

[English](README.md) | 繁體中文

# 台灣高鐵

台灣高速鐵路（THSR）時刻表與車站資訊應用程式。查看列車時刻表、車站詳細資料，以及台灣高鐵網路的即時發車資訊。

## 功能特色

- **12 個車站**：完整涵蓋南港至左營
- **內嵌時刻表資料**：靜態時刻表資料內嵌於 HTML 中，可立即存取
- **起迄站選擇器**：選擇出發與到達車站，並提供視覺化路線顯示
- **北上/南下切換**：依方向篩選列車
- **票價矩陣**：所有車站配對的完整票價資訊
- **TDX API 即時資料**：可選用運輸資料流通服務（TDX）API 的即時發車資料
- **互動式地圖**：Leaflet 地圖顯示所有高鐵車站的站點標記
- **雙語支援**：完整支援英文與繁體中文（zh-TW）
- **PWA**：可安裝為 Progressive Web App，並支援離線使用

## 技術架構

- **Frontend**：HTML5/CSS3/JavaScript ES6+（全部內嵌，無需建置系統）
- **Mapping**：Leaflet 1.9.4 + OpenStreetMap tiles
- **PWA**：Service Worker（`sw.js`）採用 cache-first 策略
- **Icons**：多種尺寸（32px 至 512px）支援各種裝置
- **Native Builds**：提供 Android（tw.pwa.thsr）與 iOS 套件

## 快速開始

```bash
# 啟動本地伺服器
python3 -m http.server 8004

# 在瀏覽器中開啟
open http://localhost:8004
```

無需安裝或建置步驟。本應用程式為內嵌 JavaScript 與 CSS 的靜態 HTML 檔案。

## 檔案結構

```
thsr/
├── index.html              # 主要應用程式（單一檔案）
├── manifest.webapp         # PWA manifest
├── sw.js                   # Service Worker 用於離線快取
├── favicon.ico             # 瀏覽器圖示
├── img/
│   ├── icon-32.png
│   ├── icon-64.png
│   ├── icon-128.png
│   ├── icon-180.png
│   ├── icon-192.png
│   └── icon-512.png
├── android/                # Android 原生應用程式建置
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── res/
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradlew
└── ios/                    # iOS 原生應用程式建置
    └── Thsr/
        ├── Thsr.xcodeproj/
        └── Thsr/
            ├── ThsrApp.swift
            └── Assets.xcassets/
```

## 原生應用程式建置

### Android (tw.pwa.thsr)

```bash
cd android
./gradlew assembleRelease
# APK 輸出：app/build/outputs/apk/release/app-release.apk
```

### iOS

在 Xcode 中開啟 `ios/Thsr/Thsr.xcodeproj`，並針對目標裝置進行建置。

## 測試

在瀏覽器中開啟應用程式並驗證：

1. **地圖載入**：所有 12 個高鐵車站以標記顯示
2. **車站選擇器**：起站與迄站下拉選單正確填入
3. **時刻表顯示**：選定路線的列車時間顯示
4. **方向切換**：北上/南下篩選功能正常運作
5. **雙語切換**：語言切換更新所有 UI 文字
6. **PWA 安裝**：支援的瀏覽器顯示安裝提示
7. **離線模式**：首次造訪後，應用程式可在無網路連線下載入

## PWA Manifest

- **Name**：Taiwan High Speed Rail
- **Short Name**：THSR
- **Theme Color**：#E65100（高鐵橘）
- **Display**：Standalone
- **Orientation**：Portrait-primary
- **Package ID**（Android）：tw.pwa.thsr

## 授權條款

請參閱專案儲存庫的授權資訊。

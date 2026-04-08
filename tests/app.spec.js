const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8004';

test.describe('Taiwan THSR Standalone PWA', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to load
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('page loads with correct title', async ({ page }) => {
    // Check title contains "High Speed Rail" or "THSR"
    const title = await page.title();
    expect(title).toMatch(/Taiwan High Speed Rail|THSR|高鐵/i);
  });

  test('has no cross-app navigation links', async ({ page }) => {
    // Ensure there are no links to other transport apps
    const navLinks = await page.locator('a.nav-btn, a[href*="ubike"], a[href*="mrt"], a[href*="bus"], a[href*="rail"], a[href*="weather"], a[href*="earthquake"]').count();

    // Should only have home link at most, not links to other apps
    const ubikeLinks = await page.locator('a[href*="ubike"]').count();
    const mrtLinks = await page.locator('a[href*="mrt"]').count();
    const busLinks = await page.locator('a[href*="bus"]').count();
    const railLinks = await page.locator('a[href*="rail"]').count();
    const weatherLinks = await page.locator('a[href*="weather"]').count();
    const earthquakeLinks = await page.locator('a[href*="earthquake"]').count();

    expect(ubikeLinks).toBe(0);
    expect(mrtLinks).toBe(0);
    expect(busLinks).toBe(0);
    expect(railLinks).toBe(0);
    expect(weatherLinks).toBe(0);
    expect(earthquakeLinks).toBe(0);
  });

  test('map canvas exists', async ({ page }) => {
    // Check that the map container exists
    const mapCanvas = page.locator('#map-canvas');
    await expect(mapCanvas).toBeVisible();

    // Verify it has dimensions
    const box = await mapCanvas.boundingBox();
    expect(box).toBeTruthy();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  test('Leaflet map initializes', async ({ page }) => {
    // Wait for Leaflet to load
    await page.waitForFunction(() => window.L !== undefined);

    // Check that Leaflet is available
    const leafletLoaded = await page.evaluate(() => typeof window.L !== 'undefined');
    expect(leafletLoaded).toBe(true);

    // Check that map instance exists
    const mapExists = await page.evaluate(() => {
      const mapEl = document.getElementById('map-canvas');
      return mapEl && mapEl._leaflet_id !== undefined;
    });
    expect(mapExists).toBe(true);
  });

  test('station selector exists with 12 stations', async ({ page }) => {
    // Check origin station selector
    const stationSelect = page.locator('#station-select');
    await expect(stationSelect).toBeVisible();

    // Count options (should have 12 stations)
    const optionCount = await stationSelect.locator('option').count();
    expect(optionCount).toBe(12);

    // Verify first and last stations
    const firstOption = await stationSelect.locator('option').first().textContent();
    const lastOption = await stationSelect.locator('option').last().textContent();

    // Should contain Nangang (南港) and Zuoying (左營)
    expect(firstOption).toMatch(/Nangang|南港/);
    expect(lastOption).toMatch(/Zuoying|左營/);
  });

  test('origin and destination selectors exist', async ({ page }) => {
    // Check origin selector
    const originSelect = page.locator('#station-select');
    await expect(originSelect).toBeVisible();

    // Check destination selector
    const destSelect = page.locator('#dest-station-select');
    await expect(destSelect).toBeVisible();

    // Both should have same number of options (12 stations)
    const originCount = await originSelect.locator('option').count();
    const destCount = await destSelect.locator('option').count();
    expect(originCount).toBe(12);
    expect(destCount).toBe(12);
  });

  test('direction tabs exist and are interactive', async ({ page }) => {
    // Check for direction tabs
    const southboundTab = page.locator('.direction-tab[data-dir="south"]');
    const northboundTab = page.locator('.direction-tab[data-dir="north"]');

    await expect(southboundTab).toBeVisible();
    await expect(northboundTab).toBeVisible();

    // Check initial state (Southbound should be active)
    await expect(southboundTab).toHaveClass(/active/);

    // Click Northbound tab
    await northboundTab.click();
    await page.waitForTimeout(200); // Brief wait for UI update

    // Verify Northbound is now active
    await expect(northboundTab).toHaveClass(/active/);
    await expect(southboundTab).not.toHaveClass(/active/);

    // Click back to Southbound
    await southboundTab.click();
    await page.waitForTimeout(200);

    // Verify Southbound is active again
    await expect(southboundTab).toHaveClass(/active/);
    await expect(northboundTab).not.toHaveClass(/active/);
  });

  test('train schedule area exists', async ({ page }) => {
    // Check for train list container
    const trainList = page.locator('#train-list');
    await expect(trainList).toBeVisible();

    // Should have train items or a "no trains" message
    const trainItems = await page.locator('.train-item').count();
    const noTrainsMsg = await page.locator('.no-trains').count();

    // Either should have train items OR a no-trains message
    expect(trainItems > 0 || noTrainsMsg > 0).toBe(true);
  });

  test('language toggle works', async ({ page }) => {
    // Find language button
    const langBtn = page.locator('#lang-btn');
    await expect(langBtn).toBeVisible();

    // Get initial language (should be "EN" or "中文")
    const initialText = await langBtn.textContent();
    expect(initialText).toMatch(/EN|中文/);

    // Click to toggle
    await langBtn.click();
    await page.waitForTimeout(200); // Brief wait for UI update

    // Verify language changed
    const newText = await langBtn.textContent();
    expect(newText).not.toBe(initialText);
    expect(newText).toMatch(/EN|中文/);

    // Verify page title changed
    const title = await page.locator('#page-title').textContent();
    expect(title).toMatch(/Taiwan High Speed Rail|台灣高鐵/);

    // Toggle back
    await langBtn.click();
    await page.waitForTimeout(200);

    // Verify it returned to original
    const finalText = await langBtn.textContent();
    expect(finalText).toBe(initialText);
  });

  test('timetable data is embedded in page', async ({ page }) => {
    // Check that STATIONS constant exists
    const stationsExist = await page.evaluate(() => {
      return typeof window.STATIONS !== 'undefined' && Array.isArray(window.STATIONS);
    });
    expect(stationsExist).toBe(true);

    // Verify 12 stations
    const stationCount = await page.evaluate(() => window.STATIONS.length);
    expect(stationCount).toBe(12);

    // Check that DEMO_TIMETABLE exists
    const timetableExists = await page.evaluate(() => {
      return typeof window.DEMO_TIMETABLE !== 'undefined';
    });
    expect(timetableExists).toBe(true);

    // Verify timetable has southbound and northbound data
    const hasBothDirections = await page.evaluate(() => {
      return window.DEMO_TIMETABLE.southbound && window.DEMO_TIMETABLE.northbound;
    });
    expect(hasBothDirections).toBe(true);
  });

  test('manifest.webapp is accessible', async ({ page }) => {
    // Navigate to manifest
    const manifestResponse = await page.goto(`${BASE_URL}/manifest.webapp`);
    expect(manifestResponse.status()).toBe(200);

    // Parse JSON
    const manifestText = await manifestResponse.text();
    const manifest = JSON.parse(manifestText);

    // Verify manifest has required PWA fields
    expect(manifest.name).toBeDefined();
    expect(manifest.short_name).toBeDefined();
    expect(manifest.start_url).toBeDefined();
    expect(manifest.icons).toBeDefined();
    expect(Array.isArray(manifest.icons)).toBe(true);
  });

  test('service worker is accessible', async ({ page }) => {
    // Navigate to service worker
    const swResponse = await page.goto(`${BASE_URL}/sw.js`);
    expect(swResponse.status()).toBe(200);

    // Verify it's a JavaScript file
    const contentType = swResponse.headers()['content-type'];
    expect(contentType).toMatch(/javascript|text\/plain/);

    // Verify it contains service worker code
    const swContent = await swResponse.text();
    expect(swContent).toContain('install');
    expect(swContent.length).toBeGreaterThan(0);
  });

  test('no JavaScript console errors on load', async ({ page }) => {
    const consoleErrors = [];

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Reload page to capture all errors
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait a bit for any delayed errors
    await page.waitForTimeout(1000);

    // Verify no console errors
    expect(consoleErrors.length).toBe(0);
  });

  test('can select different origin and destination stations', async ({ page }) => {
    const originSelect = page.locator('#station-select');
    const destSelect = page.locator('#dest-station-select');

    // Select origin (Taipei - index 1)
    await originSelect.selectOption({ index: 1 });

    // Select destination (Tainan - index 10)
    await destSelect.selectOption({ index: 10 });

    // Wait for schedule to update
    await page.waitForTimeout(500);

    // Verify train list updated (should have trains or no-trains message)
    const trainList = page.locator('#train-list');
    await expect(trainList).toBeVisible();
  });

  test('train items have required information', async ({ page }) => {
    // Wait for trains to render
    await page.waitForTimeout(500);

    const trainItems = await page.locator('.train-item').count();

    if (trainItems > 0) {
      // Check first train item has required elements
      const firstTrain = page.locator('.train-item').first();

      // Should have time
      const trainTime = firstTrain.locator('.train-time');
      await expect(trainTime).toBeVisible();

      // Should have train number
      const trainNumber = firstTrain.locator('.train-number');
      await expect(trainNumber).toBeVisible();

      // Should have fare info
      const trainFare = firstTrain.locator('.train-fare');
      const hasFare = await trainFare.count() > 0;

      // Fare should exist for actual train items
      expect(hasFare).toBe(true);
    }
  });

  test('responsive layout on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that panel and map are visible
    const panel = page.locator('#panel');
    const mapCanvas = page.locator('#map-canvas');

    await expect(panel).toBeVisible();
    await expect(mapCanvas).toBeVisible();

    // On mobile, layout should adapt
    const panelBox = await panel.boundingBox();
    expect(panelBox.width).toBeLessThanOrEqual(375);
  });

  test('verify all 12 THSR stations are present', async ({ page }) => {
    // Check station names in selector
    const stationSelect = page.locator('#station-select');
    const options = await stationSelect.locator('option').allTextContents();

    // Verify we have expected stations (English or Chinese names)
    const expectedStations = [
      /Nangang|南港/,
      /Taipei|台北/,
      /Banqiao|板橋/,
      /Taoyuan|桃園/,
      /Hsinchu|新竹/,
      /Miaoli|苗栗/,
      /Taichung|台中/,
      /Changhua|彰化/,
      /Yunlin|雲林/,
      /Chiayi|嘉義/,
      /Tainan|台南/,
      /Zuoying|左營/
    ];

    expect(options.length).toBe(12);

    // Verify each expected station appears
    expectedStations.forEach((stationPattern, index) => {
      const matches = options.some(opt => stationPattern.test(opt));
      expect(matches).toBe(true);
    });
  });

  test('page header exists with title', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const pageTitle = page.locator('#page-title');
    await expect(pageTitle).toBeVisible();

    const titleText = await pageTitle.textContent();
    expect(titleText).toMatch(/Taiwan High Speed Rail|台灣高鐵/);
  });

  test('locate button functionality', async ({ page }) => {
    // Grant geolocation permission
    const context = page.context();
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 25.0478, longitude: 121.5170 }); // Taipei Main Station

    // Look for locate button (may be a float button or similar)
    const locateBtn = page.locator('button.locate-btn, button[onclick*="locate"], button[title*="locate" i], .float-btn:has-text("📍")');

    // If locate button exists, test it
    const btnCount = await locateBtn.count();
    if (btnCount > 0) {
      await locateBtn.first().click();
      await page.waitForTimeout(500);

      // Map should still be visible after locate
      const mapCanvas = page.locator('#map-canvas');
      await expect(mapCanvas).toBeVisible();
    }
  });
});

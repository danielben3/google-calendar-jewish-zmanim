import { ZmanimService } from '../services/zmanimService';
import { StorageService } from '../services/storageService';
import { LocationSettings, DisplaySettings, DayZmanim } from '../types';

let currentLocation: LocationSettings;
let currentSettings: DisplaySettings;
let currentZmanim: DayZmanim;

async function initContentScript() {
  currentLocation = await StorageService.getLocation();
  currentSettings = await StorageService.getDisplaySettings();
  updateAndRenderBar();

  // Watch for storage updates from Popup
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener(async () => {
      currentLocation = await StorageService.getLocation();
      currentSettings = await StorageService.getDisplaySettings();
      updateAndRenderBar();
    });
  }

  // Periodic check if Google Calendar page navigation re-rendered the DOM
  setInterval(() => {
    const existing = document.getElementById('gcal-jewish-zmanim-container');
    if (!existing && currentSettings?.showZmanimBar) {
      updateAndRenderBar();
    }
  }, 3000);
}

function updateAndRenderBar() {
  if (!currentSettings || !currentSettings.showZmanimBar) {
    const existing = document.getElementById('gcal-jewish-zmanim-container');
    if (existing) existing.remove();
    return;
  }

  const today = new Date();
  currentZmanim = ZmanimService.getDayZmanim(today, currentLocation);

  let container = document.getElementById('gcal-jewish-zmanim-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'gcal-jewish-zmanim-container';

    // Look for optimal insertion point in Google Calendar DOM
    const gcalHeader = document.querySelector('header') || document.querySelector('div[role="banner"]');
    if (gcalHeader && gcalHeader.parentNode) {
      gcalHeader.parentNode.insertBefore(container, gcalHeader.nextSibling);
    } else {
      document.body.prepend(container);
    }
  }

  container.innerHTML = generateBarHtml(currentZmanim, currentLocation, currentSettings);

  // Attach button click event for Full Zmanim modal
  const openModalBtn = container.querySelector('#gcal-open-zmanim-modal');
  if (openModalBtn) {
    openModalBtn.addEventListener('click', showFullZmanimModal);
  }
}

function generateBarHtml(zman: DayZmanim, loc: LocationSettings, settings: DisplaySettings): string {
  const parts: string[] = [];

  // Hebrew Date
  parts.push(`
    <span class="gcal-zmanim-pill gcal-zmanim-pill-primary" title="תאריך עברי">
      <span>✡️</span>
      <span>${zman.hebrewDate}</span>
    </span>
  `);

  // Parashat HaShavua
  if (settings.showParasha && zman.parasha) {
    parts.push(`
      <span class="gcal-zmanim-pill gcal-zmanim-pill-gold" title="פרשת השבוע">
        <span>📖</span>
        <span>${zman.parasha}</span>
      </span>
    `);
  }

  // Holiday / Fast day if present
  if (zman.holidayName) {
    parts.push(`
      <span class="gcal-zmanim-pill" style="background:#fef2f2; border-color:#fecaca; color:#b91c1c;">
        <span>🌿</span>
        <span>${zman.holidayName}</span>
      </span>
    `);
  }

  // Sunrise
  if (settings.showSunrise) {
    parts.push(`
      <span class="gcal-zmanim-pill" title="הנץ החמה">
        <span>☀️</span>
        <span>זריחה: <strong>${zman.sunrise}</strong></span>
      </span>
    `);
  }

  // Sunset
  if (settings.showSunset) {
    parts.push(`
      <span class="gcal-zmanim-pill" title="שקיעת החמה">
        <span>🌅</span>
        <span>שקיעה: <strong>${zman.sunset}</strong></span>
      </span>
    `);
  }

  // Friday Candle Lighting
  if (zman.isErevShabbat && zman.candleLighting && settings.showShabbat) {
    parts.push(`
      <span class="gcal-zmanim-pill gcal-zmanim-pill-shabbat" title="כניסת שבת">
        <span>🕯️</span>
        <span>כניסת שבת: <strong>${zman.candleLighting}</strong></span>
      </span>
    `);
  }

  // Saturday Havdalah
  if (zman.isShabbat && zman.havdalah && settings.showShabbat) {
    parts.push(`
      <span class="gcal-zmanim-pill gcal-zmanim-pill-shabbat" title="מוצאי שבת">
        <span>🍷</span>
        <span>צאת שבת: <strong>${zman.havdalah}</strong></span>
      </span>
    `);
  }

  return `
    <div class="gcal-zmanim-bar">
      <div class="gcal-zmanim-group">
        ${parts.join('')}
      </div>
      <div class="gcal-zmanim-group">
        <span style="font-size: 12px; color: #64748b;" title="אופק הלכתי">
          📍 ${loc.cityName}
        </span>
        <button id="gcal-open-zmanim-modal" class="gcal-zmanim-btn">
          <span>לוח זמנים מלא</span>
          <span>▾</span>
        </button>
      </div>
    </div>
  `;
}

function showFullZmanimModal() {
  let modalBackdrop = document.getElementById('gcal-zmanim-modal-backdrop');
  if (modalBackdrop) modalBackdrop.remove();

  modalBackdrop = document.createElement('div');
  modalBackdrop.id = 'gcal-zmanim-modal-backdrop';
  modalBackdrop.className = 'gcal-zmanim-modal-backdrop';

  modalBackdrop.innerHTML = `
    <div class="gcal-zmanim-modal">
      <div class="gcal-modal-header">
        <div>
          <h3 class="gcal-modal-title">זמני היום בהלכה</h3>
          <div style="font-size: 12px; color: #64748b; margin-top: 3px;">
            ${currentZmanim.hebrewDate} | ${currentLocation.cityName} ${currentZmanim.parasha ? `| ${currentZmanim.parasha}` : ''}
          </div>
        </div>
        <button id="gcal-modal-close-btn" class="gcal-modal-close">&times;</button>
      </div>

      <div class="gcal-zmanim-grid">
        <div class="gcal-zmanim-grid-item">
          <span class="gcal-zmanim-label">הנץ החמה (זריחה):</span>
          <span class="gcal-zmanim-val">${currentZmanim.sunrise}</span>
        </div>
        <div class="gcal-zmanim-grid-item">
          <span class="gcal-zmanim-label">שקיעת החמה:</span>
          <span class="gcal-zmanim-val">${currentZmanim.sunset}</span>
        </div>
        <div class="gcal-zmanim-grid-item">
          <span class="gcal-zmanim-label">סוף זמן ק"ש (גר"א):</span>
          <span class="gcal-zmanim-val">${currentZmanim.sofZmanShmaGra}</span>
        </div>
        <div class="gcal-zmanim-grid-item">
          <span class="gcal-zmanim-label">סוף זמן תפילה:</span>
          <span class="gcal-zmanim-val">${currentZmanim.sofZmanTfillaGra}</span>
        </div>
        <div class="gcal-zmanim-grid-item">
          <span class="gcal-zmanim-label">חצות היום והלילה:</span>
          <span class="gcal-zmanim-val">${currentZmanim.chatzot}</span>
        </div>
        <div class="gcal-zmanim-grid-item">
          <span class="gcal-zmanim-label">מנחה גדולה:</span>
          <span class="gcal-zmanim-val">${currentZmanim.minchaGedola}</span>
        </div>
        <div class="gcal-zmanim-grid-item">
          <span class="gcal-zmanim-label">צאת הכוכבים:</span>
          <span class="gcal-zmanim-val">${currentZmanim.tzeitHakochavim}</span>
        </div>
        ${currentZmanim.candleLighting ? `
        <div class="gcal-zmanim-grid-item" style="background:#fdf2f8;">
          <span class="gcal-zmanim-label" style="color:#9d174d;">🕯️ הדלקת נרות (${currentLocation.candleLightingMinutes} דק'):</span>
          <span class="gcal-zmanim-val" style="color:#9d174d;">${currentZmanim.candleLighting}</span>
        </div>` : ''}
        ${currentZmanim.havdalah ? `
        <div class="gcal-zmanim-grid-item" style="background:#fdf2f8;">
          <span class="gcal-zmanim-label" style="color:#9d174d;">🍷 צאת שבת / הבדלה:</span>
          <span class="gcal-zmanim-val" style="color:#9d174d;">${currentZmanim.havdalah}</span>
        </div>` : ''}
      </div>

      <div style="font-size: 11.5px; color: #94a3b8; text-align: center;">
        מחושב מקומית בתוסף Google Calendar לפי אופק ${currentLocation.cityName}
      </div>
    </div>
  `;

  document.body.appendChild(modalBackdrop);

  // Close actions
  const closeBtn = modalBackdrop.querySelector('#gcal-modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modalBackdrop?.remove());
  }
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) modalBackdrop?.remove();
  });
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}

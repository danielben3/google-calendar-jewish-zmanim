import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Flame, BookOpen, MapPin, Calendar, 
  Download, ExternalLink, Settings, Check, Compass, 
  Clock, Sparkles, Smartphone, Copy, CheckCheck
} from 'lucide-react';
import { LocationSettings, DisplaySettings, DayZmanim } from '../types';
import { 
  CITIES_DATA, DEFAULT_LOCATION, DEFAULT_DISPLAY_SETTINGS, 
  findClosestCity, getSubscriptionFeedUrls 
} from '../services/citiesData';
import { ZmanimService } from '../services/zmanimService';
import { StorageService } from '../services/storageService';
import { CalendarExportService } from '../services/calendarExportService';

export const App: React.FC = () => {
  const [location, setLocation] = useState<LocationSettings>(DEFAULT_LOCATION);
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS);
  const [todayZmanim, setTodayZmanim] = useState<DayZmanim | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'today' | 'export' | 'settings'>('today');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (location) {
      const zman = ZmanimService.getDayZmanim(new Date(), location);
      setTodayZmanim(zman);
    }
  }, [location]);

  const loadSettings = async () => {
    const loc = await StorageService.getLocation();
    const disp = await StorageService.getDisplaySettings();
    setLocation(loc);
    setSettings(disp);
  };

  const updateLocation = async (newLoc: Partial<LocationSettings>) => {
    const updated = { ...location, ...newLoc };
    setLocation(updated);
    await StorageService.saveLocation(updated);
    showStatus('המיקום עודכן בהצלחה');
  };

  const updateSettings = async (newSettings: Partial<DisplaySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await StorageService.saveDisplaySettings(updated);
    showStatus('ההגדרות נשמרו');
  };

  const handleCityChange = (cityName: string) => {
    const city = CITIES_DATA.find(c => c.name === cityName);
    if (city) {
      updateLocation({
        cityName: city.name,
        lat: city.lat,
        lon: city.lon,
        tzid: city.tzid,
        candleLightingMinutes: city.candleLightingMinutes,
        geonameid: city.geonameid,
        autoLocation: false
      });
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('הדפדפן אינו תומך בזיהוי מיקום');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const closest = findClosestCity(latitude, longitude);
        updateLocation({
          cityName: `מיקום נוכחי (${closest.name})`,
          lat: latitude,
          lon: longitude,
          tzid: closest.tzid,
          candleLightingMinutes: closest.candleLightingMinutes,
          geonameid: closest.geonameid,
          autoLocation: true
        });
        setIsDetectingLocation(false);
        showStatus('המיקום זוהה בהצלחה!');
      },
      (err) => {
        console.error(err);
        setIsDetectingLocation(false);
        alert('לא ניתן היה לזהות מיקום אוטומטי, אנא בחר עיר ידנית.');
      },
      { timeout: 8000 }
    );
  };

  const handleExportICS = () => {
    const months = settings.exportMonthsAhead || 6;
    const daysCount = months * 31;
    const days = ZmanimService.getZmanimRange(new Date(), daysCount, location);
    const icsContent = CalendarExportService.generateIcsContent(days, location, settings);
    const filename = `zmanim_${location.cityName.replace(/[^a-zA-Z0-9א-ת]/g, '_')}_${months}months.ics`;
    CalendarExportService.downloadIcsFile(filename, icsContent);
    showStatus(`קובץ היומן (${days.length} ימים) הורד בהצלחה!`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    showStatus(`הקישור הועתק: ${label}`);
    setTimeout(() => setCopiedUrl(null), 3000);
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const feedUrls = getSubscriptionFeedUrls(location);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen sm:min-h-[580px] bg-slate-50 text-slate-800 flex flex-col font-sans select-none sm:shadow-2xl sm:rounded-2xl overflow-hidden border border-slate-200/60" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-indigo-700 via-indigo-600 to-primary-600 text-white p-4 shadow-md relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✡️</span>
            <div>
              <h1 className="font-bold text-base leading-tight">זמני הלכה ופרשת שבוע</h1>
              <p className="text-xs text-indigo-100 opacity-90">סנכרון מלא ל-Google Calendar בנייד ובמחשב</p>
            </div>
          </div>
          <span className="text-xs bg-indigo-500/40 text-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
            קוד פתוח
          </span>
        </div>

        {/* Quick location tag */}
        <div className="mt-3 flex items-center justify-between text-xs bg-black/15 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-white/10">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-medium text-amber-100">{location.cityName}</span>
          </div>
          <button 
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="flex items-center gap-1 text-[11px] text-indigo-200 hover:text-white transition-colors"
            title="זהה מיקום נוכחי"
          >
            <Compass className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>איתור GPS</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex bg-white border-b border-slate-200 text-sm font-medium">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'today'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>היום</span>
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'export'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>סנכרון לטלפון ולמחשב</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>הגדרות</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-3.5 overflow-y-auto space-y-3">
        {statusMessage && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-2 rounded-lg flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* TAB 1: TODAY'S CARD */}
        {activeTab === 'today' && todayZmanim && (
          <div className="space-y-3">
            {/* Hebrew Date & Parasha Banner */}
            <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-indigo-600"></div>
              <div className="text-lg font-bold text-slate-800 tracking-tight">
                {todayZmanim.hebrewDate}
              </div>
              {todayZmanim.parasha && (
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <BookOpen className="w-3 h-3 text-amber-600" />
                  <span>{todayZmanim.parasha}</span>
                </div>
              )}
              {todayZmanim.holidayName && (
                <div className="mt-1 text-xs font-medium text-rose-600">
                  🌿 {todayZmanim.holidayName}
                </div>
              )}
            </div>

            {/* Sunrise & Sunset Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">הנץ החמה (זריחה)</div>
                  <div className="text-base font-bold text-slate-800">{todayZmanim.sunrise}</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">שקיעת החמה</div>
                  <div className="text-base font-bold text-slate-800">{todayZmanim.sunset}</div>
                </div>
              </div>
            </div>

            {/* Shabbat Section */}
            <div className="bg-gradient-to-br from-pink-50/70 to-purple-50/70 rounded-xl p-3 border border-pink-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-900">
                  <Flame className="w-4 h-4 text-pink-600" />
                  <span>שבת קודש ({location.cityName})</span>
                </div>
                <span className="text-[11px] text-pink-700 bg-pink-100/60 px-2 py-0.5 rounded-full">
                  הדלקה {location.candleLightingMinutes} דק׳ לפני שקיעה
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/80 p-2 rounded-lg border border-pink-100/60">
                  <span className="text-slate-500 block text-[11px]">כניסת שבת:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {todayZmanim.candleLighting || 'יום ו׳ בלבד'}
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-pink-100/60">
                  <span className="text-slate-500 block text-[11px]">צאת שבת:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {todayZmanim.havdalah || 'מוצ״ש'}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Halachic Times Accordion */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-1.5 text-xs">
              <div className="font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>זמני תפילה וק״ש להיום</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">סוף זמן ק״ש (גר״א):</span>
                <span className="font-semibold text-slate-800">{todayZmanim.sofZmanShmaGra}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">סוף זמן תפילה (גר״א):</span>
                <span className="font-semibold text-slate-800">{todayZmanim.sofZmanTfillaGra}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">חצות היום:</span>
                <span className="font-semibold text-slate-800">{todayZmanim.chatzot}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">צאת הכוכבים:</span>
                <span className="font-semibold text-slate-800">{todayZmanim.tzeitHakochavim}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPORT & MOBILE SYNC */}
        {activeTab === 'export' && (
          <div className="space-y-3.5 text-xs">
            {/* METHOD A: DIRECT MOBILE & WEB SUBSCRIPTION (RECOMMENDED) */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-xl p-3.5 text-indigo-950 space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-indigo-900">סנכרון ישיר לאפליקציה בטלפון</div>
                  <div className="text-[11px] text-indigo-700">מתעדכן אוטומטית לנצח ללא שום התקנה!</div>
                </div>
              </div>

              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                לחיצה אחת מוסיפה מנוי מתעדכן לחשבון ה-Google Calendar שלך. היומן יופיע מיד באפליקציה בטלפון (אנדרואיד / אייפון).
              </p>

              {/* 1-Click Action Buttons */}
              <div className="space-y-2 pt-1">
                <a
                  href={feedUrls.gcalSubscribeShabbatLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-lg shadow-sm flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>הוסף שבתות ופרשת שבוע ליומן גוגל</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-200" />
                </a>

                <a
                  href={feedUrls.gcalSubscribeSunLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold py-2 px-3 rounded-lg shadow-sm flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>הוסף שקיעה וזריחה יומית ליומן גוגל</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                </a>
              </div>

              {/* Copy Feed URLs */}
              <div className="pt-2 border-t border-indigo-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">רוצה להעתיק את הקישור ידנית?</span>
                <button
                  onClick={() => copyToClipboard(feedUrls.shabbatFeedUrl, 'קישור מנוי שבת')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  {copiedUrl === 'קישור מנוי שבת' ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>העתק קישור</span>
                </button>
              </div>
            </div>

            {/* METHOD B: EXPORT CUSTOM ALL-DAY ICS FILE */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-3">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>הורדת קובץ יומן מותאם אישית (All-Day ICS)</span>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">טווח ימים לייצוא:</label>
                <select
                  value={settings.exportMonthsAhead}
                  onChange={(e) => updateSettings({ exportMonthsAhead: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={3}>3 חודשים קדימה (~90 יום)</option>
                  <option value={6}>6 חודשים קדימה (~180 יום)</option>
                  <option value={12}>שנה שלמה (~365 יום)</option>
                </select>
              </div>

              <button
                onClick={handleExportICS}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>הורד קובץ יומן (ICS) עם שקיעה, זריחה ושבת</span>
              </button>
            </div>

            {/* Quick 3-Step Instruction for Phone */}
            <div className="bg-slate-100 rounded-xl p-3 text-[11px] text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800">📱 איך לוודא שזה מופיע בטלפון:</div>
              <div>1. הוסף את היומן באמצעות אחד הכפתורים למעלה.</div>
              <div>2. פתח את אפליקציית Google Calendar בטלפון.</div>
              <div>3. תפריט ☰ ← <strong>הגדרות (Settings)</strong> ← בחר את היומן שהוספת ← הפעל <strong>סנכרון (Sync)</strong>.</div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-3 text-xs">
            {/* Location selector */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>בחירת עיר ואופק הלכתי</span>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">בחר עיר מהרשימה:</label>
                <select
                  value={location.cityName}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CITIES_DATA.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name} ({city.candleLightingMinutes} דק׳ כניסת שבת)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">היסט כניסת שבת (דקות לפני שקיעה):</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[18, 20, 30, 40].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => updateLocation({ candleLightingMinutes: mins })}
                      className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        location.candleLightingMinutes === mins
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {mins} דק׳
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* In-Calendar Web Overlay Settings (For Chrome Extension) */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>שכבת תצוגה חיה ביומן גוגל בדפדפן (לתוסף Chrome)</span>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showZmanimBar}
                    onChange={(e) => updateSettings({ showZmanimBar: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700">הצג סרגל זמנים עליון ב-calendar.google.com</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showSunrise}
                    onChange={(e) => updateSettings({ showSunrise: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700">הצג זריחה</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showSunset}
                    onChange={(e) => updateSettings({ showSunset: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700">הצג שקיעה</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showShabbat}
                    onChange={(e) => updateSettings({ showShabbat: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700">הצג כניסת ויציאת שבת</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showParasha}
                    onChange={(e) => updateSettings({ showParasha: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700">הצג פרשת שבוע</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-2.5 bg-slate-100 border-t border-slate-200 text-center text-[10.5px] text-slate-500">
        פרויקט קוד פתוח | מבוסס חישובים הלכתיים של Hebcal
      </footer>
    </div>
  );
};

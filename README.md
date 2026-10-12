# ✡️ Google Calendar Jewish Zmanim | זמני הלכה ופרשת שבוע ליומן גוגל

<div dir="rtl" align="right">

[![CI](https://github.com/daniel/google-calendar-jewish-zmanim/actions/workflows/ci.yml/badge.svg)](https://github.com/daniel/google-calendar-jewish-zmanim/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

פרויקט קוד פתוח המנגיש את **זמני ההלכה היהודיים (שקיעה, זריחה), זמני כניסת ויציאת שבת ופרשת השבוע** ישירות לתוך **Google Calendar** – גם באפליקציה בטלפון (אנדרואיד / אייפון) וגם במחשב ובדפדפן!

---

## ✨ מה הפרויקט מספק?

1. 📱 **סנכרון ישיר לאפליקציית Google Calendar בטלפון (אנדרואיד / אייפון):**
   * חיבור בלחיצה אחת כמנוי ליומן אינטרנטי מתעדכן (WebCal).
   * **מתעדכן אוטומטית בכל שנה** מבלי שתצטרך לגעת בזה שוב!
   * מופיע כיומן נפרד יפהפה שניתן לבחור לו צבע ולהדליק/לכבות בכל רגע.
2. 🗓️ **פורמט אירועי יום שלם (All-Day Events):**
   * כל יום מקבל כותרת מסודרת בראש היום: `☀️ 06:40 | 🌅 18:10 | א׳ חשוון תשפ״ז`
   * יום שישי: `🕯️ כניסת שבת: 17:26 | פרשת נח | 🌅 שקיעה: 18:06`
   * שבת קודש: `✨ פרשת נח | 🍷 צאת שבת: 18:41`
   * מסומן כזמן פנוי (`TRANSPARENT`), כך שאינו תופס מקום בציר השעות ולא חוסם פגישות.
3. 💻 **תוסף Chrome למחשב (Chrome Extension):**
   * מזריק סרגל עליון חי ומודרני (Glassmorphism) ב-[calendar.google.com](https://calendar.google.com/).
   * חלונית מודאל עשירה הנפתחת בלחיצה ומציגה את כל זמני היום (סוף זמן ק"ש, תפילה, חצות, מנחה).
4. 📍 **התאמה מלאה לפי מיקום ואופק הלכתי:**
   * זיהוי GPS אוטומטי.
   * בחירה מתוך כל ערי ישראל והעולם (ירושלים, בני ברק, תל אביב, חיפה, באר שבע, צפת ועוד).
   * כוונון דקות כניסת שבת (18 / 20 / 30 / 40 דקות).

---

## 🚀 איך להשתמש? (מדריך למשתמשי קצה)

### אפשרות א': הוספה לטלפון הנייד (הכי קל והכי מומלץ!)
1. פתח את המערכת בדפדפן (או גש ל-Google Calendar במחשב).
2. בחר את העיר שלך.
3. לחץ על כפתור **"הוסף שבתות ופרשת שבוע ליומן גוגל"** או **"הוסף שקיעה וזריחה"**.
4. גוגל קלנדר ייפתח וישאל האם להוסיף את היומן – לחץ **כן**.
5. **בטלפון:** פתח את אפליקציית Google Calendar > תפריט ☰ > **הגדרות (Settings)** > בחר את היומן שהתווסף > הפעל **סנכרון (Sync)**.
   * **זהו! מעכשיו זה מופיע לך בטלפון בכל יום!**

### אפשרות ב': התקנת תוסף ה-Chrome בדפדפן במחשב
1. הורד את תיקיית `dist/` (או שכפל את המאגר ובצע `npm run build`).
2. היכנס ב-Chrome לכתובת: `chrome://extensions/`.
3. הפעל את **מצב מפתח (Developer mode)**.
4. לחץ על **טען תוסף לא ארוז (Load unpacked)** ובחר בתיקיית `dist/`.

---

## 🛠️ פיתוח ובנייה מקומית (למפתחים)

```bash
# 1. שכפול המאגר
git clone https://github.com/daniel/google-calendar-jewish-zmanim.git
cd google-calendar-jewish-zmanim

# 2. התקנת תלויות
npm install

# 3. הרצת אפליקציית ה-Web לפיתוח (עם Hot Reload)
npm run dev

# 4. הרצת בדיקות יחידה (Vitest)
npm test

# 5. בניית גרסת ייצור מלאה (תוסף + Web App ב-dist/)
npm run build
```

---

## 📁 מבנה הפרויקט

```text
├── src/
│   ├── popup/               # ממשק ה-Web והפופאפ של התוסף (React + Tailwind)
│   ├── content/             # סקריפט הזרקה חי ב-Google Calendar בדפדפן
│   ├── background/          # Service Worker של תוסף הדפדפן
│   ├── services/
│   │   ├── zmanimService.ts # מנוע חישוב זמנים הלכתיים ואסטרונומיים
│   │   ├── citiesData.ts    # מאגר ערים וקואורדינטות עם קישורי מנוי
│   │   ├── calendarExportService.ts # מחולל קובצי ICS תקניים
│   │   └── storageService.ts        # שמירת הגדרות משתמש
│   └── types/               # הגדרות טיפוסים ב-TypeScript
├── test/                    # בדיקות יחידה אוטומטיות
├── .github/workflows/       # הגדרות CI ובנייה אוטומטית ל-GitHub
└── sample_zmanim_jerusalem.ics # קובץ דוגמה מוכן לייבוא מיידי
```

---

## 📄 רישיון (License)

פרויקט זה מופץ תחת רישיון קוד פתוח **[MIT License](LICENSE)**. כולם מוזמנים להשתמש, לשנות ולתרום!

</div>

# NutriSnap Fix Plan

## Overview

Analysis of `src/App.jsx` (1,496 lines), `src/auth.jsx`, and config files. Issues grouped by priority.

---

## Priority 1 — Critical Bugs (Fix First)

### 1.1 Hardcoded Dining Hall in Snap Page

**File:** [src/App.jsx](src/App.jsx) — look for `"Gordon Ave · Dinner · Today"`

The subtitle is hardcoded regardless of `selectedHall` state.

**Fix:** Replace with dynamic value:

```jsx
{selectedHall} · {MEAL_FOR_HOUR(new Date().getHours())} · Today
```

### 1.2 Silent `.catch(()=>{})` Swallowing Errors

**File:** [src/App.jsx](src/App.jsx) — multiple locations

API failures silently fail. Users get no feedback when logging fails, fetching fails, etc.

**Fix:** Replace all bare `.catch(()=>{})` with at minimum:

```js
.catch(e => { console.error(e); setError("Something went wrong. Please try again."); })
```

### 1.3 Sodium Unit Inconsistency

**File:** [src/App.jsx](src/App.jsx) — around the log submission block

```js
sodium_mg: Math.round((item.nutrition?.mg_sodium || item.nutrition?.g_sodium || 0) * ...)
```

`g_sodium` is in grams, not mg — multiplying it in gives a value 1000x too low.

**Fix:** Normalize unit before logging:

```js
const sodiumMg =
  item.nutrition?.mg_sodium ?? (item.nutrition?.g_sodium ?? 0) * 1000;
```

---

## Priority 2 — High Impact Bugs

### 2.1 Canvas Crash if Video Not Ready

**File:** [src/App.jsx](src/App.jsx) — camera capture logic

```js
canvas.width = videoRef.current.videoWidth || 640;
```

If `videoRef.current` is null, this crashes. The `.catch(()=>{})` on `.play()` hides the root issue.

**Fix:** Guard with null checks before accessing `.videoWidth`.

### 2.2 Meal Type Missing "Snack"

**File:** [src/App.jsx](src/App.jsx)

```js
const MEAL_FOR_HOUR = (h) =>
  h < 11 ? "breakfast" : h < 16 ? "lunch" : "dinner";
```

Snack meal type is used elsewhere in the code but never returned here.

**Fix:** Add snack window (e.g., 22:00–05:00), or expose a manual override selector in the Snap UI.

### 2.3 Re-logging After Silent Log Failure

**File:** [src/App.jsx](src/App.jsx) — success/cleanup timeout

If the log POST fails silently, `confirmed` state is never cleared. The user can re-submit the same items.

**Fix:** Only clear `confirmed` state inside `.then()` of a successful log call, not after a timeout.

### 2.4 File Input Ref Not Triggered on All Browsers

**File:** [src/App.jsx](src/App.jsx)

`fileInputRef.current?.click()` may not work on iOS Safari if called outside a direct user gesture handler.

**Fix:** Ensure `fileInputRef.current.click()` is called synchronously inside the `onClick` handler, not inside a promise or setTimeout.

---

## Priority 3 — Code Quality & Maintainability

### 3.1 Split App.jsx Into Separate Components

**File:** [src/App.jsx](src/App.jsx) — 1,496 lines, all pages in one file

Create separate files:

```
src/
  components/
    Dashboard.jsx
    SnapPage.jsx
    MenuBrowser.jsx
    Trends.jsx
    ProfilePage.jsx
    BottomNav.jsx
  utils/
    api.js        ← move apiGet/apiPost/apiDelete here
    nutrition.js  ← MEAL_FOR_HOUR, calorie math, etc.
```

### 3.2 Move API Base URL to Environment Variable

**Files:** [src/App.jsx](src/App.jsx), [src/auth.jsx](src/auth.jsx)

Both hardcode `"https://badgerbite-api.onrender.com"`.

**Fix:**

1. Create `.env` at project root:
   ```
   VITE_API_BASE=https://badgerbite-api.onrender.com
   ```
2. Replace all references with `import.meta.env.VITE_API_BASE`
3. Add `.env` to `.gitignore`

### 3.3 Extract Repeated Color/Style Constants

**File:** [src/App.jsx](src/App.jsx)

`"#00f5a0"` and other brand colors appear 150+ times inline.

**Fix:** Add a constants block at the top of the file (or a `src/theme.js`):

```js
const BRAND_GREEN = "#00f5a0";
const BRAND_DARK = "#0f172a";
```

Then replace with variables.

### 3.4 Deduplicate API Helpers

**Files:** [src/App.jsx](src/App.jsx), [src/auth.jsx](src/auth.jsx)

`apiGet`, `apiPost`, `apiDelete` are defined in both files.

**Fix:** Move to `src/utils/api.js` and import in both.

---

## Priority 4 — Missing Features

### 4.1 No Error State When Menu API Is Down

If Nutrislice is unreachable, the Menu page shows nothing with no explanation.

**Fix:** Add an empty state with a message: _"Menu unavailable — try again later"_ and a retry button.

### 4.2 No Auth Loading Guard

**File:** [src/auth.jsx](src/auth.jsx)

Token validation happens asynchronously but no loading state is set during it. This causes an auth UI flash before the app settles.

**Fix:** Add an `isValidating` state, return a spinner until validation completes.

### 4.3 Sodium Not Shown on Dashboard

Sodium is tracked and sent to the API, but the Dashboard macros ring only shows protein/carbs/fat.

**Fix:** Add sodium to the dashboard summary (even just as a text line below the ring).

### 4.4 No Manual Food Entry Fallback

If the Snap AI feature or the menu API is down, users can't log food at all.

**Fix:** Add a simple form to manually enter food name + macros as a fallback path.

---

## Priority 5 — Security

### 5.1 Token in localStorage (XSS Risk)

**File:** [src/auth.jsx](src/auth.jsx)

`localStorage` tokens are accessible to any JS on the page.

**Fix (long-term):** Switch to HttpOnly cookies managed by the backend. For now, document the risk.

### 5.2 No Password Strength Requirement

**File:** [src/auth.jsx](src/auth.jsx)

Only enforces length >= 8.

**Fix:** Add client-side validation for at least one uppercase letter, one number.

### 5.3 Vite Dev Server Open to Network

**File:** [vite.config.js](vite.config.js)

`host: '0.0.0.0'` exposes dev server to LAN.

**Fix:** Remove or change to `host: 'localhost'` unless network access is intentional.

---

## Priority 6 — Accessibility & Polish

- Add `aria-label` to all icon-only buttons in the bottom nav and Snap page
- Add `role="alert"` to error/success toasts
- Ensure color indicators (green/red macros) also have text labels for colorblind users
- Add `<title>` updates per page for screen readers

---

## Quick Reference — File Locations

| Issue               | File                                                      | Notes                   |
| ------------------- | --------------------------------------------------------- | ----------------------- |
| Hardcoded hall name | [src/App.jsx](src/App.jsx)                                | Search `Gordon Ave`     |
| Silent catch blocks | [src/App.jsx](src/App.jsx)                                | Search `.catch(()=>{})` |
| Sodium unit bug     | [src/App.jsx](src/App.jsx)                                | Search `g_sodium`       |
| API URL hardcoded   | [src/auth.jsx](src/auth.jsx) + [src/App.jsx](src/App.jsx) | Search `badgerbite-api` |
| Auth flash          | [src/auth.jsx](src/auth.jsx)                              | Token validation effect |
| Canvas null crash   | [src/App.jsx](src/App.jsx)                                | Search `videoWidth`     |
| Meal type snack     | [src/App.jsx](src/App.jsx)                                | Search `MEAL_FOR_HOUR`  |

---

## Suggested Order of Work

1. Fix the 3 Priority 1 bugs (quick wins, visible to users)
2. Add `.env` support (5 min, prevents accidental key leaks)
3. make pages responsive
4. Fix Priority 2 bugs (stability)
5. Split `App.jsx` into components (enables parallel work on features)
6. Add missing UI states (error, loading, empty)
7. Accessibility pass
8. fix the log dish popup
9. fix the item cards (components going out of display)
10. fix filterson menu page (doesnt look nice)
11. light/dark theme + fix color scheme
12. fix scrolling of menu items (i can see it under search/filter space)

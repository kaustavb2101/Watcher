# TMLI — Open Issues & Tabled Work

Last updated: 2026-03-28

---

## 🔴 HIGH — Data Source Issues

### 1. BOT Exchange Rates API endpoints return 404
- **Product**: Exchange Rates plan (subscribed to AutoX Dataset app)
- **Failing paths**: `/Stat-ExchangeRate/v2/DAILY_AVG_EXG_RATE` and `/Stat-ReferenceRate/v2`
- **Status**: 403→resolved by subscribing, but now 404 — correct sub-path / query params unknown
- **Impact**: Exchange rate data not flowing through Exchange Rates product endpoints
- **Workaround**: USD/THB covered by Spot Rate (`/Stat-SpotRate/v2/SPOTRATE`) from Interest Rates plan ✅
- **Action needed**: Navigate to Exchange Rates Swagger docs on portal and check exact query params for DAILY_AVG_EXG_RATE

### 2. BOT NPL series FINPM00002 ended 2019-12
- **Current series**: `FINPM00002` (Ratio of Gross NPLs to Total Loans) — last data Dec 2019
- **Impact**: NPL ribbon value stays null; `nplRatio` not in liveFields
- **Action needed**: Use `search-series?keyword=NPL+ratio` on gateway to find the current live series code (likely a newer FINPM series)
- **Portal**: `GET https://gateway.api.bot.or.th/search-series?keyword=NPL+ratio&lang=EN` (requires BOT_STATS_KEY)

### 3. BOT FX Reserves, M2, Credit Growth — series codes unknown
- **Impact**: These fields always null in `/api/bot` response
- **Action needed**: Search Statistics API for series codes:
  - FX Reserves: `search-series?keyword=international+reserve`
  - M2 Broad Money: `search-series?keyword=money+supply+M2`
  - Private Credit Growth: `search-series?keyword=private+credit`

---

## 🟡 MEDIUM — DLT Vehicle Data

### 4. DLT CKAN: resource 0bdd38c8 returns vehicle totals but no per-province year comparison
- **Current status**: `รถที่ดำเนินการ` field added to normalizer — CKAN should now aggregate by province ✅ (pending deploy test)
- **Remaining gap**: Vehicle density calculations use current month totals, not annual registrations — BSI mandate may flip on next month's data
- **Action needed**: After deploy, verify `registeredVehicles > 0` for at least 20+ provinces in `/api/dlt` response

### 5. DLT — third resource (428bda63) returns 404
- **Removed** from dlt.js — was "New Vehicle Registrations (Accumulated)"
- **If needed**: Find current resource ID on data.go.th for accumulated registration data

---

## 🟡 MEDIUM — Map / GeoJSON

### 6. Leaflet map GADM URL reliability
- **Issue**: Primary GADM URL (`geodata.ucdavis.edu`) occasionally slow/unreachable
- **Fallback chain**: Natural Earth → GitHub apisanu-t — not verified live
- **Action needed**: Test all 3 fallback URLs; consider hosting province GeoJSON on the project repo itself for reliability

---

## 🟢 LOW — Future Enhancements

### 7. GISTDA satellite data integration
- **Status**: Indicator shows "pending" by design (only triggered during analysis)
- **Current state**: No GISTDA API key or endpoint configured
- **Action needed**: Register for GISTDA GEOS API; add `/api/gistda.js` endpoint

### 8. NSO Labor Force Survey — provincial breakdown
- **Current**: Province population loaded from static array in dlt.js (NSO 2023)
- **Action needed**: Replace with live NSO API call if provincial LFS microdata becomes available via data.go.th

### 9. BOT 10Y Government Bond Yield
- **Old series code**: `GOV10Y` (old API, no longer works)
- **New path**: Under Interest Rates plan — `search-series?keyword=government+bond+10` to find current series
- **Impact**: bond10yYield always null

### 10. OSM Amphoe (district) layer — slow on first load
- **Issue**: Overpass API queries can take 5–15 seconds for large provinces
- **Mitigation**: Consider pre-caching Overpass results or using a local GeoJSON for top-10 provinces by branch count

---

## ✅ Resolved This Session (2026-03-28)

- BOT API migrated from `api.bot.or.th` (broken) to `gateway.api.bot.or.th` ✅
- Auth header changed from `X-IBM-Client-Id` to `Authorization` ✅
- BOT portal app subscribed to Interest Rates and Exchange Rates plans ✅
- Policy Rate endpoint confirmed working (1.00%) ✅
- Spot Rate USD/THB endpoint confirmed working ✅
- DLT normalizer: added `รถที่ดำเนินการ` field, reordered resource priority ✅
- DLT: removed 404 resource (428bda63) ✅
- BOT live indicator threshold lowered from 3 → 2 ✅

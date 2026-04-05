# Watcher Knowledge Base (WKB) — Production Edition

The **Watcher Knowledge Base** is a localized repository of grounded institutional data, enabling high-performance intelligence and map visualization.

## Phase 2: Regional Grounding & Visualization
- **Polygonal Maps**: Added `data/thailand-provinces-geo.json` (OSM Admin Level 1) for regional choropleth maps.
- **Tourism Metrics**: Ingested provincial arrivals and revenue from MOTS.
- **DLT Full Scale**: Ingested 759+ registration records for provincial vehicle density analysis.

## Synchronization Utility
The Knowledge Base includes a dedicated synchronization tool to maintain data recency.

### Monthly Pull Schedule
To refresh the datasets from institutional APIs (data.go.th, HDX, etc.), run:
```bash
node scripts/sync-kb.js
```
**Frequency**: Recommended every **30 days** (Monthly Balance Sheet update).

## Dataset Inventory (Grounded)

| Module | Source | Records | Grounding Scope |
| :--- | :--- | :--- | :--- |
| **DLT Vehicles** | `data.go.th` | 759 | Provincial vehicle density |
| **Labor Force** | `NSO` | 1,000+ | Regional sector-level workforce |
| **Tourism** | `MOTS` | 77 | Regional revenue & arrivals |
| **Climate Risk** | `World Bank` | 77 | Flood/Drought risk scores |
| **Map Boundaries** | `OSM` | 77 | Polygonal GeoJSON boundaries |

## Provincial Normalization
All data is normalized using the `standardizeProvince` utility in `data/provinces.js`, ensuring that `Buri Ram`, `Phra Nakhon Si Ayutthaya`, and other variants are mapped to a single source of truth across all 12+ APIs.

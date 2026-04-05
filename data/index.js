/**
 * WATCHER KNOWLEDGE BASE - SLIM INDEX (Oracle v6.6)
 * Optimized for Edge runtimes. Large datasets are fetched dynamically by the client.
 */

// Core Metadata
import { THAI_PROVINCE_MAP, PROVINCE_ALIASES, PROVINCE_POP, AUTOX_BRANCHES, standardizeProvince } from './provinces.js';

// Metadata/Summaries only
import { DLT_RECORDS, DLT_META } from './dlt-vehicles.js';
import { NSO_LFS_RECORDS, NSO_LFS_MAP, NSO_LFS_META } from './nso-lfs-provincial-summary.js';
import { BOT_MACRO_KB, BOT_META } from './bot-macro.js';
import { COMMODITIES_KB, COMMODITY_META } from './commodities-worldbank.js';
import { CLIMATE_RISK_RECORDS, CLIMATE_META } from './climate-risk.js';
import { GISTDA_AGRI_RECORDS, GISTDA_META } from './gistda-agriculture.js';
import { TOURISM_PROVINCIAL_RECORDS, TOURISM_PROVINCIAL_META } from './tourism-provincial.js';
import { PROVINCIAL_ECONOMY_RECORDS } from './provincial-economy.js';
import { HOUSEHOLD_DEBT_RECORDS, DEBT_META } from './household-debt.js';
import { INFLATION_RECORDS } from './inflation-detail.js';
import { TOURISM_RECORDS, TOURISM_META } from './tourism-intelligence.js';
import { GPP_RECORDS, GPP_META } from './provincial-gpp.js';

export const KnowledgeBase = {
  provinces: {
    map: THAI_PROVINCE_MAP,
    aliases: PROVINCE_ALIASES,
    population: PROVINCE_POP,
    branches: AUTOX_BRANCHES,
    standardize: standardizeProvince,
    geoJson: null // Fetched by client
  },
  dlt: { records: DLT_RECORDS, meta: DLT_META },
  bot: { macro: BOT_MACRO_KB, meta: BOT_META },
  commodities: { prices: COMMODITIES_KB, meta: COMMODITY_META },
  nso: { lfs: NSO_LFS_RECORDS, map: NSO_LFS_MAP, meta: NSO_LFS_META },
  climate: { risk: CLIMATE_RISK_RECORDS, meta: CLIMATE_META },
  gistda: { agri: GISTDA_AGRI_RECORDS, meta: GISTDA_META },
  tourism: { provincial: TOURISM_PROVINCIAL_RECORDS, meta: TOURISM_PROVINCIAL_META },
  economy: { provincial: PROVINCIAL_ECONOMY_RECORDS },
  nso_full: null,
  dlt_full: null,
  debt: { records: HOUSEHOLD_DEBT_RECORDS, meta: DEBT_META },
  inflation: INFLATION_RECORDS,
  tourism_intl: { records: TOURISM_RECORDS, meta: TOURISM_META },
  gpp: { records: GPP_RECORDS, meta: GPP_META }
};

export default KnowledgeBase;

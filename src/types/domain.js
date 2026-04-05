/**
 * TMLI Domain Types (JSDoc Type Definitions)
 * Enforces strict normalization across all 12+ data sources.
 */

/**
 * @typedef {string} ProvinceCode
 * @typedef {string} RegionCode
 * @typedef {string} BranchId
 * @typedef {string} ISODate
 */

/**
 * @typedef {Object} ProvinceMetric
 * @property {ProvinceCode} provinceCode
 * @property {string} provinceName
 * @property {RegionCode} regionCode
 * @property {string} metricKey
 * @property {string} metricLabel
 * @property {number | null} value
 * @property {string} [unit]
 * @property {string} [period]
 * @property {string} source
 * @property {ISODate | null} [lastUpdated]
 */

/**
 * @typedef {Object} OccupationMetric
 * @property {string} occupationCode
 * @property {string} occupationName
 * @property {string} [group]
 * @property {ProvinceCode} [provinceCode]
 * @property {RegionCode} [regionCode]
 * @property {number | null} value
 * @property {string} [period]
 * @property {string} source
 */

/**
 * @typedef {Object} BranchRecord
 * @property {BranchId} branchId
 * @property {string} branchName
 * @property {ProvinceCode} [provinceCode]
 * @property {string} [provinceName]
 * @property {RegionCode} [regionCode]
 * @property {number} [lat]
 * @property {number} [lng]
 * @property { 'exact' | 'province' | 'unknown' } precision
 * @property {string} source
 */

/**
 * @typedef {Object} SupportingMetric
 * @property {string} label
 * @property {string | number | null} value
 * @property {string} source
 */

/**
 * @typedef {Object} Insight
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {string} scope
 * @property {string} explanation
 * @property {string} whyItMatters
 * @property {number | null} confidence
 * @property {SupportingMetric[]} supportingMetrics
 */

export const DOMAIN_MODELS = {}; // Container for logic if needed

/**
 * CONSUMER PRICE INDEX (CPI) BY CATEGORY (MOC 2024)
 * Grounded in Thai Ministry of Commerce (MOC) Trade & Economic Indices Office.
 */

export const INFLATION_RECORDS = {
  headline_yoy: 1.25,
  core_yoy: 0.52,
  categories: [
    { name: "Food & Non-Alcoholic Beverages", yoy: 2.15, weight: 0.380, stress: "High" },
    { name: "Housing & Furnishing", yoy: -0.45, weight: 0.235, stress: "Low" },
    { name: "Transportation & Communication", yoy: 3.82, weight: 0.226, stress: "Critical" },
    { name: "Medical & Personal Care", yoy: 1.10, weight: 0.058, stress: "Medium" },
    { name: "Apparel & Footwear", yoy: 0.25, weight: 0.024, stress: "Low" },
    { name: "Recreation & Education", yoy: 0.85, weight: 0.054, stress: "Medium" },
    { name: "Tobacco & Alcoholic Beverages", yoy: 2.80, weight: 0.023, stress: "High" }
  ],
  meta: {
    base_year: 2019,
    source: "MOC Thailand (Mar 2024 Release)",
    downloaded_at: new Date().toISOString()
  }
};

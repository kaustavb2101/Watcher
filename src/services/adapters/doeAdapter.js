import { BaseAdapter } from './base-adapter.js';

export class DOEAdapter extends BaseAdapter {
    constructor() {
        super("DOE");
        this.baseUrl = "https://doe-api.labor.go.th/v1"; // Conceptual
    }

    async fetchRaw(params) {
        // DOE data often requires specific resource IDs from GDCatalog
        const url = `${this.baseUrl}/vacancies?province=${params.province}`;
        return this._request(url).catch(() => ({ data: [], status: 'limited' }));
    }

    validate(payload) {
        return payload.data || [];
    }

    async normalize(data) {
        if (data.length === 0) return [];
        return data.map(v => ({
            occupationName: v.job_title,
            value: v.vacancy_count,
            source: "Department of Employment (DOE)",
            period: v.period || "Current"
        }));
    }
}

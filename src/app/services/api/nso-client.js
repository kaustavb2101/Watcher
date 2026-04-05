import { BaseAPIClient } from './base-client.js';
import { CONFIG } from '../../config/config.js';

export class NSOClient extends BaseAPIClient {
    constructor() {
        super();
        this.baseUrl = 'https://nso-api.gdcatalog.go.th/service';
    }

    async getBusinessStats(region = 'รวม') {
        const url = `${this.baseUrl}/business/business?page=1&limit=50&filter_key=region&filter_value=${encodeURIComponent(region)}`;
        return this.request(url, {
            headers: {
                'Authorization': `Bearer ${CONFIG.NSO_TOKEN}`,
                'Accept': 'application/json'
            }
        });
    }

    // Generic CKAN resource fetcher
    async fetchResource(datasetId, resourceId) {
        const url = `https://gdcatalog.go.th/api/3/action/resource_show?id=${resourceId}`;
        return this.request(url);
    }
}

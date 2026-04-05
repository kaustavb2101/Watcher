import { BaseAPIClient } from './base-client.js';
import { CONFIG } from '../../config/config.js';

export class GISTDAClient extends BaseAPIClient {
    constructor() {
        super();
        this.baseUrl = 'https://api-gateway.gistda.or.th/api/2.0/resources/gi-service/v2.2';
    }

    async getAgriData(type, lat, lon) {
        const endpoints = {
            'rice': 'agriculture/rice-weekly-40m',
            'rubber': 'agriculture/rubber-yearly-40m',
            'palm': 'agriculture/palm-yearly-40m',
            'sugarcane': 'agriculture/sugarcane-weekly-40m',
            'maize': 'agriculture/maize-weekly-40m',
            'cassava': 'agriculture/cassava-yearly-40m'
        };
        const endpoint = endpoints[type] || endpoints['rice'];
        const url = `${this.baseUrl}/${endpoint}?lat=${lat}&lon=${lon}&api_key=${CONFIG.GISTDA_KEY}`;
        return this.request(url);
    }

    async getImpactLayers() {
        // Placeholder for future impact layer API integration
        // Currently preserving existing functionality by exposing the same data structure
        return [];
    }
}

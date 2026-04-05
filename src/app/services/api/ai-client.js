import { BaseAPIClient } from './base-client.js';
import { CONFIG } from '../../config/config.js';

export class AIClient extends BaseAPIClient {
    constructor() {
        super();
        this.endpoint = `${CONFIG.API_BASE}/analyze`;
    }

    async analyzeEvent(tag, title, ctx, agentType, groundTruth = {}) {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag, title, ctx, agentType, groundTruth })
        });

        if (!response.ok) throw new Error('AI Engine Failure');

        const text = await response.text();
        return this.parseLLMResponse(text);
    }

    parseLLMResponse(text) {
        // Robust extraction from api-client.js fix
        const cleanText = text.replace(/```json\n?|```/g, '').replace(/:\s*\+([0-9]+)/g, ': $1').trim();
        try {
            return JSON.parse(cleanText);
        } catch (e) {
            const match = cleanText.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
            throw new Error('Invalid AI response format');
        }
    }
}

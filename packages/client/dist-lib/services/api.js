"use strict";
/**
 * API Service for Clear AI Client
 *
 * Provides typed API communication with Clear AI servers
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.apiService = exports.ClearAIApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class ClearAIApiService {
    constructor(baseURL = 'http://localhost:3001') {
        this.client = axios_1.default.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.code === 'ECONNREFUSED') {
                throw new Error(`Cannot connect to server at ${baseURL}. Make sure the server is running.`);
            }
            throw new Error(error.response?.data?.message || error.message || 'Request failed');
        });
    }
    /**
     * Check server health
     */
    async getHealth() {
        const response = await this.client.get('/api/health');
        return response.data;
    }
    /**
     * Get available MCP tools
     */
    async getTools() {
        const response = await this.client.get('/api/mcp/tools');
        return response.data.data || [];
    }
    /**
     * Get MCP tool schemas
     */
    async getToolSchemas() {
        const response = await this.client.get('/api/mcp/schemas');
        return response.data;
    }
    /**
     * Execute an MCP tool
     */
    async executeTool(toolName, data = {}) {
        const response = await this.client.post(`/api/mcp/tools/${toolName}/execute`, data);
        return response.data;
    }
    /**
     * Complete a prompt using LLM
     */
    async completePrompt(prompt, options = {}) {
        const response = await this.client.post('/api/langchain/complete', {
            prompt,
            model: options.model || 'ollama',
            temperature: options.temperature || 0.7,
        });
        const data = response.data;
        return data.content || data;
    }
    /**
     * Get available LLM models
     */
    async getModels() {
        const response = await this.client.get('/api/langchain/models');
        return response.data;
    }
    /**
     * Get available models for agent
     */
    async getAvailableModels() {
        const response = await this.client.get('/api/langchain/models');
        if (response.data.success) {
            return response.data.data;
        }
        else {
            throw new Error(response.data.message || 'Failed to get available models');
        }
    }
    /**
     * Execute a workflow
     */
    async executeWorkflow(description, options = {}) {
        const response = await this.client.post('/api/langgraph/execute', {
            description,
            model: options.model || 'ollama',
        });
        return response.data;
    }
    /**
     * Execute an intelligent agent query
     */
    async executeAgentQuery(query, options = {}) {
        const response = await this.client.post('/api/agent/execute', {
            query,
            options: {
                userId: options.userId || 'default-user',
                sessionId: options.sessionId || `session-${Date.now()}`,
                includeMemoryContext: options.includeMemoryContext !== false,
                includeReasoning: options.includeReasoning !== false,
                model: options.model || 'openai',
                temperature: options.temperature || 0.7,
            }
        });
        return response.data;
    }
    /**
     * Update server URL
     */
    setBaseURL(url) {
        this.client.defaults.baseURL = url;
    }
    /**
     * Get current server URL
     */
    getBaseURL() {
        return this.client.defaults.baseURL || '';
    }
}
exports.ClearAIApiService = ClearAIApiService;
// Default instance
exports.apiService = new ClearAIApiService();
// Export the client instance for direct use
exports.apiClient = exports.apiService;
//# sourceMappingURL=api.js.map
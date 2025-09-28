"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';
class ApiClient {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Add request interceptor for logging
        this.client.interceptors.request.use((config) => {
            console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
            return config;
        }, (error) => {
            console.error('Request error:', error);
            return Promise.reject(error);
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => {
            console.log(`Response received from ${response.config.url}:`, response.status);
            return response;
        }, (error) => {
            console.error('Response error:', error.response?.data || error.message);
            return Promise.reject(error);
        });
    }
    // Generic GET request
    async get(endpoint) {
        try {
            const response = await this.client.get(endpoint);
            return response.data;
        }
        catch (error) {
            return this.handleError(error, 'GET', endpoint);
        }
    }
    // Generic POST request
    async post(endpoint, data) {
        try {
            const response = await this.client.post(endpoint, data);
            return response.data;
        }
        catch (error) {
            return this.handleError(error, 'POST', endpoint);
        }
    }
    // Generic PUT request
    async put(endpoint, data) {
        try {
            const response = await this.client.put(endpoint, data);
            return response.data;
        }
        catch (error) {
            return this.handleError(error, 'PUT', endpoint);
        }
    }
    // Generic DELETE request
    async delete(endpoint) {
        try {
            const response = await this.client.delete(endpoint);
            return response.data;
        }
        catch (error) {
            return this.handleError(error, 'DELETE', endpoint);
        }
    }
    // Health check
    async healthCheck() {
        return this.get('/api/health');
    }
    // MCP Tools
    async getTools() {
        return this.get('/api/mcp/tools');
    }
    async getToolSchemas() {
        return this.get('/api/mcp/schemas');
    }
    async getToolSchema(toolName) {
        return this.get(`/api/mcp/schemas/${toolName}`);
    }
    async executeTool(toolName, toolArguments) {
        const request = { toolName, arguments: toolArguments || {} };
        return this.post('/api/mcp/execute', request);
    }
    // Error handling
    handleError(error, method, endpoint) {
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
        const statusCode = error.response?.status || 500;
        console.error(`API Error [${method} ${endpoint}]:`, {
            status: statusCode,
            message: errorMessage,
            details: error.response?.data
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}
// Export singleton instance
exports.apiClient = new ApiClient();
exports.default = exports.apiClient;
//# sourceMappingURL=api.js.map
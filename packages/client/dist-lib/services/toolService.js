"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolService = void 0;
const api_1 = require("./api");
exports.toolService = {
    async getTools() {
        const response = await api_1.apiClient.getTools();
        // The API returns the data directly, not wrapped
        return response || [];
    },
    async getToolSchemas() {
        try {
            const response = await api_1.apiClient.getToolSchemas();
            return response;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to load tool schemas'
            };
        }
    },
    async executeTool(toolName, toolArguments) {
        return api_1.apiClient.executeTool(toolName, toolArguments);
    },
};
//# sourceMappingURL=toolService.js.map
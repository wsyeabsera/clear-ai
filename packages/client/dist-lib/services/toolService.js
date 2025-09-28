"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolService = void 0;
const api_1 = require("./api");
exports.toolService = {
    async getTools() {
        return api_1.apiClient.getTools();
    },
    async getToolSchemas() {
        return api_1.apiClient.getToolSchemas();
    },
    async getToolSchema(toolName) {
        return api_1.apiClient.getToolSchema(toolName);
    },
    async executeTool(toolName, toolArguments) {
        return api_1.apiClient.executeTool(toolName, toolArguments);
    },
};
//# sourceMappingURL=toolService.js.map
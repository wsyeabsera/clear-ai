"use strict";
/**
 * @clear-ai/core - Main entry point
 *
 * Clear AI - A modern TypeScript framework for building AI-powered applications
 * with tool execution and workflow orchestration.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.ClearAI = exports.executeParallelTool = exports.fileReaderTool = exports.jsonReaderTool = exports.apiCallTool = exports.ToolRegistry = exports.MCPServer = void 0;
// Re-export everything from subpackages directly from their dist files
__exportStar(require("../packages/shared/dist/index"), exports);
__exportStar(require("../packages/server/dist/index"), exports);
// Re-export specific items from mcp-basic package to avoid conflicts
var index_1 = require("../packages/mcp-basic/dist/index");
Object.defineProperty(exports, "MCPServer", { enumerable: true, get: function () { return index_1.MCPServer; } });
Object.defineProperty(exports, "ToolRegistry", { enumerable: true, get: function () { return index_1.ToolRegistry; } });
var tools_1 = require("../packages/mcp-basic/dist/tools");
Object.defineProperty(exports, "apiCallTool", { enumerable: true, get: function () { return tools_1.apiCallTool; } });
Object.defineProperty(exports, "jsonReaderTool", { enumerable: true, get: function () { return tools_1.jsonReaderTool; } });
Object.defineProperty(exports, "fileReaderTool", { enumerable: true, get: function () { return tools_1.fileReaderTool; } });
Object.defineProperty(exports, "executeParallelTool", { enumerable: true, get: function () { return tools_1.executeParallelTool; } });
__exportStar(require("../packages/mcp-basic/dist/schema-utils"), exports);
// Main framework exports
var framework_1 = require("./framework");
Object.defineProperty(exports, "ClearAI", { enumerable: true, get: function () { return framework_1.ClearAI; } });
// Version info
exports.version = '1.0.0';
//# sourceMappingURL=index.js.map
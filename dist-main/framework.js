"use strict";
/**
 * @clear-ai/core - Main framework class
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearAI = void 0;
const index_1 = require("../packages/mcp-basic/dist/index");
const index_2 = require("../packages/shared/dist/index");
/**
 * Main ClearAI framework class
 */
class ClearAI {
    constructor(config = {}) {
        this.config = config;
    }
    /**
     * Initialize the MCP server
     */
    async initMCP() {
        if (!this.mcpServer) {
            this.mcpServer = new index_1.MCPServer();
            await this.mcpServer.start();
        }
        return this.mcpServer;
    }
    /**
     * Initialize the LLM service
     */
    async initLLM() {
        if (!this.langchainService && this.config.llm) {
            this.langchainService = new index_2.SimpleLangChainService({
                openaiApiKey: this.config.llm.openaiApiKey || '',
                openaiModel: 'gpt-3.5-turbo',
                ollamaBaseUrl: this.config.llm.ollamaBaseUrl || 'http://localhost:11434',
                ollamaModel: 'mistral:latest',
                mistralApiKey: this.config.llm.mistralApiKey || '',
                mistralModel: 'mistral-small',
                groqApiKey: this.config.llm.groqApiKey || '',
                groqModel: 'llama2-70b-4096',
                langfuseSecretKey: this.config.llm.langfuseSecretKey || '',
                langfusePublicKey: this.config.llm.langfusePublicKey || '',
                langfuseBaseUrl: this.config.llm.langfuseBaseUrl || 'https://cloud.langfuse.com'
            });
        }
        return this.langchainService;
    }
    /**
     * Initialize the tool execution service
     */
    async initTools() {
        if (!this.toolService) {
            // ToolExecutionService expects CoreKeysAndModels, not SimpleLangChainService
            const llmConfig = {
                openaiApiKey: this.config.llm?.openaiApiKey || '',
                openaiModel: 'gpt-3.5-turbo',
                ollamaBaseUrl: this.config.llm?.ollamaBaseUrl || 'http://localhost:11434',
                ollamaModel: 'mistral:latest',
                mistralApiKey: this.config.llm?.mistralApiKey || '',
                mistralModel: 'mistral-small',
                groqApiKey: this.config.llm?.groqApiKey || '',
                groqModel: 'llama2-70b-4096',
                langfuseSecretKey: this.config.llm?.langfuseSecretKey || '',
                langfusePublicKey: this.config.llm?.langfusePublicKey || '',
                langfuseBaseUrl: this.config.llm?.langfuseBaseUrl || 'https://cloud.langfuse.com'
            };
            this.toolService = new index_2.ToolExecutionService(llmConfig);
        }
        return this.toolService;
    }
    /**
     * Initialize the workflow service
     */
    // async initWorkflows(): Promise<SimpleWorkflowService> {
    //   if (!this.workflowService) {
    //     const llm = await this.initLLM();
    //     const tools = await this.initTools();
    //     this.workflowService = new SimpleWorkflowService(llm, tools);
    //   }
    //   return this.workflowService;
    // }
    /**
     * Initialize the server
     */
    async initServer() {
        // Server initialization would need to be implemented
        // For now, return a placeholder
        return null;
    }
    /**
     * Initialize all services
     */
    async init() {
        await Promise.all([
            this.initMCP(),
            this.initLLM(),
            this.initTools(),
            this.initServer()
        ]);
    }
    /**
     * Get the MCP server
     */
    getMCP() {
        return this.mcpServer;
    }
    /**
     * Get the LLM service
     */
    getLLM() {
        return this.langchainService;
    }
    /**
     * Get the tool service
     */
    getTools() {
        return this.toolService;
    }
    /**
     * Get the workflow service
     */
    // getWorkflows(): SimpleWorkflowService | undefined {
    //   return this.workflowService;
    // }
    /**
     * Get the server
     */
    getServer() {
        return this.server;
    }
}
exports.ClearAI = ClearAI;
//# sourceMappingURL=framework.js.map
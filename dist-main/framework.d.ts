/**
 * @clear-ai/core - Main framework class
 */
import { MCPServer } from '../packages/mcp-basic/dist/index';
import { SimpleLangChainService, ToolExecutionService } from '../packages/shared/dist/index';
export interface ClearAIConfig {
    mcp?: {
        tools?: string[];
    };
    llm?: {
        openaiApiKey?: string;
        ollamaBaseUrl?: string;
        mistralApiKey?: string;
        groqApiKey?: string;
        langfuseSecretKey?: string;
        langfusePublicKey?: string;
        langfuseBaseUrl?: string;
    };
    server?: {
        port?: number;
        cors?: any;
    };
}
/**
 * Main ClearAI framework class
 */
export declare class ClearAI {
    private config;
    private mcpServer?;
    private langchainService?;
    private toolService?;
    private server?;
    constructor(config?: ClearAIConfig);
    /**
     * Initialize the MCP server
     */
    initMCP(): Promise<MCPServer>;
    /**
     * Initialize the LLM service
     */
    initLLM(): Promise<SimpleLangChainService>;
    /**
     * Initialize the tool execution service
     */
    initTools(): Promise<ToolExecutionService>;
    /**
     * Initialize the workflow service
     */
    /**
     * Initialize the server
     */
    initServer(): Promise<any>;
    /**
     * Initialize all services
     */
    init(): Promise<void>;
    /**
     * Get the MCP server
     */
    getMCP(): MCPServer | undefined;
    /**
     * Get the LLM service
     */
    getLLM(): SimpleLangChainService | undefined;
    /**
     * Get the tool service
     */
    getTools(): ToolExecutionService | undefined;
    /**
     * Get the workflow service
     */
    /**
     * Get the server
     */
    getServer(): any;
}
//# sourceMappingURL=framework.d.ts.map
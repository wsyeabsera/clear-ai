/**
 * API Service for Clear AI Client
 *
 * Provides typed API communication with Clear AI servers
 */
import axios from 'axios';
type AxiosInstance = ReturnType<typeof axios.create>;
export interface ServerHealth {
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
}
export interface MCPTool {
    name: string;
    description: string;
    status: string;
    inputSchema?: any;
}
export interface LLMModel {
    name: string;
    provider: string;
    status: string;
}
export interface WorkflowResult {
    success: boolean;
    result: any;
    steps: any[];
    duration: number;
}
export declare class ClearAIApiService {
    client: AxiosInstance;
    constructor(baseURL?: string);
    /**
     * Check server health
     */
    getHealth(): Promise<ServerHealth>;
    /**
     * Get available MCP tools
     */
    getTools(): Promise<MCPTool[]>;
    /**
     * Get MCP tool schemas
     */
    getToolSchemas(): Promise<{
        success: boolean;
        data?: any[];
        error?: string;
    }>;
    /**
     * Execute an MCP tool
     */
    executeTool(toolName: string, data?: any): Promise<any>;
    /**
     * Complete a prompt using LLM
     */
    completePrompt(prompt: string, options?: {
        model?: string;
        temperature?: number;
    }): Promise<string>;
    /**
     * Get available LLM models
     */
    getModels(): Promise<LLMModel[]>;
    /**
     * Execute a workflow
     */
    executeWorkflow(description: string, options?: {
        model?: string;
    }): Promise<WorkflowResult>;
    /**
     * Update server URL
     */
    setBaseURL(url: string): void;
    /**
     * Get current server URL
     */
    getBaseURL(): string;
}
export declare const apiService: ClearAIApiService;
export declare const apiClient: ClearAIApiService;
export {};
//# sourceMappingURL=api.d.ts.map
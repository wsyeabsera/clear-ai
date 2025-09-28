/**
 * @clear-ai/core - Main framework class
 */

import { MCPServer } from '../packages/mcp-basic/dist/index';
import { SimpleLangChainService, ToolExecutionService, SimpleWorkflowService, CoreKeysAndModels } from '../packages/shared/dist/index';
import { createServer, CreateServerOptions } from '../packages/server/dist/createServer';

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
export class ClearAI {
  private mcpServer?: MCPServer;
  private langchainService?: SimpleLangChainService;
  private toolService?: ToolExecutionService;
  private workflowService?: SimpleWorkflowService;
  private server?: any;

  constructor(private config: ClearAIConfig = {}) {}

  /**
   * Initialize the MCP server
   */
  async initMCP(): Promise<MCPServer> {
    if (!this.mcpServer) {
      this.mcpServer = new MCPServer();
      await this.mcpServer.start();
    }
    return this.mcpServer;
  }

  /**
   * Initialize the LLM service
   */
  async initLLM(): Promise<SimpleLangChainService> {
    if (!this.langchainService && this.config.llm) {
      this.langchainService = new SimpleLangChainService({
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
    return this.langchainService!;
  }

  /**
   * Initialize the tool execution service
   */
  async initTools(): Promise<ToolExecutionService> {
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
      this.toolService = new ToolExecutionService(llmConfig);
    }
    return this.toolService;
  }

  /**
   * Initialize the workflow service
   */
  async initWorkflows(input: CoreKeysAndModels): Promise<SimpleWorkflowService> {
    if (!this.workflowService) {
      const llm = input;
      const tools = await this.initTools();
      this.workflowService = new SimpleWorkflowService(llm, tools);
    }
    return this.workflowService;
  }

  /**
   * Initialize the server
   */
  async initServer(): Promise<any> {
    if (!this.server && this.config.server) {
      const serverOptions: CreateServerOptions = {
        port: this.config.server.port,
        cors: this.config.server.cors,
        mcpConfig: this.config.mcp,
        llmConfig: this.config.llm
      };
      this.server = createServer(serverOptions);
    }
    return this.server;
  }

  /**
   * Initialize all services
   */
  async init(input: CoreKeysAndModels): Promise<void> {
    await Promise.all([
      this.initMCP(),
      this.initLLM(),
      this.initTools(),
      this.initWorkflows(input),
      this.initServer()
    ]);
  }

  /**
   * Get the MCP server
   */
  getMCP(): MCPServer | undefined {
    return this.mcpServer;
  }

  /**
   * Get the LLM service
   */
  getLLM(): SimpleLangChainService | undefined {
    return this.langchainService;
  }

  /**
   * Get the tool service
   */
  getTools(): ToolExecutionService | undefined {
    return this.toolService;
  }

  /**
   * Get the workflow service
   */
  getWorkflows(): SimpleWorkflowService | undefined {
    return this.workflowService;
  }

  /**
   * Get the server
   */
  getServer(): any {
    return this.server;
  }
}

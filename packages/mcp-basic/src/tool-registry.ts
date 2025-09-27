import { Tool, ZodTool } from './types';
import { apiCallTool, jsonReaderTool, fileReaderTool } from './tools';

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.registerTool(apiCallTool);
    this.registerTool(jsonReaderTool);
    this.registerTool(fileReaderTool);
  }

  registerTool(tool: ZodTool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  async executeTool(name: string, args: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }

    try {
      return await tool.execute(args);
    } catch (error: any) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  }
}

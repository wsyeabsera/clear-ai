import { Request, Response } from 'express';
import { ToolRegistry } from '@clear-ai/mcp-basic';

const toolRegistry = new ToolRegistry();

export const mcpController = {
  /**
   * Execute a tool with the given name and arguments
   */
  async executeTool(req: Request, res: Response): Promise<void> {
    try {
      const { toolName, arguments: args } = req.body;

      if (!toolName) {
        res.status(400).json({
          success: false,
          message: 'Tool name is required',
        });
        return;
      }

      const result = await toolRegistry.executeTool(toolName, args || {});

      res.json({
        success: true,
        data: result,
        message: `Tool '${toolName}' executed successfully`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Tool execution failed',
      });
    }
  },

  /**
   * Get all available tools
   */
  async getTools(req: Request, res: Response): Promise<void> {
    try {
      const tools = toolRegistry.getAllTools();
      
      res.json({
        success: true,
        data: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
        })),
        message: 'Tools retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve tools',
      });
    }
  },
};

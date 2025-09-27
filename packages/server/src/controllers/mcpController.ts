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

  /**
   * Get all available tool schemas
   */
  async getToolSchemas(req: Request, res: Response): Promise<void> {
    try {
      const schemas = toolRegistry.getAllToolSchemas();
      
      res.json({
        success: true,
        data: schemas,
        message: 'Tool schemas retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve tool schemas',
      });
    }
  },

  /**
   * Get a specific tool schema by name
   */
  async getToolSchema(req: Request, res: Response): Promise<void> {
    try {
      const { toolName } = req.params;

      if (!toolName) {
        res.status(400).json({
          success: false,
          message: 'Tool name is required',
        });
        return;
      }

      const schema = toolRegistry.getToolSchema(toolName);
      
      res.json({
        success: true,
        data: schema,
        message: `Schema for tool '${toolName}' retrieved successfully`,
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message || 'Failed to retrieve tool schema',
        });
      }
    }
  },
};

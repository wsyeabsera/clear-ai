import { ApiResponse } from '@clear-ai/shared';
export interface ToolInfo {
    name: string;
    description: string;
}
export interface ToolSchema {
    name: string;
    description: string;
    inputSchema: any;
    outputSchema?: any;
}
export declare const toolService: {
    getTools(): Promise<ApiResponse<ToolInfo[]>>;
    getToolSchemas(): Promise<ApiResponse<ToolSchema[]>>;
    getToolSchema(toolName: string): Promise<ApiResponse<ToolSchema>>;
    executeTool(toolName: string, toolArguments?: Record<string, any>): Promise<ApiResponse<any>>;
};
//# sourceMappingURL=toolService.d.ts.map
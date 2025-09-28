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
    getTools(): Promise<ToolInfo[]>;
    getToolSchemas(): Promise<{
        success: boolean;
        data?: ToolSchema[];
        error?: string;
    }>;
    executeTool(toolName: string, toolArguments?: Record<string, any>): Promise<any>;
};
//# sourceMappingURL=toolService.d.ts.map
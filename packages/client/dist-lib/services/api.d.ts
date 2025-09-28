import { ApiResponse } from '@clear-ai/shared';
declare class ApiClient {
    private client;
    constructor();
    get<T>(endpoint: string): Promise<ApiResponse<T>>;
    post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
    put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
    delete<T>(endpoint: string): Promise<ApiResponse<T>>;
    healthCheck(): Promise<ApiResponse<{
        status: string;
        timestamp: string;
    }>>;
    getTools(): Promise<ApiResponse<Array<{
        name: string;
        description: string;
    }>>>;
    getToolSchemas(): Promise<ApiResponse<Array<any>>>;
    getToolSchema(toolName: string): Promise<ApiResponse<any>>;
    executeTool(toolName: string, toolArguments?: Record<string, any>): Promise<ApiResponse<any>>;
    private handleError;
}
export declare const apiClient: ApiClient;
export default apiClient;
//# sourceMappingURL=api.d.ts.map
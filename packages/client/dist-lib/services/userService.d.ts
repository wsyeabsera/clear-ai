import { User, ApiResponse } from '@clear-ai/shared';
export declare const userService: {
    getUsers(): Promise<ApiResponse<User[]>>;
    getUser(id: string): Promise<ApiResponse<User>>;
    createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<User>>;
};
//# sourceMappingURL=userService.d.ts.map
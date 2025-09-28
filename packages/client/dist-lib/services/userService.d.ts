import { User } from '@clear-ai/shared';
export declare const userService: {
    getUsers(): Promise<User[]>;
    getUser(id: string): Promise<User>;
    createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
};
//# sourceMappingURL=userService.d.ts.map
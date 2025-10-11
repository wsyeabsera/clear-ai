interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const userService: {
    getUsers(): Promise<User[]>;
    getUser(id: string): Promise<User>;
    createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
};
export {};
//# sourceMappingURL=userService.d.ts.map
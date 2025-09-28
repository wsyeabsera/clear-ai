"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const api_1 = require("./api");
exports.userService = {
    async getUsers() {
        return api_1.apiClient.get('/api/users');
    },
    async getUser(id) {
        return api_1.apiClient.get(`/api/users/${id}`);
    },
    async createUser(userData) {
        return api_1.apiClient.post('/api/users', userData);
    },
};
//# sourceMappingURL=userService.js.map
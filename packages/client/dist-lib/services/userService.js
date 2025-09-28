"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const api_1 = require("./api");
exports.userService = {
    async getUsers() {
        const response = await api_1.apiClient.client.get('/api/users');
        // Handle both direct array response and wrapped response
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return response.data.data || [];
    },
    async getUser(id) {
        return api_1.apiClient.client.get(`/api/users/${id}`).then(res => res.data);
    },
    async createUser(userData) {
        return api_1.apiClient.client.post('/api/users', userData).then(res => res.data);
    },
};
//# sourceMappingURL=userService.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchController = void 0;
const launch_service_1 = require("../services/launch.service");
class LaunchController {
    /**
     * Handle requests from main.js routing for /api/profiles/launch/*
     * Parse method and URL to call appropriate method
     */
    static async handleRequest(method, url, data, headers = {}, authenticatedUser = null) {
        try {
            // Parse URL path: /api/profiles/launch/123/workflows/456 -> /123/workflows/456
            const urlParts = url.split('/').filter(part => part !== '');
            const path = '/' + urlParts.slice(3).join('/'); // Remove 'api', 'profiles', 'launch'
            switch (method) {
                case 'POST':
                    if (path === '/') {
                        // /api/profiles/launch
                        return await this.handleLaunchProfile(data, authenticatedUser);
                    }
                    else if (path === '/concurrent') {
                        // /api/profiles/launch/concurrent
                        return await this.handleLaunchConcurrentProfiles(data, authenticatedUser);
                    }
                    else if (path === '/groups/concurrent') {
                        // /api/profiles/launch/groups/concurrent
                        return await this.handleLaunchConcurrentGroupProfiles(data, authenticatedUser);
                    }
                    else if (path.match(/^\/\d+\/workflows\/\d+$/)) {
                        // /123/workflows/456
                        const pathParts = path.split('/');
                        const profileId = pathParts[1];
                        const workflowId = pathParts[3];
                        return await this.handleExecuteWorkflowWithProfile(profileId, workflowId, data, authenticatedUser);
                    }
                    else if (path === '/workflows/profiles') {
                        // /api/profiles/launch/workflows/profiles
                        return await this.handleExecuteWorkflowWithProfiles(data, authenticatedUser);
                    }
                    else if (path === '/workflows/groups') {
                        // /api/profiles/launch/workflows/groups
                        return await this.handleExecuteWorkflowWithProfileGroup(data, authenticatedUser);
                    }
                    else {
                        throw new Error(`Unknown POST route: ${path}`);
                    }
                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        }
        catch (error) {
            console.error('LaunchController.handleRequest error:', error);
            throw error;
        }
    }
    // Embedded handlers that call business logic directly
    static async handleLaunchProfile(data, authenticatedUser) {
        try {
            console.log("🚀 LaunchController.handleLaunchProfile called with:", { profileId: data.profileId, userId: authenticatedUser?.id });
            const { profileId, options = {} } = data;
            if (!profileId) {
                console.error("❌ Profile ID is missing");
                throw new Error("Profile ID là bắt buộc");
            }
            if (!authenticatedUser || !authenticatedUser.id) {
                console.error("❌ User not authenticated");
                throw new Error("Không được phép: Không tìm thấy User ID");
            }
            console.log(`📞 Calling LaunchService.launchProfile for profile ${profileId}...`);
            const result = await launch_service_1.LaunchService.launchProfile(authenticatedUser.id, profileId.toString(), options);
            console.log(`✅ LaunchService.launchProfile returned:`, result);
            return {
                success: true,
                profileId: result.profileId || profileId,
                sessionId: result.sessionId || result.profileId || profileId,
                message: result.message || "Profile đã được khởi chạy thành công",
            };
        }
        catch (error) {
            console.error("❌ Error in handleLaunchProfile:", error);
            throw new Error(error.message || "Không thể khởi chạy profile");
        }
    }
    static async handleLaunchConcurrentProfiles(data, authenticatedUser) {
        try {
            const { profileIds, concurrent, options = {} } = data;
            if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
                throw new Error("Danh sách Profile ID là bắt buộc và phải là mảng không rỗng");
            }
            if (!concurrent || concurrent <= 0) {
                throw new Error("Số luồng đồng thời phải là số nguyên dương");
            }
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error("Không được phép: Không tìm thấy User ID");
            }
            const sessions = await launch_service_1.LaunchService.launchConcurrentProfiles(authenticatedUser.id, profileIds, concurrent, options);
            return {
                success: true,
                sessions: Array.isArray(sessions) ? sessions.map((session) => session.id) : [],
                message: "Các profile đã được khởi chạy đồng thời",
            };
        }
        catch (error) {
            console.error("Lỗi khi khởi chạy đồng thời các profile:", error);
            throw new Error(error.message || "Không thể khởi chạy đồng thời các profile");
        }
    }
    static async handleLaunchConcurrentGroupProfiles(data, authenticatedUser) {
        try {
            const { groupId, concurrent, options = {} } = data;
            if (!groupId) {
                throw new Error("Group ID là bắt buộc");
            }
            if (!concurrent || concurrent <= 0) {
                throw new Error("Số luồng đồng thời phải là số nguyên dương");
            }
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = authenticatedUser.id;
            const sessions = await launch_service_1.LaunchService.launchConcurrentGroupProfiles(userId, groupId, concurrent, options);
            return {
                success: true,
                sessions: Array.isArray(sessions) ? sessions.map((session) => session.id) : [],
                message: "Các profile trong group đã được khởi chạy đồng thời",
            };
        }
        catch (error) {
            console.error("Lỗi khi khởi chạy đồng thời group profile:", error);
            throw new Error(error.message || "Không thể khởi chạy đồng thời group profile");
        }
    }
    static async handleExecuteWorkflowWithProfile(profileId, workflowId, data, authenticatedUser) {
        try {
            const options = data.options || {};
            if (!profileId || !workflowId) {
                throw new Error("Profile ID and Workflow ID are required");
            }
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = authenticatedUser.id;
            const execution = await launch_service_1.LaunchService.executeWorkflowWithProfile(userId, profileId, workflowId, options);
            if (!execution) {
                throw new Error("Không thể thực thi workflow với profile");
            }
            return {
                success: true,
                executionId: execution.id,
                status: execution.status,
            };
        }
        catch (error) {
            throw new Error(error.message || "Lỗi khi thực thi workflow với profile");
        }
    }
    static async handleExecuteWorkflowWithProfiles(data, authenticatedUser) {
        try {
            const { profileIds, workflowId, concurrent } = data;
            if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
                throw new Error("Profile IDs array is required");
            }
            if (!workflowId) {
                throw new Error("Workflow ID is required");
            }
            if (!concurrent || concurrent <= 0) {
                throw new Error("Concurrent must be a positive integer");
            }
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = authenticatedUser.id;
            const executions = await launch_service_1.LaunchService.executeWorkflowWithProfiles(userId, profileIds, workflowId, concurrent);
            const executionsTyped = executions.map((exec) => ({
                id: String(exec.id),
                status: exec.status,
            }));
            return {
                success: true,
                executions: executionsTyped.map((exec) => ({
                    executionId: exec.id,
                    status: exec.status,
                })),
            };
        }
        catch (error) {
            throw new Error(error.message || "Lỗi khi thực thi workflow với danh sách profiles");
        }
    }
    static async handleExecuteWorkflowWithProfileGroup(data, authenticatedUser) {
        try {
            const { groupId, workflowId, concurrent } = data;
            if (!groupId || !workflowId || !concurrent || concurrent <= 0) {
                throw new Error("Group ID, Workflow ID, and valid concurrent value are required");
            }
            if (!authenticatedUser || !authenticatedUser.id) {
                throw new Error('User not authenticated');
            }
            const userId = authenticatedUser.id;
            const executions = await launch_service_1.LaunchService.executeWorkflowWithProfileGroup(userId, groupId, workflowId, concurrent);
            const executionsTyped = executions.map((exec) => ({
                id: String(exec.id),
                status: exec.status,
            }));
            return {
                success: true,
                executions: executionsTyped.map((exec) => ({
                    executionId: exec.id,
                    status: exec.status,
                })),
            };
        }
        catch (error) {
            throw new Error(error.message || "Lỗi khi thực thi workflow với profile group");
        }
    }
}
exports.LaunchController = LaunchController;

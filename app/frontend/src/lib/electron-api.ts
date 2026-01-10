// Electron API adapter để thay thế HTTP requests bằng IPC
import { TokenManager } from './token-manager';

declare global {
  interface Window {
    electronAPI: {
      backendRequest: (method: string, url: string, data?: any, headers?: any) => Promise<any>;
      profileLaunch: (profileId: string) => Promise<any>;
      workflowExecute: (workflowId: string, profileIds: string[], options?: any) => Promise<any>;
      onBackendReady: (callback: () => void) => void;
      onProfileLaunched: (callback: (data: any) => void) => void;
      onWorkflowCompleted: (callback: (data: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
    platform: {
      isElectron: boolean;
      platform: string;
      version: string;
    };
  }
}

export class ElectronAPIClient {
  static isElectron(): boolean {
    // Kiểm tra xem đang chạy trong môi trường Electron hay không
    return typeof window !== 'undefined' && window.platform?.isElectron === true;
  }

  static async request(method: string, url: string, data?: any): Promise<Response> {
    console.log(`🔵 ElectronAPIClient.request called: method=${method}, url=${url}`);
    console.log(`🔵 isElectron():`, this.isElectron());
    console.log(`🔵 window.electronAPI:`, typeof window !== 'undefined' ? (window as any).electronAPI : 'window undefined');

    // Tự động thêm Authorization header nếu có token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = TokenManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!this.isElectron()) {
      console.log(`⚠️ Not in Electron mode, using fetch fallback`);
      // Fallback cho web mode
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
      });
      return response;
    }

    // Electron mode - sử dụng IPC với headers
    console.log(`📡 ElectronAPIClient.request: Calling IPC with method=${method}, url=${url}`);
    console.log(`📦 IPC data:`, data);
    console.log(`📋 IPC headers:`, headers);
    
    try {
      const result = await window.electronAPI.backendRequest(method, url, data, headers);
      console.log(`✅ IPC response received:`, result);
      
      // Xử lý response từ backend một cách chính xác
      let status = 200;
      let statusText = 'OK';
      let responseData = result;
    
    // Nếu backend trả về object có status code (từ main.mjs)
    if (result && typeof result === 'object') {
      if (result.status) {
        status = result.status;
        // Usar solo caracteres ASCII para statusText (evitar caracteres vietnamitas)
        const rawStatusText = result.statusText || (status >= 400 ? 'Error' : 'OK');
        statusText = rawStatusText.replace(/[^\x00-\x7F]/g, '').substring(0, 50) || (status >= 400 ? 'Error' : 'OK');
        // Nếu có data, sử dụng data, ngược lại sử dụng toàn bộ result
        responseData = result.ok === false ? result : (result.data || result);
      } else if (result.error) {
        status = result.error.status || 500;
        const rawErrorText = result.error.message || 'Internal Server Error';
        statusText = rawErrorText.replace(/[^\x00-\x7F]/g, '').substring(0, 50) || 'Internal Server Error';
        responseData = result;
      } else if (result.success === false) {
        status = 400;
        statusText = 'Bad Request';
      }
    }
    
      // Tạo Response object với status chính xác
      const response = new Response(JSON.stringify(responseData), {
        status,
        statusText,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ ElectronAPIClient.request: Returning response with status=${status}`);
      return response;
    } catch (error) {
      console.error(`❌ ElectronAPIClient.request: IPC call failed:`, error);
      throw error;
    }
  }

  // Profile management methods
  static async launchProfile(profileId: string): Promise<any> {
    if (!this.isElectron()) {
      throw new Error('Profile launch is only available in Electron mode');
    }
    return await window.electronAPI.profileLaunch(profileId);
  }

  // Workflow execution methods
  static async executeWorkflow(workflowId: string, profileIds: string[], options?: any): Promise<any> {
    if (!this.isElectron()) {
      throw new Error('Workflow execution is only available in Electron mode');
    }
    return await window.electronAPI.workflowExecute(workflowId, profileIds, options);
  }

  // Event listeners
  static onBackendReady(callback: () => void): void {
    if (this.isElectron()) {
      window.electronAPI.onBackendReady(callback);
    }
  }

  static onProfileLaunched(callback: (data: any) => void): void {
    if (this.isElectron()) {
      window.electronAPI.onProfileLaunched(callback);
    }
  }

  static onWorkflowCompleted(callback: (data: any) => void): void {
    if (this.isElectron()) {
      window.electronAPI.onWorkflowCompleted(callback);
    }
  }

  static removeAllListeners(channel: string): void {
    if (this.isElectron()) {
      window.electronAPI.removeAllListeners(channel);
    }
  }
}
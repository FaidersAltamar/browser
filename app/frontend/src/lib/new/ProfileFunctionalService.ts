import { ElectronAPIClient } from '../electron-api';
import { Group, Profile, CreateProfileData, UpdateProfileData, CreateGroupData, UpdateGroupData, FingerprintInfo, ProfileProxyInfo } from '../types';
import { handleArrayResponse, handleObjectResponse, handleMutationResponse, } from '../../utils/error-utils';
import { type AddToGroupPayload } from "../../components/profile/group-select-dialog";

/**
 * Service for handling profile-related API calls
 * Chức năng này được sử dụng trong các pages:
 * - ProfilePage
 * - WorkflowPage (để chọn profile cho workflow)
 * - Các page khác cần thông tin profile
 */
export const ProfileFunctionalService = {
  /**
   * === CÁC API CALL CHUẨN ===
   */

  /**
   * Get all profiles for the current user
   * @returns {Promise<Profile[]>} Array of profiles
   */
  async getProfiles(): Promise<Profile[]> {
    return handleArrayResponse<Profile>(
      ElectronAPIClient.request('GET', '/api/profiles/'),
      'ProfileFunctionalService',
      'getProfiles'
    );
  },

  /**
   * Get a specific profile by ID
   * @param {string} id Profile ID
   * @returns {Promise<Profile>} The requested profile
   */
  async getProfileById(id: string): Promise<Profile> {
    const defaultProfile: Profile = {
      id,
      name: 'Unknown profile',
      osType: '',
      browserType: '',
      browserVersion: '',
      proxyStatus: 'disconnected',
      lastUsed: new Date().toISOString(),
      status: 'idle'
    };

    return handleObjectResponse<Profile>(
      ElectronAPIClient.request('GET', `/api/profiles/${id}`),
      'ProfileFunctionalService',
      'getProfileById',
      defaultProfile
    );
  },

  /**
   * Create a new profile
   * @param {CreateProfileData} profileData The profile data to create
   * @returns {Promise<Profile>} The created profile
   */
  async createProfile(profileData: CreateProfileData): Promise<Profile> {
    return handleMutationResponse<Profile>(
      ElectronAPIClient.request('POST', '/api/profiles', profileData),
      'ProfileFunctionalService',
      'createProfile'
    );
  },

  /**
   * Update an existing profile
   * @param {string} id Profile ID
   * @param {UpdateProfileData} profileData The profile data to update
   * @returns {Promise<Profile>} The updated profile
   */
  async updateProfile(id: string, profileData: UpdateProfileData): Promise<Profile> {
    return handleMutationResponse<Profile>(
      ElectronAPIClient.request('PATCH', `/api/profiles/${id}`, profileData),
      'ProfileFunctionalService',
      'updateProfile'
    );
  },

  /**
   * Delete a profile
   * @param {string} id Profile ID
   * @returns {Promise<{success: boolean}>} Success status
   */
  async deleteProfile(id: string): Promise<{ success: boolean }> {
    return handleMutationResponse<{ success: boolean }>(
      ElectronAPIClient.request('DELETE', `/api/profiles/${id}`),
      'ProfileFunctionalService',
      'deleteProfile',
      false
    ) || { success: false };
  },

  /**
   * Get all groups for the current user
   * @returns {Promise<Group[]>} Array of groups
   */
  async getGroups(): Promise<Group[]> {
    return handleArrayResponse<Group>(
      ElectronAPIClient.request('GET', '/api/profiles/groups'),
      'ProfileFunctionalService',
      'getGroups'
    );
  },

  /**
   * Get a specific group by ID
   * @param {string} id Group ID
   * @returns {Promise<Group>} The requested group
   */
  async getGroupById(id: string): Promise<Group> {
    const defaultGroup: Group = {
      id,
      name: 'Unknown group',
      description: '',
      profileCount: 0
    };

    return handleObjectResponse<Group>(
      ElectronAPIClient.request('GET', `/api/profiles/groups/${id}`),
      'ProfileFunctionalService',
      'getGroupById',
      defaultGroup
    );
  },

  /**
   * Create a new group
   * @param {CreateGroupData} groupData The group data to create
   * @returns {Promise<Group>} The created group
   */
  async createGroup(groupData: CreateGroupData): Promise<Group> {
    return handleMutationResponse<Group>(
      ElectronAPIClient.request('POST', '/api/profiles/groups', groupData),
      'ProfileFunctionalService',
      'createGroup'
    );
  },

  /**
   * Update an existing group
   * @param {string} id Group ID
   * @param {UpdateGroupData} groupData The group data to update
   * @returns {Promise<Group>} The updated group
   */
  async updateGroup(id: string, groupData: UpdateGroupData): Promise<Group> {
    return handleMutationResponse<Group>(
      ElectronAPIClient.request('PATCH', `/api/profiles/groups/${id}`, groupData),
      'ProfileFunctionalService',
      'updateGroup'
    );
  },

  /**
   * Delete a group
   * @param {string} id Group ID
   * @returns {Promise<{success: boolean}>} Success status
   */
  async deleteGroup(id: string): Promise<{ success: boolean }> {
    return handleMutationResponse<{ success: boolean }>(
      ElectronAPIClient.request('DELETE', `/api/profiles/groups/${id}`),
      'ProfileFunctionalService',
      'deleteGroup'
    );
  },

  /**
 * Adds profiles to a group. Creates a new group if specified.
 * @param {AddToGroupPayload} payload The complete payload from the selection dialog.
 * @returns {Promise<{success: boolean}>} Success status
 */
  async addProfilesToGroup(payload: AddToGroupPayload): Promise<{ success: boolean }> {
    const { mode, groupId, newGroupName, itemIds: profileIds } = payload;

    let targetGroupId: string | null = groupId;
    if (mode === 'new') {
      if (!newGroupName) {
        throw new Error("Group name is required when creating a new group.");
      }

      console.log(`Service: Creating new profile group "${newGroupName}"...`);
      const newGroup = await this.createGroup({
        name: newGroupName,
        description: ""
      });

      if (!newGroup || !newGroup.id) {
        throw new Error("Service failed to create a new group.");
      }

      targetGroupId = newGroup.id;
      console.log(`Service: New group created with ID: ${targetGroupId}`);
    }


    if (!targetGroupId) {
      throw new Error("A target group ID is required to add profiles.");
    }
    if (!profileIds || profileIds.length === 0) {
      console.warn("No profiles were selected to add to the group.");
      return { success: true };
    }

    console.log(`Service: Adding profiles [${profileIds.join(', ')}] to group ${targetGroupId}...`);

    return handleMutationResponse<{ success: boolean }>(
      ElectronAPIClient.request('POST', `/api/profiles/groups/${targetGroupId}/profiles`, { profileIds }),
      'ProfileFunctionalService',
      'addProfilesToGroup'
    );
  },

  /**
   * Remove profiles from a group
   * @param {string} groupId Group ID
   * @param {string[]} profileIds Array of profile IDs to remove
   * @returns {Promise<Group>} Updated group
   */
  async removeProfilesFromGroup(groupId: string, profileIds: string[]): Promise<Group> {
    const response = await ElectronAPIClient.request('POST', `/api/profiles/groups/${groupId}/remove-profiles`, { profileIds });
    return response.json();
  },

  /**
   * Get profiles in a group
   * @param {string} groupId Group ID
   * @returns {Promise<Profile[]>} Array of profiles in the group
   */
  async getProfilesInGroup(groupId: string): Promise<Profile[]> {
    const response = await ElectronAPIClient.request('GET', `/api/profiles/groups/${groupId}/profiles`);
    const data = await response.json();

    // Đảm bảo luôn trả về một mảng
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      // Nếu trả về một object có chứa mảng profiles
      if (Array.isArray(data.profiles)) {
        return data.profiles;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
    }

    // Trường hợp không có dữ liệu hợp lệ, trả về mảng rỗng
    console.warn('getProfilesInGroup API did not return an array:', data);
    return [];
  },

  /**
   * Launch a profile
   * @param {string} profileId Profile ID
   * @returns {Promise<{success: boolean, sessionId?: string}>} Launch result
   */
  /**
   * Kịch bản 1: Launch một profile duy nhất.
   * Gọi đến /api/profiles/launch
   * @param {string} profileId - ID của profile cần chạy.
   * @returns {Promise<{success: boolean, sessionId?: string}>}
   */
  async launchProfile(profileId: string): Promise<{ success: boolean, sessionId?: string }> {
    console.log(`🚀 Service: Launching profile ${profileId}`);
    // Controller mong đợi data là một object
    const payload = { profileId };
    console.log(`📦 Payload:`, payload);
    try {
      const requestPromise = ElectronAPIClient.request('POST', '/api/profiles/launch', payload);
      console.log(`📡 Request sent, waiting for response...`);
      const result = await handleMutationResponse(
        requestPromise,
        'ProfileFunctionalService',
        'launchProfile'
      );
      console.log(`✅ Service received result:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Service error launching profile:`, error);
      throw error;
    }
  },

  /**
   * Kịch bản 2: Launch nhiều profile đồng thời.
   * Gọi đến /api/profiles/launch/concurrent
   * @param {object} params - Gồm profileIds và threads.
   * @param {string[]} params.profileIds - Mảng các ID profile.
   * @param {number} params.threads - Số luồng chạy đồng thời.
   * @returns {Promise<{success: boolean}>}
   */
  async launchProfiles({ profileIds, threads }: { profileIds: string[], threads: number }): Promise<{ success: boolean }> {
    console.log(`Service: Launching ${profileIds.length} profiles with ${threads} threads.`);
    const payload = { profileIds, concurrent: threads }; 
    return handleMutationResponse(
      ElectronAPIClient.request('POST', '/api/profiles/launch/concurrent', payload),
      'ProfileFunctionalService',
      'launchProfiles'
    );
  },

  /**
   * Kịch bản 3: Launch một profile duy nhất với một workflow.
   * Gọi đến /api/profiles/launch/{profileId}/workflows/{workflowId}
   * @param {object} params - Gồm profileId và workflowId.
   * @param {string} params.profileId - ID của profile.
   * @param {string} params.workflowId - ID của workflow.
   * @returns {Promise<{success: boolean}>}
   */
  async launchProfileWithWorkflow({ profileId, workflowId }: { profileId: string, workflowId: string }): Promise<{ success: boolean }> {
    console.log(`Service: Launching profile ${profileId} with workflow ${workflowId}.`);
    const endpoint = `/api/profiles/launch/${profileId}/workflows/${workflowId}`;
    return handleMutationResponse(
      ElectronAPIClient.request('POST', endpoint, {}), // Body có thể rỗng
      'ProfileFunctionalService',
      'launchProfileWithWorkflow'
    );
  },

  /**
   * Kịch bản 4: Launch nhiều profile với một workflow đồng thời.
   * Gọi đến /api/profiles/launch/workflows/profiles
   * @param {object} params - Gồm profileIds, workflowId và threads.
   * @param {string[]} params.profileIds - Mảng các ID profile.
   * @param {string} params.workflowId - ID của workflow.
   * @param {number} params.threads - Số luồng chạy đồng thời.
   * @returns {Promise<{success: boolean}>}
   */
  async launchProfilesWithWorkflow({ profileIds, workflowId, threads }: { profileIds: string[], workflowId: string, threads: number }): Promise<{ success: boolean }> {
    console.log(`Service: Launching ${profileIds.length} profiles with workflow ${workflowId} and ${threads} threads.`);
    const payload = { profileIds, workflowId, threads };
    return handleMutationResponse(
      ElectronAPIClient.request('POST', '/api/profiles/launch/workflows/profiles', payload),
      'ProfileFunctionalService',
      'launchProfilesWithWorkflow'
    );
  },

  /**
   * Kịch bản 5: Launch toàn bộ profile trong một group đồng thời.
   * Gọi đến /api/profiles/launch/groups/concurrent
   * @param {object} params - Gồm groupId và threads.
   * @param {string} params.groupId - ID của group.
   * @param {number} params.threads - Số luồng chạy đồng thời.
   * @returns {Promise<{success: boolean}>}
   */
  async launchGroup({ groupId, threads }: { groupId: string, threads: number }): Promise<{ success: boolean }> {
    console.log(`Service: Launching group ${groupId} with ${threads} threads.`);
    const payload = { groupId, threads };
    return handleMutationResponse(
      ElectronAPIClient.request('POST', '/api/profiles/launch/groups/concurrent', payload),
      'ProfileFunctionalService',
      'launchGroup'
    );
  },

  /**
   * Kịch bản 6: Launch toàn bộ profile trong một group với một workflow đồng thời.
   * Gọi đến /api/profiles/launch/workflows/groups
   * @param {object} params - Gồm groupId, workflowId và threads.
   * @param {string} params.groupId - ID của group.
   * @param {string} params.workflowId - ID của workflow.
   * @param {number} params.threads - Số luồng chạy đồng thời.
   * @returns {Promise<{success: boolean}>}
   */
  async launchGroupWithWorkflow({ groupId, workflowId, threads }: { groupId: string, workflowId: string, threads: number }): Promise<{ success: boolean }> {
    console.log(`Service: Launching group ${groupId} with workflow ${workflowId} and ${threads} threads.`);
    const payload = { groupId, workflowId, threads };
    return handleMutationResponse(
      ElectronAPIClient.request('POST', '/api/profiles/launch/workflows/groups', payload),
      'ProfileFunctionalService',
      'launchGroupWithWorkflow'
    );
  },

  /**
   * Export a profile
   * @param {string} profileId Profile ID
   * @returns {Promise<Blob>} Profile data as blob
   */
  async exportProfile(profileId: string): Promise<Blob> {
    const response = await ElectronAPIClient.request('GET', `/api/profiles/${profileId}/export`);
    return response.blob();
  },

  /**
   * Import profiles
   * @param {any} data Import data
   * @returns {Promise<{success: boolean, count: number}>} Import result
   */
  async importProfiles(data: any): Promise<{ success: boolean, count: number }> {
    const response = await ElectronAPIClient.request('POST', '/api/profiles/import', data);
    const respData = await response.json();

    // Đảm bảo trả về định dạng chuẩn
    if (respData && typeof respData === 'object') {
      // Định dạng chuẩn là { success: boolean, count: number }
      if (typeof respData.success === 'boolean') {
        return {
          success: respData.success,
          count: respData.count || 0
        };
      } else if (respData.data && typeof respData.data.success === 'boolean') {
        return {
          success: respData.data.success,
          count: respData.data.count || 0
        };
      }
    }

    // Trường hợp không có dữ liệu hợp lệ, giả định là thất bại
    console.warn('importProfiles API did not return expected format:', respData);
    return { success: false, count: 0 };
  },

  /**
   * === CÁC API CALL CHO FINGERPRINT DATA ===
   */

  /**
   * Get fingerprint data from backend
   * @returns {Promise<any>} Fingerprint data object
   */
  async getFingerprintData(): Promise<any> {
    return handleObjectResponse<any>(
      ElectronAPIClient.request('GET', '/api/profiles/fingerprint-data'),
      'ProfileFunctionalService',
      'getFingerprintData',
      {
        vendors: [],
        renderers: {},
        hardwareConcurrency: [],
        deviceMemory: [],
        resolutions: [],
        browserLanguages: [],
        userAgents: []
      }
    );
  },

  /**
   * Lấy thông tin cơ bản của profile (cho dropdown, list view)
   * @param {Profile} profile The profile to extract basic info from
   * @returns Basic profile info
   */
  getBasicProfileInfo(profile: Profile): { id: string; name: string; status: string; browserType?: string } {
    return {
      id: profile.id,
      name: profile.name,
      status: profile.status,
      browserType: profile.browserType
    };
  },

  /**
   * Lấy thông tin fingerprint từ profile
   * @param {Profile} profile The profile to extract fingerprint from
   * @returns The fingerprint info or undefined
   */
  getFingerprintInfo(profile: Profile): FingerprintInfo | undefined {
    return profile.fingerprint;
  },

  /**
   * Lấy thông tin proxy từ profile
   * @param {Profile} profile The profile to extract proxy info from
   * @returns The proxy info
   */
  getProxyInfo(profile: Profile): ProfileProxyInfo {
    return {
      proxyStatus: profile.proxyStatus,
      proxyAddress: profile.proxyAddress
    };
  }
};
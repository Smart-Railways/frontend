import api from '@/lib/axios';
import {
  FeasibleWindowsRequest,
  FeasibleWindowsResponse,
  BlockWindow,
  CreateBlockWindowPayload,
  BlockRecommendationResponse,
  BlockWindowPutPayload,
} from '@/types/blocks';

export const blockService = {
  /**
   * Phase 1: Search feasible maintenance windows for a task on a target date
   */
  async getFeasibleWindows(payload: FeasibleWindowsRequest): Promise<FeasibleWindowsResponse> {
    const response = await api.post<FeasibleWindowsResponse>(
      'block-windows/feasible-windows',
      payload
    );
    return response.data;
  },

  /**
   * Phase 2: Create a new BlockWindow in the database
   */
  async createBlockWindow(payload: CreateBlockWindowPayload): Promise<BlockWindow> {
    const response = await api.post<BlockWindow>(
      'block-windows',
      payload
    );
    return response.data;
  },

  /**
   * Phase 3A: Query continuous AI recommendation for an existing block window
   */
  async getRecommendation(blockWindowId: number | string, taskId?: string): Promise<BlockRecommendationResponse> {
    const params = taskId ? { task_id: taskId } : {};
    const response = await api.get<BlockRecommendationResponse>(
      `block-windows/${blockWindowId}/recommendation`,
      { params }
    );
    return response.data;
  },

  /**
   * Phase 3B: Apply recommended slot via standard PUT request
   */
  async updateBlockWindow(blockWindowId: number | string, payload: BlockWindowPutPayload): Promise<BlockWindow> {
    const response = await api.put<BlockWindow>(
      `block-windows/${blockWindowId}`,
      payload
    );
    return response.data;
  },

  /**
   * Phase 3C (Alternative): 1-Click Auto-Apply endpoint
   */
  async applyRecommendation(blockWindowId: number | string, taskId?: string): Promise<BlockWindow> {
    const response = await api.post<{ block_window: BlockWindow }>(
      `block-windows/${blockWindowId}/apply-recommendation`,
      {},
      { params: taskId ? { task_id: taskId } : {} }
    );
    return response.data.block_window;
  },
};

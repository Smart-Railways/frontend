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
   * Uses the unified recommendation endpoint
   */
  async getFeasibleWindows(payload: FeasibleWindowsRequest): Promise<FeasibleWindowsResponse> {
    const response = await api.post<FeasibleWindowsResponse>(
      'block-windows/recommendation',
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
   * Uses unified recommendation endpoint
   */
  async getRecommendation(blockWindowId: number | string, taskId?: string): Promise<BlockRecommendationResponse> {
    const params: Record<string, any> = { block_window_id: blockWindowId };
    if (taskId) params.task_id = taskId;
    const response = await api.get<BlockRecommendationResponse>(
      'block-windows/recommendation',
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
   * Phase 3C: 1-Click Auto-Apply endpoint (unified recommendation with apply: true)
   */
  async applyRecommendation(blockWindowId: number | string, taskId?: string): Promise<BlockWindow> {
    const response = await api.post<{ block_window: BlockWindow }>(
      'block-windows/recommendation',
      {
        block_window_id: blockWindowId,
        task_id: taskId,
        apply: true,
      }
    );
    return response.data.block_window;
  },

  /**
   * Retrieve block window directly by maintenance task_id (e.g. "TMS-190")
   */
  async getBlockWindowByTaskId(taskId: string): Promise<BlockWindow> {
    const response = await api.get<BlockWindow>(`block-windows/by-task/${taskId}/`);
    return response.data;
  },

  /**
   * Update or create block window directly by maintenance task_id
   */
  async updateBlockWindowByTaskId(
    taskId: string,
    payload: Partial<BlockWindowPutPayload>
  ): Promise<BlockWindow> {
    const response = await api.put<BlockWindow>(`block-windows/by-task/${taskId}/`, payload);
    return response.data;
  },

  /**
   * Delete block window directly by maintenance task_id
   */
  async deleteBlockWindowByTaskId(taskId: string): Promise<{ deleted: boolean }> {
    await api.delete(`block-windows/by-task/${taskId}/`);
    return { deleted: true };
  },
};

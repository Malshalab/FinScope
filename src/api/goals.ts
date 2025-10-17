import apiClient from "./client";

export type GoalStatus = "active" | "paused" | "achieved" | "cancelled";

export interface GoalResponse {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  target_amount: number | string;
  target_date: string;
  priority: number;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AddGoalRequest {
  name: string;
  description?: string | null;
  target_amount: number;
  target_date: string;
  priority: number;
  status: GoalStatus;
}

export async function getGoals(): Promise<GoalResponse[]> {
  const res = await apiClient.get<GoalResponse[]>("/goals/");
  return res.data;
}

export async function addGoal(data: AddGoalRequest): Promise<GoalResponse> {
  const res = await apiClient.post<GoalResponse>("/goals/addGoal", data);
  return res.data;
}

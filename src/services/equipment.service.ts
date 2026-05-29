import type { AxiosResponse } from "axios";
import type { Equipment, EquipmentApprovalStatus } from "@/types/equipment";
import type { ApiResponse } from "@/types/api";
import { api, unwrap } from "@/services/api";

export async function getAllEquipment(filters?: {
  category?: string;
  search?: string;
  ownerId?: string;
  status?: EquipmentApprovalStatus;
}): Promise<Equipment[]> {
  const res = await api.get("/equipment", { params: filters });
  return unwrap(res);
}

export async function approveEquipment(id: string): Promise<Equipment> {
  const res: AxiosResponse<ApiResponse<Equipment>> = await api.post(`/equipment/${id}/approve`);
  return unwrap(res);
}

export async function rejectEquipment(id: string, note: string): Promise<Equipment> {
  const res: AxiosResponse<ApiResponse<Equipment>> = await api.post(`/equipment/${id}/reject`, {
    note,
  });
  return unwrap(res);
}

export async function deleteEquipment(id: string): Promise<void> {
  const res: AxiosResponse<ApiResponse<null>> = await api.delete(`/equipment/${id}`);
  unwrap(res);
}

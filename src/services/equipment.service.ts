import type { AxiosResponse } from "axios";
import type { Equipment } from "@/types/equipment";
import type { ApiResponse } from "@/types/api";
import { api, unwrap } from "@/services/api";

export async function getAllEquipment(filters?: {
  category?: string;
  search?: string;
  ownerId?: string;
}): Promise<Equipment[]> {
  const res = await api.get("/equipment", { params: filters });
  return unwrap(res);
}

export async function deleteEquipment(id: string): Promise<void> {
  const res: AxiosResponse<ApiResponse<null>> = await api.delete(`/equipment/${id}`);
  unwrap(res);
}

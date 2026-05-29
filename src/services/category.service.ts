import { api, unwrap } from "@/services/api";
import type { CategoryInput, EquipmentCategory } from "@/types/category";

export async function listCategories(includeInactive = true): Promise<EquipmentCategory[]> {
  const res = await api.get("/categories", {
    params: includeInactive ? { includeInactive: "true" } : {},
  });
  return unwrap(res);
}

export async function createCategory(data: CategoryInput): Promise<EquipmentCategory> {
  const res = await api.post("/categories", data);
  return unwrap(res);
}

export async function updateCategory(
  id: string,
  data: Partial<CategoryInput>
): Promise<EquipmentCategory> {
  const res = await api.put(`/categories/${id}`, data);
  return unwrap(res);
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

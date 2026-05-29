import { useCallback, useEffect, useState } from "react";
import * as categoryService from "@/services/category.service";
import type { CategoryInput, EquipmentCategory } from "@/types/category";

export function useCategories() {
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.listCategories(true);
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load categories");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  async function create(data: CategoryInput) {
    const row = await categoryService.createCategory(data);
    await refetch();
    return row;
  }

  async function update(id: string, data: Partial<CategoryInput>) {
    const row = await categoryService.updateCategory(id, data);
    await refetch();
    return row;
  }

  async function remove(id: string) {
    await categoryService.deleteCategory(id);
    await refetch();
  }

  return { categories, isLoading, error, refetch, create, update, remove };
}

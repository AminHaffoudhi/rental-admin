import { useCallback, useEffect, useState } from "react";
import * as equipmentService from "@/services/equipment.service";
import type { Equipment } from "@/types/equipment";

export function useEquipment(filters?: {
  category?: string;
  search?: string;
  ownerId?: string;
}): {
  equipment: Equipment[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
} {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await equipmentService.getAllEquipment(filters);
      setEquipment(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load equipment"));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.category, filters?.search, filters?.ownerId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const deleteEquipment = useCallback(
    async (id: string) => {
      await equipmentService.deleteEquipment(id);
      await refetch();
    },
    [refetch]
  );

  return { equipment, isLoading, error, refetch, deleteEquipment };
}

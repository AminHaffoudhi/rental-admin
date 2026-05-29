import { useCallback, useEffect, useState } from "react";
import * as equipmentService from "@/services/equipment.service";
import type { Equipment, EquipmentApprovalStatus } from "@/types/equipment";

export function useEquipment(filters?: {
  category?: string;
  search?: string;
  ownerId?: string;
  status?: EquipmentApprovalStatus;
}): {
  equipment: Equipment[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  approveEquipment: (id: string) => Promise<void>;
  rejectEquipment: (id: string, note: string) => Promise<void>;
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
  }, [filters?.category, filters?.search, filters?.ownerId, filters?.status]);

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

  const approveEquipment = useCallback(
    async (id: string) => {
      await equipmentService.approveEquipment(id);
      await refetch();
    },
    [refetch]
  );

  const rejectEquipment = useCallback(
    async (id: string, note: string) => {
      await equipmentService.rejectEquipment(id, note);
      await refetch();
    },
    [refetch]
  );

  return { equipment, isLoading, error, refetch, deleteEquipment, approveEquipment, rejectEquipment };
}

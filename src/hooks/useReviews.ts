import { useCallback, useEffect, useState } from "react";
import * as reviewService from "@/services/review.service";
import type { Review, ReviewStatus, ReviewType } from "@/types/review";

export function useReviews(filters?: {
  status?: ReviewStatus;
  type?: ReviewType;
  search?: string;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reviewService.getAllReviews(filters);
      setReviews(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load reviews"));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status, filters?.type, filters?.search]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const approveReview = useCallback(
    async (id: string) => {
      await reviewService.approveReview(id);
      await refetch();
    },
    [refetch]
  );

  const rejectReview = useCallback(
    async (id: string, note: string) => {
      await reviewService.rejectReview(id, note);
      await refetch();
    },
    [refetch]
  );

  const deleteReview = useCallback(
    async (id: string) => {
      await reviewService.deleteReview(id);
      await refetch();
    },
    [refetch]
  );

  return { reviews, isLoading, error, refetch, approveReview, rejectReview, deleteReview };
}

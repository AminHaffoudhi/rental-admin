import { useCallback, useEffect, useState } from "react";
import * as bookingService from "@/services/booking.service";
import type { Booking } from "@/types/booking";

export function useBookings(filters?: { status?: string }): {
  bookings: Booking[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  confirmPayment: (bookingId: string) => Promise<void>;
  forceComplete: (bookingId: string) => Promise<void>;
  forceCancel: (bookingId: string) => Promise<void>;
} {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingService.getAllBookings(filters);
      setBookings(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load bookings"));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const confirmPayment = useCallback(
    async (bookingId: string) => {
      await bookingService.confirmPayment(bookingId);
      await refetch();
    },
    [refetch]
  );

  const forceComplete = useCallback(
    async (bookingId: string) => {
      await bookingService.forceComplete(bookingId);
      await refetch();
    },
    [refetch]
  );

  const forceCancel = useCallback(
    async (bookingId: string) => {
      await bookingService.forceCancel(bookingId);
      await refetch();
    },
    [refetch]
  );

  return {
    bookings,
    isLoading,
    error,
    refetch,
    confirmPayment,
    forceComplete,
    forceCancel,
  };
}

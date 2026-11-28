"use client";

import CompletedScreen from "@/components/CompletedScreen";
import { Ibooking } from "@/model/booking.model";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const BookingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Ibooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const getBooking = async () => {
      try {
        // Dynamic route ID se partner ki booking fetch karke completed summary ko populate karo.
        const { data } = await axios.get(`/api/partner/bookings/${id}`);
        if (!data.success || !data.booking) {
          throw new Error(data.message ?? "Booking not found");
        }

        if (data.booking.bookingStatus !== "completed") {
          throw new Error("This booking is not completed.");
        }

        if (!cancelled) {
          setBooking(data.booking);
        }
      } catch (error) {
        if (!cancelled) {
          const message = axios.isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message ?? "Unable to load booking details."
            : error instanceof Error
              ? error.message
              : "Unable to load booking details.";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getBooking();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
        <p className="text-white/60 text-sm">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="h-screen w-full bg-zinc-100 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-zinc-600">
          {error || "Booking not found."}
        </p>
        <a
          href="/partner/bookings"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Back to bookings
        </a>
      </div>
    );
  }

  return <CompletedScreen role="driver" booking={booking} />;
};

export default BookingDetailsPage;

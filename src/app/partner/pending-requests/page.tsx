"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  Navigation,
  Clock3,
  IndianRupee,
  Check,
  X,
} from "lucide-react";
import { Ibooking } from "@/model/booking.model";
import { useRouter } from "next/navigation";
import { getSocketIo } from "@/lib/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const Page = () => {
  const [bookings, setBookings] = useState<Ibooking[]>([]);
  const [loading, setLoading] = useState(true);
  const router=useRouter()
  const userData = useSelector((state: RootState) => state.user.userData);

  useEffect(() => {
    const getPendingBookings = async () => {
      try {
        const res = await axios.get("/api/partner/bookings/pending-requests");

        setBookings(res.data);
      } catch (error) {
        console.log("Pending bookings error:", error);
      } finally {
        setLoading(false);
      }
    };

    getPendingBookings();
  }, []);

  //real-time mein driver ko booking show ho uske liye socketio ko listen krna hoga yaha pe
  
  useEffect(() => {
    if (!userData?._id) return;

    const socket = getSocketIo();
    const handleNewBooking = (data: Ibooking) => {
      setBookings((prev) => {
        if (prev.some((booking) => booking._id === data._id)) {
          return prev;
        }

        return [...prev, data];
      });
    };

    const registerIdentity = () => {
      socket.emit("identity", userData._id);
    };

    socket.on("connect", registerIdentity);
    if (socket.connected) {
      registerIdentity();
    }
    socket.on("new-booking", handleNewBooking);

    return () => {
      socket.off("connect", registerIdentity);
      socket.off("new-booking", handleNewBooking);
    };
  }, [userData?._id]);

  const handleAccept = async (id: string) => {
    try {
      const res = await axios.post(`/api/partner/bookings/${id}/accept`);
      console.log(res);
      router.push('/partner/bookings')
    } catch (error) {
      console.log(`accept booking error ${error}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await axios.post(`/api/partner/bookings/${id}/reject`);
      window.location.reload()
      console.log(res);
    } catch (error) {
      console.log(`reject booking error ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="bg-white rounded-2xl px-6 py-7 md:px-8 md:py-8 border border-zinc-200 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900">
            Ride Requests
          </h1>

          <p className="text-sm md:text-base text-zinc-500 mt-2">
            Manage incoming rides and respond in real time.
          </p>
        </div>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="mt-6 bg-white rounded-2xl p-10 text-center border border-zinc-200">
            <p className="text-zinc-500">Loading ride requests...</p>
          </div>
        )}

        {/* ================= EMPTY ================= */}
        {!loading && bookings.length === 0 && (
          <div className="mt-6 bg-white rounded-2xl p-10 text-center border border-zinc-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-zinc-100 flex items-center justify-center">
              <Navigation size={22} className="text-zinc-500" />
            </div>

            <h2 className="text-lg font-bold text-zinc-800 mt-4">
              No pending ride requests
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              New ride requests will appear here.
            </p>
          </div>
        )}

        {/* ================= BOOKINGS ================= */}
        {!loading && bookings.length > 0 && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden"
              >
                {/* ================= CARD HEADER ================= */}
                <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                      Incoming Ride
                    </p>

                    <p className="text-sm font-semibold text-zinc-800 mt-1">
                      Ride Request
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 text-xs font-semibold">
                    Pending
                  </span>
                </div>

                {/* ================= LOCATIONS ================= */}
                <div className="px-5 py-5">
                  {/* PICKUP */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                        <MapPin size={18} className="text-zinc-700" />
                      </div>

                      <div className="w-px h-8 bg-zinc-200" />
                    </div>

                    <div className="min-w-0 pt-1">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                        Pickup Location
                      </p>

                      <p className="text-sm md:text-base font-semibold text-zinc-800 mt-1 leading-5">
                        {booking.pickUpAddress}
                      </p>
                    </div>
                  </div>

                  {/* DROP */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                      <Navigation size={17} className="text-zinc-700" />
                    </div>

                    <div className="min-w-0 pt-1">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                        Drop Location
                      </p>

                      <p className="text-sm md:text-base font-semibold text-zinc-800 mt-1 leading-5">
                        {booking.dropAddress}
                      </p>
                    </div>
                  </div>

                  {/* ================= TIME ================= */}
                  <div className="flex items-center gap-2 mt-5 text-zinc-500">
                    <Clock3 size={15} />

                    <span className="text-xs md:text-sm">
                      {new Date(booking.createdAt!).toLocaleString()}
                    </span>
                  </div>

                  {/* ================= FARE ================= */}
                  <div className="mt-5 pt-4 border-t border-zinc-100">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                      Estimated Fare
                    </p>

                    <div className="flex items-center gap-1 mt-1">
                      <IndianRupee size={19} strokeWidth={2.5} />

                      <span className="text-2xl font-black text-zinc-900">
                        {booking.fare}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="px-5 pb-5">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleReject(booking._id)}
                      className="
                        h-11
                        rounded-xl
                        border border-zinc-200
                        bg-white
                        text-zinc-700
                        text-sm font-semibold
                        flex items-center justify-center gap-2
                        hover:bg-zinc-100
                        transition
                      "
                    >
                      <X size={16} />
                      Reject
                    </button>

                    <button
                      onClick={() => handleAccept(booking._id)}
                      className="
                        h-11
                        rounded-xl
                        bg-black
                        text-white
                        text-sm font-semibold
                        flex items-center justify-center gap-2
                        hover:bg-zinc-800
                        transition
                      "
                    >
                      <Check size={16} />
                      Accept Ride
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

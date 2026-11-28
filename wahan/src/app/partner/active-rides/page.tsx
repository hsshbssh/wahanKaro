"use client";

import { BookingStatus, Ibooking, paymentStatus } from "@/model/booking.model";
import axios from "axios";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronUp, KeyRound, Zap } from "lucide-react";
import PanelContents from "@/components/PanelContents";
import { getSocketIo } from "@/lib/socket";
import { data } from "framer-motion/client";
import CompletedScreen from "@/components/CompletedScreen";

// Leaflet uses browser APIs, so load the map only on the client.
const LiveRideMap = dynamic(() => import("@/components/LiveRideMap"), {
  ssr: false,
});

const Page = () => {
  const MAP_STATUS: Record<
    BookingStatus,
    "arriving" | "ongoing" | "completed"
  > = {
    idle: "arriving",
    requested: "arriving",
    "awaiting-payment": "arriving",
    confirmed: "arriving",
    started: "ongoing",
    completed: "completed",
    cancelled: "completed",
    rejected: "completed",
    expired: "completed",
  };

  const STATUS_LABEL: Record<
    BookingStatus,
    { label: string; sublabel: string; dot: string }
  > = {
    idle: {
      label: "Awaiting Confirmation",
      sublabel: "Booking is being processed",
      dot: "bg-amber-400",
    },

    requested: {
      label: "Awaiting Confirmation",
      sublabel: "Booking is being processed",
      dot: "bg-amber-400",
    },

    "awaiting-payment": {
      label: "Payment Pending",
      sublabel: "Customer payment is pending",
      dot: "bg-purple-400",
    },

    confirmed: {
      label: "Heading to Pickup",
      sublabel: "Drive to the pickup location",
      dot: "bg-amber-400",
    },

    started: {
      label: "Ride in Progress",
      sublabel: "Heading to drop location",
      dot: "bg-emerald-400",
    },

    completed: {
      label: "Ride Completed",
      sublabel: "Trip has ended successfully",
      dot: "bg-zinc-400",
    },

    cancelled: {
      label: "Ride Cancelled",
      sublabel: "This ride was cancelled",
      dot: "bg-red-400",
    },

    rejected: {
      label: "Ride Rejected",
      sublabel: "Ride was rejected",
      dot: "bg-red-400",
    },

    expired: {
      label: "Request Expired",
      sublabel: "Booking timed out",
      dot: "bg-orange-400",
    },
  };

  const PAYMENT_BADGE: Record<paymentStatus, { label: string; cls: string }> = {
    pending: {
      label: "Pending",
      cls: "bg-amber-100 text-amber-700",
    },
    paid: {
      label: "Paid",
      cls: "bg-emerald-100 text-emerald-700",
    },
    cash: {
      label: "Cash",
      cls: "bg-zinc-100 text-zinc-700",
    },
    failed: {
      label: "Failed",
      cls: "bg-red-100 text-red-700",
    },
  };

  const [activeBookings, setActiveBookings] = useState<Ibooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [pickUp, setPickUp] = useState<[number, number] | null>(null);
  const [drop, setDrop] = useState<[number, number] | null>(null);

  const [status, setStatus] = useState<BookingStatus>("confirmed");
  const [chatOpen, setChatOpen] = useState(false);
  //ye state mobile ke case ke liye banai hai
  const [expanded, setExpanded] = useState(false);

  //ab mujhe ye neeche ki chaaro cheeze chaiye toh ye active ride page pe toh calculate nahi hoskti toh isliye hum isse liveRideMap page pe bhejenge ek onStats function ke through

  const [distanceToPickUp, setDistanceToPickUp] = useState<number | null>(0);
  const [distanceToDrop, setDistanceToDrop] = useState<number | null>(0);
  const [etaToPickUp, setEtaToPickUp] = useState<number | null>(0);
  const [etaToDrop, setEtaToDrop] = useState<number | null>(0);

  //pickUp otp

  const [pickUpOtpMode, setPickUpOtpMode] = useState(false);
  const [pickUpOtp, setPickUpOtp] = useState("");
  const [loadingPickUpOtp, setLoadingPickUpOtp] = useState(false);
  const [pickUpOtpVerified, setPickUpOtpVerified] = useState(false);
  const [pickUpOtpError, setPickUpOtpError] = useState("");

  //drop Otp

  const [dropOtpMode, setDropOtpMode] = useState(false);
  const [dropOtp, setDropOtp] = useState("");
  const [loadingDropOtp, setLoadingDropOtp] = useState(false);
  const [dropOtpVerified, setDropOtpVerified] = useState(false);
  const [dropOtpError, setDropOtpError] = useState("");

  const onChatToggle = () => {
    setChatOpen((prev) => !prev);
  };

  useEffect(() => {
    const getActiveRides = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get("/api/partner/my-active");
        if (data.success) {
          const bookings: Ibooking[] = data.activeBookings ?? [];
          const activeBooking = bookings[0];

          setActiveBookings(bookings);
          setStatus(activeBooking.bookingStatus);

          if (activeBooking?.pickUpLocation?.coordinates?.length === 2) {
            setPickUp([
              activeBooking.pickUpLocation.coordinates[1],
              activeBooking.pickUpLocation.coordinates[0],
            ]); // latitude pehle aur longitude baad mein
          }

          if (activeBooking?.dropLocation?.coordinates?.length === 2) {
            setDrop([
              activeBooking.dropLocation.coordinates[1],
              activeBooking.dropLocation.coordinates[0],
            ]);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getActiveRides();
  }, []);

  const cfg = STATUS_LABEL[activeBookings[0]?.bookingStatus ?? "confirmed"];
  const paymentStatus =
    PAYMENT_BADGE[activeBookings[0]?.paymentStatus ?? "pending"];
  const isActive = ["confirmed", "started"].includes(status);
  const canChat = activeBookings[0]?.bookingStatus === "confirmed";

  //agr hum arriving hai toh hume pickup wali duration aur distance dikhani hai aur agr arriving nahi hai toh drop wali distance aurr duration dikhani hai toh ye maintain krne ke liye ek flag bana neeche

  const displayEta = status === "confirmed" ? etaToPickUp : etaToDrop;
  const displayDist =
    status === "confirmed" ? distanceToPickUp : distanceToDrop;

  const bookingId = activeBookings[0]?._id;

  //finding drivers position
  useEffect(() => {
    if (!bookingId || !navigator.geolocation) return;

    const socket = getSocketIo();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDriverPos([lat, lng]); //pehle latitude hoga fir longitude hoga

        socket.emit("driver-position-update", {
          bookingId,
          longitude: lng,
          latitude: lat,
          status: status,
        });
      },
      (error) => {
        console.log(`Gps Error in active-rides ${error}`);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    }; // jab useEffect return ho toh watchId clear hojaaye (important)
  }, [bookingId, status]);

  useEffect(() => {
    if (!bookingId) {
      console.log("Partner: Booking ID not available");
      return;
    }

    const socket = getSocketIo();
    socket.emit("join-room", { bookingId });
    socket.on("driver-location", ({ latitude, longitude }) => {
      setDriverPos([latitude, longitude]);
    });

    return () => {
      socket.off("join-room");
      socket.off("driver-location");
    };
  }, [bookingId]);

  //fetching otp API's

  const handleSendOtp = async () => {
    try {
      const { data } = await axios.post("/api/otp/pickup/create", {
        bookingId: bookingId,
      });
      console.log(data);
      setPickUpOtpMode(true);
    } catch (error: any) {
      console.log(error);
      setPickUpOtpError(
        error.response?.data?.message ?? "Pickup Otp sent failed",
      );
    }
  };

  const handleDropOtp = async () => {
    try {
      const { data } = await axios.post("/api/otp/drop/create", {
        bookingId: bookingId,
      });
      console.log(data);
      setDropOtpMode(true);
    } catch (error: any) {
      console.log(data);
      setDropOtpError(error.response?.data?.message ?? "Drop otp sent failed");
    }
  };

  const handleVerifyPickUpOtp = async () => {
    setLoadingPickUpOtp(true);
    try {
      const { data } = await axios.post("/api/otp/pickup/verify-otp", {
        bookingId: activeBookings[0]._id,
        driverEnteredPickUpOtp: pickUpOtp,
      });
      console.log(data);
      setPickUpOtpVerified(true);
      setPickUpOtpError("");
      setStatus("started");
      setPickUpOtpMode(false);

      setLoadingPickUpOtp(false);
    } catch (error: any) {
      console.log(error);
      setPickUpOtpError(error.response?.data?.message ?? "Verification failed");
      setLoadingPickUpOtp(false);
    }
  };

  const handleVerifyDropOtp = async () => {
    setLoadingDropOtp(true);
    try {
      const { data } = await axios.post("/api/otp/drop/verify-otp", {
        bookingId: bookingId,
        driverEnteredDropOtp: dropOtp,
      });
      console.log(data);
      setDropOtpVerified(true);
      setDropOtpError("");
      setStatus("completed");
      setDropOtpMode(false);

      setLoadingDropOtp(false);
    } catch (error: any) {
      console.log(error);
      setDropOtpError(error.response?.data?.message ?? "Verification failed");
      setLoadingDropOtp(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <p className="text-white/40 text-sm tracking-widest uppercase font-medium">
            Loading Ride...
          </p>
        </div>
      </div>
    );
  }

  if (!activeBookings.length || !pickUp || !drop) {
    return (
      <div className="h-screen w-full bg-zinc-100 flex items-center justify-center">
        <p className="text-sm text-zinc-500">No active ride found.</p>
      </div>
    );
  }

  if (status === "completed" && activeBookings[0]) {
    return <CompletedScreen role="driver" booking={activeBookings[0]} />;
  }

  return (
    <div className="h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden">
      <div className="relative flex-1 h-full z-0">
        <LiveRideMap
          driverPos={driverPos}
          pickUp={pickUp}
          drop={drop}
          mapStatus={MAP_STATUS[activeBookings[0].bookingStatus]}
          onStats={({
            distanceToPickUp,
            etaToPickUp,
            distanceToDrop,
            etaToDrop,
          }) => {
            (setDistanceToPickUp(distanceToPickUp),
              setEtaToPickUp(etaToPickUp),
              setDistanceToDrop(distanceToDrop),
              setEtaToDrop(etaToDrop));
          }}
        />

        <div className="absolute bottom-5 left-5 z-[500] flex gap-3"></div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-zinc-200">
            <span className={`w-2 h-2 rounded-full animate-pulse ${cfg.dot}`} />
            <span className="text-xs font-semibold tracking-wide text-zinc-900">
              {cfg.label}
            </span>
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="hidden lg:flex w-[420px] xl:w-[460px] bg-white border border-zinc-100 flex-col overflow-hidden"
      >
        <div className="bg-zinc-950 px-6 py-5 flex-shrink-0">
          <p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">
            Driver Panel
          </p>

          <div className="flex items-center justify-between">
            <h1 className="text-white text-xl font-bold">Active Ride</h1>
            {isActive && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <Zap size={12} className="text-amber-400" />
                <span className="text-white text-xs font-semibold">
                  {displayEta !== null ? `${Math.round(displayEta)} min` : "--"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <PanelContents
              props={{
                isActive,
                displayDist,
                displayEta,
                status,
                cfg,
                activeBookings,
                paymentStatus,
                canChat,
                chatOpen,
                onChatToggle,
                currentRole: "driver",
              }}
            />
          </div>
          <div className="flex-shrink-0 border-t border-zinc-100 bg-white px-5 py-4">
            <AnimatePresence mode="wait">
              {status === "confirmed" &&
                !pickUpOtpMode &&
                !pickUpOtpVerified && (
                  <motion.button
                    key="arrived"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    onClick={() => {
                      handleSendOtp();
                      setPickUpOtpMode(true);
                    }}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                  >
                    Arrived at Pickup <ArrowRight size={14} />
                  </motion.button>
                )}
              {status === "confirmed" &&
                pickUpOtpMode &&
                !pickUpOtpVerified && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden"
                  >
                    <div className="bg-zinc-950 px-4 py-3 flex items-center gap-2">
                      <KeyRound size={14} className="bg-amber-500" />
                      <p className="text-white text-xs font-bold tracking-wide uppercase">
                        Enter Customer Otp
                      </p>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-zinc-400">
                        Ask the customer for 6-digit otp to start the ride.
                      </p>
                      <div className="flex justify-between">
                        <input
                          type="text"
                          onChange={(e) => {
                            setPickUpOtp(e.target.value.replace(/\D/g, ""));
                            setPickUpOtpError("");
                          }}
                          placeholder=". . . ."
                          className="w-48 border-2 border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black outline-none transition-colors"
                        />
                      </div>
                      {pickUpOtpError && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-xs font-medium text-center"
                        >
                          {pickUpOtpError}
                        </motion.p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPickUpOtpMode(false);
                            setPickUpOtp("");
                            setPickUpOtpError("");
                          }}
                          className="flex-1 border border-zinc-200 bg-white text-zinc-700 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleVerifyPickUpOtp}
                          disabled={loadingPickUpOtp || pickUpOtp.length < 4}
                          className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-all"
                        >
                          {loadingPickUpOtp ? (
                            <span>Verifying...</span>
                          ) : (
                            <span>Verify Otp</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

              {status === "started" && !dropOtpMode && !dropOtpVerified && (
                <motion.button
                  key="drop"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onClick={() => {
                    handleDropOtp();
                    setDropOtpMode(true);
                  }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                >
                  Mark ride as completed
                  <ArrowRight size={14} />
                </motion.button>
              )}
              {status === "started" && dropOtpMode && !dropOtpVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden"
                >
                  <div className="bg-zinc-950 px-4 py-3 flex items-center gap-2">
                    <KeyRound size={14} className="bg-amber-500" />
                    <p className="text-white text-xs font-bold tracking-wide uppercase">
                      Enter Customer Otp
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-zinc-400">
                      Ask the customer for 6-digit otp to end the ride.
                    </p>
                    <div className="flex justify-between">
                      <input
                        type="text"
                        onChange={(e) => {
                          setDropOtp(e.target.value.replace(/\D/g, ""));
                          setDropOtpError("");
                        }}
                        placeholder=". . . ."
                        className="w-48 border-2 border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black outline-none transition-colors"
                      />
                    </div>
                    {dropOtpError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-xs font-medium text-center"
                      >
                        {dropOtpError}
                      </motion.p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setDropOtpMode(false);
                          setDropOtp("");
                          setDropOtpError("");
                        }}
                        className="flex-1 border border-zinc-200 bg-white text-zinc-700 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleVerifyDropOtp}
                        disabled={loadingDropOtp || dropOtp.length < 4}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-all"
                      >
                        {loadingDropOtp ? (
                          <span>Verifying...</span>
                        ) : (
                          <span>Verify Otp</span>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
        <motion.div
          className="bg-white rounded-t-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
          animate={{ height: expanded ? "82vh" : 142 }}
          transition={{ type: "spring", stiffness: 320, damping: 38 }}
        >
          <div
            className="flex-shrink-0 cursor-pointer select-none"
            onClick={() => setExpanded((prev) => !prev)}
          >
            <div className="pt-3 pb-1">
              <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto" />
            </div>

            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`}
                />

                <div>
                  <p className="text-sm font-bold text-zinc-900 leading-tight">
                    {cfg.label}
                  </p>

                  <p className="text-xs text-zinc-400 leading-tight">
                    {cfg.sublabel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isActive && (
                  <div className="text-right">
                    <p className="text-2xl text-zinc-900 font-black leading-none">
                      {displayEta !== null
                        ? `${Math.round(displayEta)} min`
                        : "--"}
                    </p>
                  </div>
                )}
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.28 }}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
                >
                  <ChevronUp size={16} className="text-zinc-600" />
                </motion.div>
              </div>
            </div>
            <div className="h-px bg-zinc-300 mt-5" />
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <PanelContents
              props={{
                isActive,
                displayDist,
                displayEta,
                status,
                cfg,
                activeBookings,
                paymentStatus,
                canChat,
                chatOpen,
                onChatToggle,
                currentRole: "driver",
              }}
            />
          </div>

          <div className="flex-shrink-0 border-t border-zinc-100 bg-white px-5 py-4">
            <AnimatePresence mode="wait">
              {status === "confirmed" &&
                !pickUpOtpMode &&
                !pickUpOtpVerified && (
                  <motion.button
                    key="arrived"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    onClick={() => {
                      handleSendOtp();
                      setPickUpOtpMode(true);
                    }}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                  >
                    Arrived at Pickup <ArrowRight size={14} />
                  </motion.button>
                )}
              {status === "confirmed" &&
                pickUpOtpMode &&
                !pickUpOtpVerified && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden"
                  >
                    <div className="bg-zinc-950 px-4 py-3 flex items-center gap-2">
                      <KeyRound size={14} className="bg-amber-500" />
                      <p className="text-white text-xs font-bold tracking-wide uppercase">
                        Enter Customer Otp
                      </p>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-zinc-400">
                        Ask the customer for 6-digit otp to start the ride.
                      </p>
                      <div className="flex justify-between">
                        <input
                          type="text"
                          onChange={(e) => {
                            setPickUpOtp(e.target.value.replace(/\D/g, ""));
                            setPickUpOtpError("");
                          }}
                          placeholder=". . . ."
                          className="w-48 border-2 border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black outline-none transition-colors"
                        />
                      </div>
                      {pickUpOtpError && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-xs font-medium text-center"
                        >
                          {pickUpOtpError}
                        </motion.p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPickUpOtpMode(false);
                            setPickUpOtp("");
                            setPickUpOtpError("");
                          }}
                          className="flex-1 border border-zinc-200 bg-white text-zinc-700 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleVerifyPickUpOtp}
                          disabled={loadingPickUpOtp || pickUpOtp.length < 4}
                          className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-all"
                        >
                          {loadingPickUpOtp ? (
                            <span>Verifying...</span>
                          ) : (
                            <span>Verify Otp</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

              {status === "started" && !dropOtpMode && !dropOtpVerified && (
                <motion.button
                  key="drop"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onClick={() => {
                    handleDropOtp();
                    setDropOtpMode(true);
                  }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                >
                  Mark ride as completed
                  <ArrowRight size={14} />
                </motion.button>
              )}
              {status === "started" && dropOtpMode && !dropOtpVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden"
                >
                  <div className="bg-zinc-950 px-4 py-3 flex items-center gap-2">
                    <KeyRound size={14} className="bg-amber-500" />
                    <p className="text-white text-xs font-bold tracking-wide uppercase">
                      Enter Customer Otp
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-zinc-400">
                      Ask the customer for 6-digit otp to end the ride.
                    </p>
                    <div className="flex justify-between">
                      <input
                        type="text"
                        onChange={(e) => {
                          setDropOtp(e.target.value.replace(/\D/g, ""));
                          setDropOtpError("");
                        }}
                        placeholder=". . . ."
                        className="w-48 border-2 border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black outline-none transition-colors"
                      />
                    </div>
                    {dropOtpError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-xs font-medium text-center"
                      >
                        {dropOtpError}
                      </motion.p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setDropOtpMode(false);
                          setDropOtp("");
                          setDropOtpError("");
                        }}
                        className="flex-1 border border-zinc-200 bg-white text-zinc-700 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleVerifyDropOtp}
                        disabled={loadingDropOtp || dropOtp.length < 4}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-all"
                      >
                        {loadingDropOtp ? (
                          <span>Verifying...</span>
                        ) : (
                          <span>Verify Otp</span>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Page;

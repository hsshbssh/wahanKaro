
"use client";

import { getSocketIo } from "@/lib/socket";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bike,
  CarFront,
  Truck,
  MapPin,
  Navigation,
  Clock3,
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Route,
  ReceiptText,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

type Status =
  | "idle"
  | "requested"
  | "awaiting_payment"
  | "rejected"
  | "expired"
  | "cancelled"
  | "payment"
  | "confirmed";

const page = () => {
  const params = useSearchParams();
  const { data: session } = useSession();

  const [status, setStatus] = useState<Status>("idle");

  const pickUpAddress = params.get("pickup") || "";
  const dropAddress = params.get("drop") || "";
  const pickupLong = params.get("pickupLong");
  const pickupLat = params.get("pickupLat");
  const dropLong = params.get("dropLong");
  const dropLat = params.get("dropLat");
  const driverId = params.get("driverId");
  const vehicleId = params.get("vehicleId");
  const mobile = params.get("mobile");
  const vehicle = params.get("vehicle") || "Bike";
  const fare = params.get("fare") || "0";

  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ADDED: Current booking ki ID store karne ke liye
  const [bookingId, setBookingId] = useState<string | null>(null);

  const statusRef = useRef<Status>("idle");
  const paymentInProgressRef = useRef(false);
  const redirectStartedRef = useRef(false);

  const updateStatus = (nextStatus: Status) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  };

  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "online" | null
  >(null);

  // Vehicle ke according icon
  const vehicleIcons: Record<string, any> = {
    Bike: Bike,
    Auto: CarFront,
    Car: CarFront,
    Loading: Truck,
    Truck: Truck,
  };

  const VehicleIcon = vehicleIcons[vehicle] || CarFront;

  const handleRequestBooking = async () => {
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post("/api/booking/create", {
        driverId,
        vehicleId,
        pickUpAddress,
        dropAddress,
        pickUpLocation: {
          coordinates: [Number(pickupLong), Number(pickupLat)],
        },
        dropLocation: {
          coordinates: [Number(dropLong), Number(dropLat)],
        },
        fare,
        mobileNumber: mobile,
      });

      console.log(res);

      // ADDED: Booking create hone ke baad booking ki _id save kar rahe hain
      const createdBookingId =
        res?.data?.booking?._id?.toString() ||
        res?.data?._id?.toString();

      if (createdBookingId) {
        setBookingId(createdBookingId);
      } else {
        throw new Error("Booking ID was not returned by the API.");
      }

      updateStatus("requested");
    } catch (error: any) {
      console.error("CREATE BOOKING ERROR:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to request your ride. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingStatus = useCallback(async () => {
    // Payment ya confirmed booking ko polling se overwrite nahi karna
    if (
      paymentInProgressRef.current ||
      statusRef.current === "payment" ||
      statusRef.current === "confirmed"
    ) {
      return;
    }

    try {
      const res = await axios.get("/api/partner/bookings/active");

      console.log("ACTIVE BOOKING RESPONSE:", res);

      // ADDED: Active booking ko safely nikal rahe hain
      const activeBooking = res?.data?.booking;

      // ADDED: Active booking ki ID save kar rahe hain
      if (activeBooking?._id) {
        setBookingId(activeBooking._id.toString());
      }

      // ADDED: API response se booking status safely nikal rahe hain
      const currentStatus =
        res?.data?.bookingStatus ||
        activeBooking?.bookingStatus ||
        null;

      console.log("CURRENT BOOKING STATUS:", currentStatus);

      if (!currentStatus) return;

      const normalizedStatus =
        currentStatus === "awaitingPayment"
          ? "awaiting_payment"
          : currentStatus === "awaiting-payment"
            ? "awaiting_payment"
            : currentStatus;

      updateStatus(normalizedStatus as Status);
    } catch (error) {
      console.error("FETCHING ACTIVE BOOKING STATUS ERROR:", error);
    }
  }, []);

  // ADDED: Booking ID ke through cancel request bhej rahe hain
  const handleCancelRequest = async (id: string) => {
    if (cancelLoading) return;

    setCancelLoading(true);
    setErrorMessage("");

    try {
      await axios.post(`/api/booking/${id}/cancel-request`);

      updateStatus("idle");
      setBookingId(null);
    } catch (error: any) {
      console.error("CANCEL REQUEST ERROR:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to cancel the ride request. Please try again.",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const handlePayment = () => {
    if (!paymentMethod || paymentLoading) return;

    console.log("Selected payment method:", paymentMethod);
    console.log("Booking ID:", bookingId);

    if (!bookingId) {
      console.error("Booking ID is missing");

      setErrorMessage(
        "Booking ID not found. Please refresh and try again.",
      );

      return;
    }

    setErrorMessage("");

    // Yahan baad mein cash payment API laga sakte ho
    // Yahan baad mein Razorpay / online payment gateway laga sakte ho
    handleConfirmPayment();
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      ) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true), {
          once: true,
        });

        existingScript.addEventListener("error", () => resolve(false), {
          once: true,
        });

        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      //abhi bas ye element create hua hai isse hame abhi apne document mein append bhi toh karna hai
      document.body.appendChild(script);
    });
  };

  //ab api call krenge payment create wali
  const handleConfirmPayment = async () => {
    if (!bookingId || !paymentMethod || paymentInProgressRef.current) {
      return;
    }

    paymentInProgressRef.current = true;
    setPaymentLoading(true);
    setErrorMessage("");

    try {
      if (paymentMethod === "online") {
        const razorpayLoaded = await loadRazorpayScript();

        if (!razorpayLoaded) {
          throw new Error("Razorpay script failed to load. Please try again.");
        }

        const { data } = await axios.post("/api/payment/create", {
          bookingId,
        });

        //hame ab ye steps krne honge jiski wajah se payment gateway hame visible hojaaye
        const RazorpayConstructor = (window as any).Razorpay;

        if (!RazorpayConstructor) {
          throw new Error(
            "Razorpay checkout is not available. Please try again.",
          );
        }

        if (!data?.orderId || !data?.amount) {
          console.error("Invalid Razorpay order response:", data);

          throw new Error(
            "Payment order could not be created. Please try again.",
          );
        }

        const paymentObject = new RazorpayConstructor({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: "INR",
          name: "WahanKaro",
          description: "Ride payment",
          order_id: data.orderId,

          handler: async (response: any) => {
            //mota mota jaanle ki iske andr humne apni payment verify krte hai
            //jab hum apni payment krne ke liye razorpay ke page pe continue click krenge card wagera select krne ke baad waise hi hamara ye handler function call hoga aur iska kaam hoga payment verify krna ki payment hui yaa nahi

            //isme hum apni payment verify krne wali api ko call krenge
            try {
              setPaymentLoading(true);

              const { data } = await axios.post("/api/payment/verify", {
                bookingId,
                ...response,
              });

              if (data.success) {
                updateStatus("confirmed");
                paymentInProgressRef.current = false;

                // Success screen briefly show karke ride page par redirect
                redirectStartedRef.current = true;

                setTimeout(() => {
                  window.location.assign(`/ride/${bookingId}`);
                }, 2500);
              } else {
                paymentInProgressRef.current = false;

                setErrorMessage(
                  "Payment verification failed. Please contact support.",
                );
              }
            } catch (error: any) {
              console.error("Payment verification error:", error);

              paymentInProgressRef.current = false;

              setErrorMessage(
                error?.response?.data?.message ||
                  "Payment verification failed. Please try again.",
              );
            } finally {
              setPaymentLoading(false);
            }
          },

          modal: {
            ondismiss: () => {
              console.log("Razorpay checkout closed by user.");

              paymentInProgressRef.current = false;
              setPaymentLoading(false);
            },
          },
        });

        paymentObject.open();

        // Payment gateway open ho gaya, ab page button ka loader hata do
        setPaymentLoading(false);
      } else {
        //ye cash ke case mein call hogi
        console.log("Cash confirmation started:", bookingId);

        const { data } = await axios.get(
          `/api/booking/${bookingId}/confirm`,
        );

        console.log("Cash confirmation API response:", data);

        if (data.success) {
          updateStatus("confirmed");

          // Success screen briefly show karke ride page par redirect
          redirectStartedRef.current = true;

          setTimeout(() => {
            window.location.assign(`/ride/${bookingId}`);
          }, 2500);
        } else {
          throw new Error(
            data?.message || "Cash confirmation failed. Please try again.",
          );
        }
      }
    } catch (error: any) {
      console.error("Payment initialization error:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to confirm payment. Please try again.",
      );
    } finally {
      paymentInProgressRef.current = false;
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingStatus();
  }, [fetchBookingStatus]);

  useEffect(() => {
    if (status !== "requested") return;

    const interval = setInterval(() => {
      fetchBookingStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [status, fetchBookingStatus]);

  useEffect(() => {
    if (status !== "awaiting_payment") return;

    const t = setTimeout(() => {
      updateStatus("payment");
    }, 2000);

    return () => {
      clearTimeout(t);
    };
  }, [status]);

  //ab yaha pe socketIo event ko listen karenge joh ki accept aur reject api se emit hoke aaya hai

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = getSocketIo();
    const registerIdentity = () => {
      socket.emit("identity", session.user.id);
    };
    const handleBookingStatus = (data: Status) => {
      setStatus(data);
    };

    socket.on("connect", registerIdentity);
    socket.on("accept-booking", handleBookingStatus);
    socket.on("reject-booking", handleBookingStatus);

    if (socket.connected) {
      registerIdentity();
    }

    return () => {
      socket.off("connect", registerIdentity);
      socket.off("accept-booking", handleBookingStatus);
      socket.off("reject-booking", handleBookingStatus);
    };
  }, [session?.user?.id]);

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-12">
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-10"
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px w-8 bg-zinc-900" />

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Booking
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-zinc-900">
            Checkout
          </h1>

          <p className="mt-1.5 text-sm font-medium text-zinc-400">
            Review your ride and confirm
          </p>
        </motion.div>

        {/* ERROR MESSAGE */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
            >
              <XCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div className="flex-1">
                <p className="text-sm font-bold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="text-xs font-bold text-red-700"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CARDS */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* LEFT CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.08,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
          >
            <div className="h-1 bg-zinc-900" />

            <div className="p-8 sm:p-10">
              {/* VEHICLE HEADER */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <div className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Selected Vehicle
                  </div>

                  <div className="text-3xl font-black tracking-tight text-zinc-900">
                    {vehicle}
                  </div>
                </div>

                {/* DYNAMIC VEHICLE ICON */}
                <div className="flex h-[76px] w-[76px] items-center justify-center rounded-2xl bg-zinc-900 shadow-lg">
                  <VehicleIcon
                    size={34}
                    strokeWidth={2}
                    className="text-white"
                  />
                </div>
              </div>

              {/* PICKUP / DROP */}
              <div className="rounded-2xl bg-zinc-50 p-5">
                {/* PICKUP */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white">
                      <MapPin
                        size={15}
                        strokeWidth={2.5}
                        className="text-zinc-900"
                      />
                    </div>

                    <div className="h-10 w-px bg-zinc-200" />
                  </div>

                  <div className="flex-1 pt-0.5">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                      Pickup
                    </div>

                    <p className="mt-1 text-sm font-semibold text-zinc-800">
                      {pickUpAddress || "Pickup location"}
                    </p>
                  </div>

                  <MapPin size={18} className="mt-1 text-zinc-300" />
                </div>

                {/* DROP */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900">
                      <div className="h-2.5 w-2.5 rounded-[3px] bg-white" />
                    </div>
                  </div>

                  <div className="flex-1 pt-0.5">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                      Drop
                    </div>

                    <p className="mt-1 text-sm font-semibold text-zinc-800">
                      {dropAddress || "Drop location"}
                    </p>
                  </div>

                  <Navigation size={18} className="mt-1 text-zinc-300" />
                </div>
              </div>

              {/* FARE */}
              <div className="mt-10 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Total Fare
                  </div>

                  <p className="mt-1 text-xs text-zinc-400">
                    Includes base + distance charges
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-zinc-400">
                    ₹
                  </span>

                  <span className="text-5xl font-black tracking-tight text-zinc-900">
                    {fare}
                  </span>
                </div>
              </div>

              {/* BOOKING REFERENCE */}
              {bookingId && (
                <div className="mt-8 border-t border-zinc-100 pt-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                    Booking Reference
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-zinc-600">
                    {bookingId}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT CARD: IDLE */}
          {(status === "idle" || status === "rejected") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.16,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
            >
              <div className="h-1 bg-zinc-900" />

              <div className="p-8 sm:p-10">
                <div className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  Ready to go?
                </div>

                <h2 className="text-3xl font-black tracking-tight text-zinc-900">
                  Confirm Your Ride
                </h2>

                {/* INFO BOX */}
                <div className="mt-8 space-y-5 rounded-2xl bg-zinc-50 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                      <Clock3 size={17} className="text-zinc-500" />
                    </div>

                    <span className="text-sm font-semibold text-zinc-500">
                      Driver will respond within 2 minutes
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                      <ShieldCheck size={17} className="text-zinc-500" />
                    </div>

                    <span className="text-sm font-semibold text-zinc-500">
                      Verified & insured drivers only
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                      <CreditCard size={17} className="text-zinc-500" />
                    </div>

                    <span className="text-sm font-semibold text-zinc-500">
                      Pay after driver accepts
                    </span>
                  </div>
                </div>

                {/* REQUEST BUTTON */}
                <button
                  onClick={handleRequestBooking}
                  disabled={loading}
                  className="mt-8 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 text-sm font-black text-white transition-all duration-200 hover:bg-black hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Creating Your Booking...
                    </>
                  ) : (
                    <>
                      Request Ride
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                {/* SECURE */}
                <div className="mt-7 flex items-center justify-center gap-2">
                  <ShieldCheck size={15} className="text-zinc-300" />

                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-300">
                    Secure & Verified Booking
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* RIGHT CARD: REQUESTED */}
          {status === "requested" && (
            <motion.div
              key="requested"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
            >
              <div className="h-1 bg-zinc-900" />

              <div className="flex flex-col items-center p-8 text-center sm:p-10">
                {/* ADDED: Requested status heading */}
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  Booking Status
                </div>

                {/* ADDED: Requested heading */}
                <h2 className="text-3xl font-black tracking-tight text-zinc-900">
                  Finding Your Driver
                </h2>

                {/* ADDED: Requested description */}
                <p className="mt-2 text-sm font-medium text-zinc-400">
                  Waiting for driver to accept your ride
                </p>

                {/* ADDED: Animated loader */}
                <div className="relative mt-10">
                  {/* ADDED: Outer pulse animation */}
                  <motion.div
                    animate={{
                      scale: [1, 1.45, 1],
                      opacity: [0.25, 0, 0.25],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full bg-zinc-900"
                  />

                  {/* ADDED: Loader circle */}
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-zinc-200 bg-zinc-100">
                    <Loader2
                      size={28}
                      strokeWidth={2.5}
                      className="animate-spin text-zinc-900"
                    />
                  </div>
                </div>

                {/* ADDED: Animated dots */}
                <div className="mt-6 flex justify-center gap-1.5">
                  {[0, 0.2, 0.4].map((delay, index) => (
                    <motion.span
                      key={index}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay,
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-zinc-900"
                    />
                  ))}
                </div>

                {/* ADDED: Driver response information */}
                <div className="mt-8 w-full rounded-2xl bg-zinc-50 p-5">
                  <div className="flex items-center justify-center gap-2">
                    <Clock3 size={16} className="text-zinc-400" />

                    <p className="text-sm font-semibold text-zinc-500">
                      Waiting for driver to accept the ride
                    </p>
                  </div>
                </div>

                {/* ADDED: Cancel request button UI */}
                <button
                  onClick={() => {
                    if (bookingId) {
                      handleCancelRequest(bookingId);
                    }
                  }}
                  disabled={!bookingId || cancelLoading}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Request"
                  )}
                </button>

                {/* SECURE */}
                <div className="mt-8 flex items-center justify-center gap-2">
                  <ShieldCheck size={14} className="text-zinc-300" />

                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-300">
                    Secure & Verified Booking
                  </span>
                </div>
              </div>
            </motion.div>
          )}


          {/* RIGHT CARD: AWAITING PAYMENT */}
          {status === "awaiting_payment" && (
            <motion.div
              key="awaiting_payment"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
            >
              <div className="h-1 bg-zinc-900" />

              <div className="flex flex-col items-center p-8 text-center sm:p-10">
                {/* DRIVER ACCEPTED ICON */}
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50"
                  >
                    <CheckCircle2
                      size={42}
                      strokeWidth={2}
                      className="text-zinc-900"
                    />
                  </motion.div>
                </div>

                {/* HEADING */}
                <h2 className="mt-7 text-3xl font-black tracking-tight text-zinc-900">
                  Driver Accepted!
                </h2>

                <p className="mt-2 text-sm font-medium text-zinc-400">
                  Preparing payment options...
                </p>

                {/* PAYMENT PROGRESS */}
                <div className="mt-10 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 2,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-zinc-900"
                  />
                </div>

                {/* PAYMENT INFO */}
                <div className="mt-8 w-full rounded-2xl bg-zinc-50 p-5">
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard size={16} className="text-zinc-400" />

                    <p className="text-sm font-semibold text-zinc-500">
                      Your ride has been accepted
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-zinc-400">
                    Continue to payment to confirm your booking
                  </p>
                </div>

                {/* SECURE */}
                <div className="mt-8 flex items-center justify-center gap-2">
                  <ShieldCheck size={14} className="text-zinc-300" />

                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-300">
                    Secure & Verified Booking
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* RIGHT CARD: PAYMENT */}
          {status === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
            >
              <div className="h-1 bg-zinc-900" />

              <div className="p-8 sm:p-10">
                {/* PAYMENT HEADER */}
                <div className="mb-8">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Almost There
                  </div>

                  <h2 className="text-3xl font-black tracking-tight text-zinc-900">
                    Select Payment
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    Choose how you would like to pay for your ride.
                  </p>
                </div>

                {/* PAYMENT METHODS */}
                <div className="space-y-4">
                  {/* CASH */}
                  <button
                    type="button"
                    disabled={paymentLoading}
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex w-full items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                      paymentMethod === "cash"
                        ? "border-zinc-900 bg-white shadow-sm"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        paymentMethod === "cash"
                          ? "bg-zinc-900"
                          : "bg-zinc-100"
                      }`}
                    >
                      <Banknote
                        size={22}
                        strokeWidth={2}
                        className={
                          paymentMethod === "cash"
                            ? "text-white"
                            : "text-zinc-700"
                        }
                      />
                    </div>

                    <div>
                      <p className="text-sm font-black text-zinc-900">
                        Cash
                      </p>

                      <p className="mt-1 text-xs font-medium text-zinc-400">
                        Pay driver after ride
                      </p>
                    </div>

                    {paymentMethod === "cash" && (
                      <CheckCircle2
                        size={20}
                        className="ml-auto text-zinc-900"
                      />
                    )}
                  </button>

                  {/* ONLINE PAYMENT */}
                  <button
                    type="button"
                    disabled={paymentLoading}
                    onClick={() => setPaymentMethod("online")}
                    className={`flex w-full items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                      paymentMethod === "online"
                        ? "border-zinc-900 bg-white shadow-sm"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        paymentMethod === "online"
                          ? "bg-zinc-900"
                          : "bg-zinc-100"
                      }`}
                    >
                      <CreditCard
                        size={22}
                        strokeWidth={2}
                        className={
                          paymentMethod === "online"
                            ? "text-white"
                            : "text-zinc-700"
                        }
                      />
                    </div>

                    <div>
                      <p className="text-sm font-black text-zinc-900">
                        Online Payment
                      </p>

                      <p className="mt-1 text-xs font-medium text-zinc-400">
                        UPI · Card · Netbanking
                      </p>
                    </div>

                    {paymentMethod === "online" && (
                      <CheckCircle2
                        size={20}
                        className="ml-auto text-zinc-900"
                      />
                    )}
                  </button>
                </div>

                {/* PAYMENT BUTTON */}
                <button
                  type="button"
                  disabled={!paymentMethod || paymentLoading}
                  onClick={handlePayment}
                  className={`mt-8 flex h-16 w-full items-center justify-center gap-3 rounded-2xl text-sm font-black transition-all duration-200 ${
                    paymentMethod && !paymentLoading
                      ? "bg-zinc-900 text-white hover:bg-black hover:shadow-xl"
                      : "cursor-not-allowed bg-zinc-300 text-white"
                  }`}
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {paymentMethod === "cash"
                        ? "Confirming Booking..."
                        : "Preparing Payment..."}
                    </>
                  ) : !paymentMethod ? (
                    "Select a Method"
                  ) : (
                    <>
                      {paymentMethod === "cash"
                        ? "Confirm Cash Payment"
                        : "Continue to Payment"}

                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                {/* SECURE */}
                <div className="mt-8 flex items-center justify-center gap-2">
                  <ShieldCheck size={14} className="text-zinc-300" />

                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-300">
                    Secure & Verified Booking
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* RIGHT CARD: CONFIRMED */}
          {status === "confirmed" && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
            >
              <div className="h-1.5 bg-emerald-500" />

              <div className="p-8 sm:p-10">
                {/* SUCCESS ICON */}
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 14,
                    }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60"
                  >
                    <CheckCircle2
                      size={44}
                      strokeWidth={1.8}
                      className="text-emerald-600"
                    />
                  </motion.div>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700">
                      Booking Confirmed
                    </span>
                  </div>

                  <h2 className="mt-4 text-3xl font-black tracking-tight text-zinc-900">
                    You're All Set!
                  </h2>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                    Your booking has been confirmed. Your ride details are
                    ready to view.
                  </p>
                </div>

                {/* CONFIRMATION DETAILS */}
                <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                  <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
                        Booking Reference
                      </p>

                      <p className="mt-1.5 break-all font-mono text-xs font-bold text-zinc-800">
                        {bookingId || "Booking confirmed"}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
                      <ReceiptText
                        size={21}
                        className="text-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                        <VehicleIcon
                          size={22}
                          className="text-zinc-800"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                          Your Vehicle
                        </p>

                        <p className="mt-1 text-sm font-black text-zinc-900">
                          {vehicle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                        Total Fare
                      </p>

                      <p className="mt-1 text-xl font-black text-zinc-900">
                        ₹{fare}
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIDE ROUTE */}
                <div className="mt-5 rounded-2xl border border-zinc-200 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Route size={17} className="text-zinc-500" />

                    <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-600">
                      Your Ride
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50">
                        <MapPin size={14} className="text-zinc-800" />
                      </div>

                      <div className="my-1 h-8 w-px border-l border-dashed border-zinc-300" />

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
                        <div className="h-2 w-2 rounded-sm bg-white" />
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                          Pickup
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold leading-5 text-zinc-800">
                          {pickUpAddress || "Pickup location"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                          Drop
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold leading-5 text-zinc-800">
                          {dropAddress || "Drop location"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* REDIRECT STATUS */}
                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-zinc-50 p-4">
                  <Loader2
                    size={18}
                    className="mt-0.5 shrink-0 animate-spin text-zinc-700"
                  />

                  <div>
                    <p className="text-sm font-bold text-zinc-800">
                      Opening your ride details...
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Please wait while we take you to your ride page.
                    </p>
                  </div>
                </div>

                {/* VIEW RIDE BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    if (bookingId) {
                      redirectStartedRef.current = true;
                      window.location.assign(`/ride/${bookingId}`);
                    }
                  }}
                  disabled={!bookingId}
                  className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 text-sm font-black text-white transition hover:bg-black hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  View Ride Details
                  <ArrowRight size={19} />
                </button>

                <div className="mt-5 flex items-center justify-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-600" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                    Your booking has been confirmed
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;

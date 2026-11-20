
"use client";

import {
  ShieldCheck,
  Copy,
  MapPin,
  LockKeyhole,
  RefreshCw,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  pickUpOtp: string;
  dropOtp: string;
  pickUpExpiresAt: string | null;
  dropExpiresAt: string | null;
  status: "confirmed" | "started" | string;
  onRegenerate: (type: "pickup" | "drop") => void;
};

const UserOtpPanel = ({
  pickUpOtp,
  dropOtp,
  pickUpExpiresAt,
  dropExpiresAt,
  status,
  onRegenerate,
}: Props) => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [copied, setCopied] = useState(false);

  const isPickup = status === "confirmed";

  const otp = isPickup ? pickUpOtp : dropOtp;
  const expiresAt = isPickup ? pickUpExpiresAt : dropExpiresAt;
  const otpType = isPickup ? "pickup" : "drop";

  useEffect(() => {
    if (!expiresAt || !otp) {
      setRemainingTime(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil(
          (new Date(expiresAt).getTime() - Date.now()) / 1000
        )
      );

      setRemainingTime(remaining);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, otp]);

  const copyOtp = async () => {
    try {
      await navigator.clipboard.writeText(otp);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.log("Copy OTP Error:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col p-5 gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {isPickup ? "Pickup Verification" : "Drop Verification"}
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            {isPickup
              ? "Share this OTP with your driver"
              : "Verify your destination arrival"}
          </p>
        </div>

        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <ShieldCheck size={22} className="text-emerald-400" />
        </div>
      </div>

      {/* OTP Card */}
      <div className="rounded-2xl border border-white/10 bg-[#171717] p-5">

        <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
          <LockKeyhole size={14} />
          {isPickup ? "YOUR PICKUP OTP" : "YOUR DROP OTP"}
        </div>

        {otp ? (
          <>
            <div className="flex items-center justify-between gap-3">

              <div className="flex gap-2">
                {otp.split("").map((digit, index) => (
                  <div
                    key={index}
                    className="w-9 h-11 sm:w-11 sm:h-12 rounded-lg bg-[#252525] border border-white/10 flex items-center justify-center text-xl sm:text-2xl font-bold text-white"
                  >
                    {digit}
                  </div>
                ))}
              </div>

              <button
                onClick={copyOtp}
                title="Copy OTP"
                className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
              >
                {copied ? (
                  <Check size={18} className="text-emerald-400" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>

            <div className="h-px bg-white/10 my-5" />

            {/* Timer */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">
                  {remainingTime > 0 ? "OTP expires in" : "OTP expired"}
                </p>

                <p
                  className={`text-2xl font-bold mt-1 ${
                    remainingTime > 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {formatTime(remainingTime)}
                </p>
              </div>

              {remainingTime > 0 && (
                <div className="text-emerald-400">
                  <ShieldCheck size={25} />
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">
            OTP is not available.
          </p>
        )}

        {/* Regenerate */}
        {remainingTime === 0 && (
          <button
            onClick={() => onRegenerate(otpType)}
            className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 transition"
          >
            <RefreshCw size={17} />
            Regenerate {isPickup ? "Pickup" : "Drop"} OTP
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="flex items-start gap-3">
        <MapPin size={18} className="text-emerald-400 mt-0.5" />

        <div>
          <p className="text-sm text-white font-medium">
            {isPickup
              ? "Verify before starting your ride"
              : "Verify before completing your ride"}
          </p>

          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            {isPickup
              ? "Share your pickup OTP with your driver only when you are ready to begin."
              : "Share your drop OTP with your driver only after reaching your destination."}
          </p>
        </div>
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck size={15} className="text-emerald-400" />

        <p className="text-xs text-gray-400">
          Never share your OTP before meeting your driver.
        </p>
      </div>
    </div>
  );
};

export default UserOtpPanel;

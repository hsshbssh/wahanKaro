
"use client";

import { ShieldCheck, Copy, MapPin, LockKeyhole } from "lucide-react";

type Props = {
  pickUpOtp: string;
  dropOtp:string;
};

const UserOtpPanel = ({ pickUpOtp,dropOtp }: Props) => {
  const copyOtp = async () => {
    await navigator.clipboard.writeText(pickUpOtp);
  };

  return (
    <div className="flex flex-col pt-5 pb-4 gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Pickup Verification
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Share this OTP with your driver
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
          YOUR PICKUP OTP
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {pickUpOtp.split("").map((digit, index) => (
              <div
                key={index}
                className="w-11 h-12 rounded-lg bg-[#252525] border border-white/10 flex items-center justify-center text-2xl font-bold text-white"
              >
                {digit}
              </div>
            ))}
          </div>

          <button
            onClick={copyOtp}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
            title="Copy OTP"
          >
            <Copy size={18} />
          </button>
        </div>

        <div className="h-px bg-white/10 my-5" />

        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-emerald-400 mt-0.5" />

          <div>
            <p className="text-sm text-white font-medium">
              Verify before starting your ride
            </p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Share this OTP with your driver only when you are ready to begin
              your journey.
            </p>
          </div>
        </div>
      </div>

      {/* Security note */}
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

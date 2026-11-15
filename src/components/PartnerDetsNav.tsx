"use client";

import {
  ArrowBigLeft,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const PartnerDetsNav = ({ name, email, status }: any) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full min-h-[60px] sticky top-0 z-50 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-22 py-3 bg-gray-100 shadow-sm flex items-center justify-between gap-4"
    >
      {/* Left Section */}
      <div className="flex items-center gap-2 min-w-0">
        <ArrowBigLeft
          onClick={() => router.back()}
          size={28}
          className="bg-white border border-black rounded-full p-1 cursor-pointer shrink-0 hover:bg-gray-200 transition"
        />

        <div className="min-w-0">
          <p className="font-bold text-sm sm:text-base text-black truncate max-w-[150px] sm:max-w-[300px]">
            {name || "Unknown Partner"}
          </p>

          <p className="font-semibold text-xs sm:text-sm text-gray-400 truncate max-w-[180px] sm:max-w-[300px]">
            {email || "No email"}
          </p>
        </div>
      </div>

      {/* Status */}
      <div
        className={`shrink-0 px-3 sm:px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
          status === "pending"
            ? "bg-yellow-100 text-yellow-600"
            : status === "approved"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
        }`}
      >
        {status === "pending" ? (
          <>
            <Clock size={18} />
            <p>Pending</p>
          </>
        ) : status === "approved" ? (
          <>
            <CheckCircle2 size={18} />
            <p>Approved</p>
          </>
        ) : (
          <>
            <XCircle size={18} />
            <p>Rejected</p>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default PartnerDetsNav;
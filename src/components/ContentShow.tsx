"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, User } from "lucide-react";
import { useRouter } from "next/navigation";

const ContentShow = ({ data, type }: any) => {
  const router = useRouter();

  //aise params krke hum id nahi lenge iss case mein kyunki ye content show admin ke liye hai but hume chahiye partner ki Id so woh hum data se lenge
  // const params=useParams()
  // const id=params?.id

  const handleStartKyc = async (id: any) => {
    try {
      const result = await axios.get(`/api/admin/videoKyc/start/${id}`);

      console.log("START KYC RESPONSE:", result.data);

      return result.data?.roomId;
    } catch (error: any) {
      console.log("Handle Start Kyc error", error);
      console.log("SERVER RESPONSE:", error.response?.data);

      return null;
    }
  };

  if (data?.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl py-16 text-center border border-dashed border-gray-200 shadow-sm"
      >
        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={22} className="text-green-400" />
        </div>

        <p className="font-bold text-gray-800 text-base">
          No available data
        </p>

        <p className="text-sm text-gray-400 mt-1">
          No pending items right now.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-5">
          {type === "partner"
            ? "Partner Reviews Queue"
            : type === "kyc"
              ? "Pending Video KYC Queue"
              : "Vehicle Reviews Queue"}
        </p>

        <p className="text-xs text-gray-400">
          {data.length} items
        </p>
      </div>

      {/* Items Loop */}
      {data.map((item: any, index: number) => {
        const name = item.name || item.owner.name;
        const email = item.email || item.owner.email;

        return (
          <motion.div
            key={item.id || item._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{
              y: -3,
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            }}
            className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm transition-shadow"
          >
            {/* Left Section */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-100 text-purple-800 text-sm font-bold shrink-0">
                {name?.charAt(0).toUpperCase() || (
                  <User size={14} />
                )}
              </div>

              <div className="truncate">
                <p className="text-sm font-medium text-gray-700">
                  {name}
                </p>

                <p className="text-xs text-gray-500">
                  {email}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl
                  ${
                    type === "kyc"
                      ? "bg-red-500 hover:bg-red-700"
                      : "bg-neutral-950 hover:bg-neutral-800"
                  }
                  text-white text-sm font-semibold transition-colors`}
                onClick={async () => {
                  if (type === "partner") {
                    router.push(
                      `/admin/review/partner/${item.id}`,
                    );
                  } else if (type === "kyc") {
                    if (item.videoKycStatus === "in_progress") {
                      if (!item.videokycRoomId) {
                        console.log(
                          "Video KYC Room ID not found",
                        );
                        return;
                      }

                      router.push(
                        `/videoKyc/${item.videokycRoomId}`,
                      );

                      return;
                    }

                    const roomId = await handleStartKyc(
                      item.id,
                    );

                    if (roomId) {
                      router.push(
                        `/videoKyc/${roomId}`,
                      );
                    }
                  } else {
                    router.push(
                      `/admin/review/vehicle/${item._id}`,
                    );
                  }
                }}
              >
                {type === "partner"
                  ? "Review"
                  : type === "kyc"
                    ? item.videoKycStatus === "in_progress"
                      ? "Join Call"
                      : "Start Kyc"
                    : "Review Vehicle"}

                <ArrowRight size={15} />
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ContentShow;
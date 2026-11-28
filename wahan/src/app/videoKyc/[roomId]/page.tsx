"use client";

import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDispatch } from "react-redux";
import { setUserData } from "@/redux/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  MicIcon,
  ShieldCheck,
  Video,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

const Page = () => {
  const { userData } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const containerRef = useRef<HTMLDivElement>(null);
  const redirectAfterApprovalRef = useRef(false);

  const params = useParams();

  const roomId = params?.roomId as string;

  const router = useRouter();
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [aLoading, setALoading] = useState(false);
  const [rLoading, setRLoading] = useState(false);

  const [reason, setReason] = useState("");

  const [approvalModel, setApprovalModel] = useState(false);
  const [rejectionModel, setRejectionModel] = useState(false);

  useEffect(() => {
    if (userData?.role !== "partner") return;

    let active = true;
    const checkKycApproval = async () => {
      try {
        const { data } = await axios.get("/api/user/me");
        if (
          !active ||
          data.videoKycStatus !== "approved" ||
          redirectAfterApprovalRef.current
        ) {
          return;
        }

        redirectAfterApprovalRef.current = true;
        dispatch(setUserData(data));
        router.replace("/");
      } catch (error) {
        if (active) {
          console.error("VIDEO KYC APPROVAL CHECK ERROR:", error);
        }
      }
    };

    checkKycApproval();
    const intervalId = window.setInterval(checkKycApproval, 3000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [dispatch, router, userData?.role]);

  const startCall = () => {
    if (!roomId) {
      console.log("Room ID not found");
      return;
    }

    if (!userData?._id) {
      console.log("User ID not found");
      return;
    }

    setLoading(true);
    setIsCallStarted(true);
  };

  useEffect(() => {
    if (!isCallStarted) {
      return;
    }

    if (!roomId) {
      console.log("Room ID not found");
      return;
    }

    if (!userData?._id) {
      console.log("User ID not found");
      return;
    }

    if (!containerRef.current) {
      console.log("Video container not found");
      return;
    }

    try {
      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);

      const serverSecret =
        process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

      const kitToken =
        ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId,
          serverSecret!,
          roomId,
          userData._id.toString(),
          userData.name || "User",
        );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,

        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },

        showPreJoinView: false,

        showScreenSharingButton: false,

        showTextChat: false,

        showUserList: false,
      });

      setLoading(false);
    } catch (error) {
      console.log("Start Call Error:", error);

      setLoading(false);
    }
  }, [isCallStarted, roomId, userData]);

  const handleApprove = async () => {
    setALoading(true);

    try {
      const { data } = await axios.post(
        "/api/admin/videoKyc/complete",
        {
          roomId,
          action: "approved",
        }
      );

      console.log(data);

      setApprovalModel(false);

      router.push("/");
    } catch (error: any) {
      console.log(
        error.response?.data?.message ?? error
      );

      setALoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      console.log("Rejection reason is required");
      return;
    }

    setRLoading(true);

    try {
      const { data } = await axios.post(
        "/api/admin/videoKyc/complete",
        {
          roomId,
          action: "rejected",
          reason: reason.trim(),
        }
      );

      console.log(data);

      setRejectionModel(false);
      setReason("");

      router.push("/");
    } catch (error: any) {
      console.log(
        error.response?.data?.message ?? error
      );

      setRLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white px-6 py-8 md:px-12">

      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <div>
          <p className="text-xl font-bold tracking-tight">
            WahanKaro
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {userData?.role === "admin"
              ? "Admin Verification"
              : "Partner Verification"}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-500/10 border border-green-500/20">

          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

          <span className="text-xs font-medium text-green-400">
            Secure Connection
          </span>

        </div>

      </div>

      {!isCallStarted ? (

        <div className="max-w-6xl mx-auto mt-12">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            <div className="relative h-[420px] rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">

              <div className="absolute inset-0 flex flex-col items-center justify-center">

                <div className="w-24 h-24 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">

                  <Video
                    size={38}
                    className="text-slate-400"
                  />

                </div>

                <p className="text-sm text-slate-400 mt-5">
                  Camera preview
                </p>

                <p className="text-xs text-slate-600 mt-1">
                  Your video will appear here after joining
                </p>

              </div>

              <div className="absolute bottom-5 left-5 right-5 flex gap-3">

                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">

                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">

                    <Camera
                      size={18}
                      className="text-green-400"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-medium">
                      Camera
                    </p>

                    <p className="text-xs text-green-400">
                      Ready
                    </p>

                  </div>

                </div>

                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">

                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">

                    <MicIcon
                      size={18}
                      className="text-green-400"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-medium">
                      Microphone
                    </p>

                    <p className="text-xs text-green-400">
                      Ready
                    </p>

                  </div>

                </div>

              </div>

            </div>

            <div>

              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">

                <ShieldCheck
                  size={28}
                  className="text-blue-400"
                />

              </div>

              <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest">
                Video Verification
              </p>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-3">
                Secure Video KYC
              </h1>

              <p className="text-slate-400 leading-relaxed mt-5 max-w-md">
                Your identity verification call is ready. Please make sure your
                camera and microphone are working properly before joining the
                verification call.
              </p>

              <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Participant
                    </p>

                    <p className="text-base font-semibold mt-1">
                      {userData?.name || "User"}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {userData?.email || ""}
                    </p>

                  </div>

                  <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">

                    <Video
                      size={20}
                      className="text-blue-400"
                    />

                  </div>

                </div>

              </div>

              <div className="flex items-start gap-3 mt-6">

                <ShieldCheck
                  size={18}
                  className="text-green-400 mt-0.5 shrink-0"
                />

                <p className="text-xs leading-relaxed text-slate-500">
                  Your video verification is secured and can only be accessed by
                  the authorized participants.
                </p>

              </div>

              <button
                onClick={startCall}
                disabled={loading || !roomId}
                className="w-full mt-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >

                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Joining Call...
                  </>
                ) : (
                  <>
                    <Video size={19} />
                    Join Call
                  </>
                )}

              </button>

              <div className="mt-5 text-center">

                <p className="text-[10px] uppercase tracking-widest text-slate-600">
                  Verification Room
                </p>

                <p className="text-xs text-slate-500 mt-1 break-all">
                  {roomId || "Room ID not available"}
                </p>

              </div>

            </div>

          </div>

        </div>

      ) : (

        <div className="max-w-7xl mx-auto mt-8">

          <div
            ref={containerRef}
            className="w-full h-[calc(100vh-230px)] min-h-[550px] rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl"
          />

          {userData?.role === "admin" && (

            <div className="flex items-center justify-center gap-4 mt-6">

              <button
                type="button"
                className="px-10 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
                onClick={() => setApprovalModel(true)}
              >
                Approve
              </button>

              <button
                type="button"
                className="px-10 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                onClick={() => setRejectionModel(true)}
              >
                Reject
              </button>

            </div>

          )}

        </div>

      )}

      <AnimatePresence>

        {approvalModel && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-[#111] border border-white/10 p-6 shadow-2xl"
            >

              <button
                type="button"
                onClick={() => {
                  setApprovalModel(false);
                  router.push("/");
                }}
                disabled={aLoading}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">

                <CheckCircle2
                  size={24}
                  className="text-green-400"
                />

              </div>

              <h2 className="text-lg font-semibold mb-2">
                Confirm Approval
              </h2>

              <p className="text-sm text-gray-400 leading-relaxed">
                Are you sure you want to approve this partner's Video KYC?
                Once approved, the partner will move to the next onboarding
                step.
              </p>

              <div className="flex gap-3 mt-7">

                <button
                  type="button"
                  onClick={() => setApprovalModel(false)}
                  disabled={aLoading}
                  className="flex-1 border border-white/10 rounded-xl py-3 text-sm font-semibold text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={aLoading}
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >

                  {aLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Approve"
                  )}

                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

        {rejectionModel && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-[#111] border border-white/10 p-6 shadow-2xl"
            >

              <button
                type="button"
                onClick={() => {
                  setRejectionModel(false);
                  setReason("");
                }}
                disabled={rLoading}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">

                <AlertTriangle
                  size={24}
                  className="text-red-400"
                />

              </div>

              <h2 className="text-lg font-semibold mb-2">
                Reject Video KYC
              </h2>

              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                Please provide a reason for rejecting this partner's Video KYC.
              </p>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
                disabled={rLoading}
                className="w-full h-28 resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-red-500/50 transition-colors disabled:opacity-50"
              />

              <div className="flex gap-3 mt-5">

                <button
                  type="button"
                  onClick={() => {
                    setRejectionModel(false);
                    setReason("");
                  }}
                  disabled={rLoading}
                  className="flex-1 border border-white/10 rounded-xl py-3 text-sm font-semibold text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={rLoading || !reason.trim()}
                  onClick={handleReject}
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >

                  {rLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Reject"
                  )}

                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
};

export default Page;
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleDashed, FileCheck, UploadCloud } from "lucide-react";
import axios from "axios";

type docsType = "aadhar" | "license" | "vehicleRc";

const page = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const [docs, setDocs] = useState<Record<docsType, File | null>>({
    aadhar: null,
    license: null,
    vehicleRc: null,
  });

  const handleImage = (doc: docsType, file: File | null) => {
    if (!file) {
      return;
    }

    setDocs((prev) => ({
      ...prev,
      [doc]: file,
    }));
  };

  // No state needed for this.
  // It will automatically become true when all 3 documents are selected.
  const continueActive = !!(docs.aadhar && docs.license && docs.vehicleRc);

  const handleDocs = async () => {
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      if (!docs.aadhar || !docs.license || !docs.vehicleRc) {
        setError("All docs are required");
        setLoading(false);
        return;
      }

      formData.append("aadhar", docs.aadhar);
      formData.append("license", docs.license);
      formData.append("vehicleRc", docs.vehicleRc);

      const { data } = await axios.post(
        "/api/partner/onboarding/documents",
        formData,
      );

      console.log(data);

      router.push("/partner/onboarding/bank");
    } catch (error: any) {
      setError(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-xl bg-white rounded-3xl border border-zinc-200 shadow-[0_25px_70px_rgba(0,0,0,0.10)] p-5 sm:p-7 lg:p-8"
      >
        {/* BACK BUTTON */}
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-teal-500 cursor-pointer transition-colors duration-300 group"
        >
          <ArrowLeft
            size={18}
            className="text-zinc-700 group-hover:text-white transition-colors"
          />
        </motion.div>

        {/* HEADER */}
        <div className="text-center pt-8 sm:pt-4">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-teal-600">
            Step 2 of 3
          </p>

          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Upload Documents
          </h1>

          <p className="mt-1 text-sm sm:text-base text-zinc-500">
            Required for verification
          </p>
        </div>

        {/* DOCUMENTS */}
        <div className="mt-7 sm:mt-8 space-y-3 sm:space-y-4">
          {/* AADHAR / ID */}
          <motion.label
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-zinc-200 bg-white hover:border-teal-400 hover:shadow-md cursor-pointer transition-all duration-300"
          >
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-zinc-900">
                Aadhar / ID Proof
              </p>

              <p className="mt-1 text-xs sm:text-sm text-zinc-500">Aadhar Id</p>
            </div>

            <div className="shrink-0 flex items-center gap-2 sm:gap-3">
              {docs.aadhar ? (
                <>
                  <span className="text-xs font-medium text-green-600">
                    Uploaded
                  </span>

                  <FileCheck size={18} className="text-green-600" />
                </>
              ) : (
                <>
                  <span className="hidden xs:block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Upload
                  </span>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 hover:bg-teal-500 rounded-full text-white flex items-center justify-center transition-colors duration-300">
                    <UploadCloud size={17} />
                  </div>
                </>
              )}

              <input
                type="file"
                hidden
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleImage("aadhar", e.target.files?.[0] || null)
                }
              />
            </div>
          </motion.label>

          {/* DRIVING LICENSE */}
          <motion.label
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-zinc-200 bg-white hover:border-teal-400 hover:shadow-md cursor-pointer transition-all duration-300"
          >
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-zinc-900">
                Driving License
              </p>

              <p className="mt-1 text-xs sm:text-sm text-zinc-500">
                Valid driving license
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 sm:gap-3">
              {docs.license ? (
                <>
                  <span className="text-xs font-medium text-green-600">
                    Uploaded
                  </span>

                  <FileCheck size={18} className="text-green-600" />
                </>
              ) : (
                <>
                  <span className="hidden xs:block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Upload
                  </span>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 hover:bg-teal-500 rounded-full text-white flex items-center justify-center transition-colors duration-300">
                    <UploadCloud size={17} />
                  </div>
                </>
              )}

              <input
                type="file"
                hidden
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleImage("license", e.target.files?.[0] || null)
                }
              />
            </div>
          </motion.label>

          {/* VEHICLE RC */}
          <motion.label
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-zinc-200 bg-white hover:border-teal-400 hover:shadow-md cursor-pointer transition-all duration-300"
          >
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-zinc-900">
                Vehicle RC
              </p>

              <p className="mt-1 text-xs sm:text-sm text-zinc-500">
                Registration Certificate
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 sm:gap-3">
              {docs.vehicleRc ? (
                <>
                  <span className="text-xs font-medium text-green-600">
                    Uploaded
                  </span>

                  <FileCheck size={18} className="text-green-600" />
                </>
              ) : (
                <>
                  <span className="hidden xs:block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Upload
                  </span>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 hover:bg-teal-500 rounded-full text-white flex items-center justify-center transition-colors duration-300">
                    <UploadCloud size={17} />
                  </div>
                </>
              )}

              <input
                type="file"
                hidden
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleImage("vehicleRc", e.target.files?.[0] || null)
                }
              />
            </div>
          </motion.label>
        </div>

        {/* SECURITY INFO */}
        <div className="mt-6 sm:mt-7 flex items-start gap-3 rounded-2xl bg-zinc-50 border border-zinc-100 p-3.5 sm:p-4">
          <div className="shrink-0 w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
            <FileCheck size={16} />
          </div>

          <p className="pt-1 text-[11px] sm:text-xs leading-relaxed text-zinc-500">
            Documents are securely stored and verified manually by our team.
          </p>
        </div>

        {/* ERROR */}
        {error && <p className="text-red-500 mt-4">*{error}</p>}

        {/* CONTINUE */}
        <motion.button
          disabled={loading || !continueActive}
          onClick={handleDocs}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-6 sm:mt-8 w-full h-12 sm:h-14 rounded-2xl bg-zinc-900 hover:bg-teal-500 text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors duration-300"
        >
          {loading ? (
            <CircleDashed className="text-white animate-spin" />
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default page;

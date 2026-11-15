"use client";

import axios from "axios";

import { RootState } from "@/redux/store";

import { useSelector } from "react-redux";

import { motion } from "framer-motion";

import { useRouter } from "next/navigation";

import { CheckCircle2, XCircle, Clock3 } from "lucide-react";

import { useEffect, useState } from "react";

import PricingModel from "./PricingModel";

import { IVehicle } from "@/model/vehicle.model";

type Step = {
  id: number;
  title: string;
  route?: string;
};

const STEPS: Step[] = [
  {
    id: 1,
    title: "Vehicle",
    route: "/partner/onboarding/vehicle",
  },
  {
    id: 2,
    title: "Documents",
    route: "/partner/onboarding/documents",
  },
  {
    id: 3,
    title: "Bank",
    route: "/partner/onboarding/bank",
  },
  {
    id: 4,
    title: "Review",
  },
  {
    id: 5,
    title: "Video KYC",
  },
  {
    id: 6,
    title: "Pricing",
  },
  {
    id: 7,
    title: "Final Review",
  },
  {
    id: 8,
    title: "Live",
  },
];

const TOTAL_STEPS = STEPS.length;

const PartnerDashboard = () => {
  const [showPricing, setShowPricing] = useState(false);
  const [vehicleData, setVehicleData] = useState<IVehicle | null>(null);

  const { userData } = useSelector(
    (state: RootState) => state.user
  );

  const router = useRouter();

  console.log("ROOM ID:", userData?.videokycRoomId);
  console.log("USER DATA:", userData);
  console.log("VEHICLE DATA FROM STATE:", vehicleData);

  useEffect(() => {
    const getVehicle = async () => {
      try {
        const { data } = await axios.get(
          "/api/partner/onboarding/vehicle"
        );

        console.log("VEHICLE API RESPONSE:", data);

        const vehicle = data?.vehicle ?? null;

        console.log("VEHICLE FROM API:", vehicle);
        console.log("VEHICLE STATUS:", vehicle?.status);

        console.log(
          "REJECTION REASON:",
          vehicle?.rejectionReason
        );

        if (vehicle?._id) {
          setVehicleData(vehicle);
        } else {
          setVehicleData(null);
        }
      } catch (error: any) {
        console.log(
          error?.response?.data?.message ??
            "Vehicle fetch error"
        );
      }
    };

    if (userData) {
      getVehicle();
    }
  }, [userData]);

  /*
    Active step directly userData se calculate karenge.
  */

  let activeStep = 1;

  if (userData) {
    /*
      Documents admin review mein hain.
      Step 3 complete hai aur Review active hai.
    */

    if (
      userData.partnerStatus === "pending" &&
      userData.partnerOnBoardingSteps === 3
    ) {
      activeStep = 4;
    }

    /*
      Documents admin ne approve kar diye hain.
      Ab Video KYC active hoga.
    */

    else if (
      userData.partnerStatus === "approved" &&
      userData.partnerOnBoardingSteps === 4 &&
      userData.videoKycStatus !== "rejected"
    ) {
      activeStep = 5;
    }

    /*
      Vehicle reject hua hai.
      Step 6 complete aur Step 7 active dikhega.
    */

    else if (vehicleData?.status === "rejected") {
      activeStep = 7;
    }

    /*
      Video KYC approved hone ke baad:
      onboardingSteps = 5
      Pricing active.
      Pricing complete hone ke baad:
      onboardingSteps = 6
      Final Review active.
    */

    else if (userData.partnerOnBoardingSteps >= 5) {
      activeStep = Math.min(
        userData.partnerOnBoardingSteps + 1,
        TOTAL_STEPS
      );
    }

    /*
      Baaki normal onboarding steps.
    */

    else {
      activeStep = Math.min(
        userData.partnerOnBoardingSteps + 1,
        TOTAL_STEPS
      );
    }
  }

  /*
    Safe progress calculation
  */

  const progressPercentage = Math.max(
    0,
    Math.min(
      100,
      ((activeStep - 1) / (TOTAL_STEPS - 1)) * 100
    )
  );

  const goToStep = (step: Step) => {
    console.log("CLICKED STEP:", step.id);

    /*
      Locked step par kuch nahi karna.
    */

    if (step.id > activeStep) {
      return;
    }

    /*
      Pricing step
    */

    if (step.id === 6) {
      setShowPricing(true);
      return;
    }

    /*
      Baaki routes
    */

    if (step.route) {
      router.push(step.route);
    }
  };

  /*
    Retry Video KYC
  */

  const handleRetryVideoKyc = async () => {
    if (!userData?.videokycRoomId) {
      console.log("Video KYC Room ID not found");
      return;
    }

    try {
      const { data } = await axios.post(
        "/api/partner/videoKyc/retry"
      );

      console.log("RETRY RESPONSE:", data);

      if (data?.success) {
        router.push(
          `/videoKyc/${userData.videokycRoomId}`
        );
      }
    } catch (error: any) {
      console.log(
        error?.response?.data?.message ??
          "Video KYC retry failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 sm:px-8 lg:px-16 pt-24 sm:pt-28 lg:pt-32 pb-20">
      <div className="max-w-7xl mx-auto">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Partner Onboarding
          </h1>

          <p className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base">
            Complete all steps to activate your account
          </p>
        </div>

        {/* STEPPER */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xl border overflow-x-auto mt-5">
          <div className="relative min-w-[850px]">

            {/* Background Line */}
            <div className="absolute left-0 right-0 top-5 h-[4px] bg-gray-200 rounded-full" />

            {/* Animated Progress Line */}
            <motion.div
              className="absolute left-0 top-5 h-[4px] bg-black rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${progressPercentage}%`,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {STEPS.map((step) => {
                const completed = step.id < activeStep;
                const active = step.id === activeStep;
                const locked = step.id > activeStep;

                return (
                  <motion.div
                    key={step.id}
                    whileHover={
                      locked ? {} : { scale: 1.08 }
                    }
                    className={`flex flex-col items-center z-10 ${
                      locked
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() => goToStep(step)}
                  >
                    {/* Step Circle */}
                    <div
                      className={`
                        w-10 h-10 rounded-full
                        border-2
                        flex items-center
                        justify-center
                        transition-all
                        duration-300
                        ${
                          completed
                            ? "bg-black border-black text-white"
                            : active
                            ? "border-black text-black bg-white"
                            : "border-gray-300 text-gray-400 bg-white"
                        }
                      `}
                    >
                      {step.id}
                    </div>

                    {/* Step Title */}
                    <span
                      className={`
                        mt-3
                        text-xs sm:text-sm
                        font-medium
                        transition-all
                        whitespace-nowrap
                        ${
                          completed || active
                            ? "text-black"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {step.title}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================
            STATUS / ONBOARDING
        ========================= */}

        {/* VEHICLE REJECTED */}
        {vehicleData?.status === "rejected" ? (
          <div className="w-full mt-7 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <XCircle
                  size={24}
                  className="text-red-600"
                />
              </div>

              <div>
                <p className="text-red-800 text-base sm:text-lg font-bold">
                  Vehicle Rejected
                </p>

                <p className="text-red-600 text-sm font-medium mt-1">
                  Your vehicle details were rejected by
                  the admin.
                </p>

                {vehicleData?.rejectionReason && (
                  <div className="mt-3 px-4 py-3 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-xs font-bold text-red-800 uppercase tracking-wide">
                      Rejection Reason
                    </p>

                    <p className="text-sm text-red-700 mt-1">
                      {vehicleData.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowPricing(true)}
              className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Review & Update
            </button>
          </div>
        ) : userData?.partnerStatus === "rejected" ? (
          /*
            PARTNER / DOCUMENTS REJECTED
          */

          <div className="w-full mt-7 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <XCircle
                  size={24}
                  className="text-red-600"
                />
              </div>

              <div>
                <p className="text-red-800 text-base sm:text-lg font-bold">
                  Documents Rejected
                </p>

                <p className="text-red-600 text-sm font-medium mt-1">
                  Your documents were rejected.
                  Please review and update your
                  documents.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                router.push(
                  "/partner/onboarding/vehicle"
                )
              }
              className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-black hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Review & Update
            </button>
          </div>
        ) : userData?.partnerOnBoardingSteps === 3 ? (
          /*
            DOCUMENTS UNDER REVIEW
          */

          <div className="w-full mt-7 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 border bg-white border-black rounded-xl">
            <p className="text-black text-base sm:text-lg font-bold">
              Documents are under review by the admin.
            </p>

            <p className="text-sm text-gray-400 font-semibold mt-1">
              This may take upto 2 Working Days
            </p>
          </div>
        ) : userData?.partnerOnBoardingSteps === 4 &&
          userData?.partnerStatus === "approved" &&
          userData?.videoKycStatus === "pending" ? (
          /*
            VIDEO KYC WAITING
          */

          <div className="w-full mt-7 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-800 text-base sm:text-lg font-bold">
              Video KYC is waiting to be started
            </p>

            <p className="text-sm text-gray-500 font-semibold mt-1">
              The admin will start your Video KYC
              verification shortly.
            </p>
          </div>
        ) : userData?.partnerOnBoardingSteps === 4 &&
          userData?.partnerStatus === "approved" &&
          userData?.videoKycStatus === "in_progress" ? (
          /*
            VIDEO KYC IN PROGRESS
          */

          <div className="w-full mt-7 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <CheckCircle2
                  size={24}
                  className="text-blue-600"
                />
              </div>

              <div>
                <p className="text-blue-800 text-base sm:text-lg font-bold">
                  Video KYC is in progress
                </p>

                <p className="text-blue-600 text-sm font-medium mt-1">
                  Your Video KYC call has been started.
                  Join the call to complete your
                  verification.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (userData?.videokycRoomId) {
                  router.push(
                    `/videoKyc/${userData.videokycRoomId}`
                  );
                }
              }}
              disabled={!userData?.videokycRoomId}
              className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Join Call
            </button>
          </div>
        ) : userData?.partnerOnBoardingSteps === 5 &&
          userData?.videoKycStatus === "approved" ? (
          /*
            PRICING ACTIVE
          */

          <div className="w-full mt-7 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-gray-700">
                  ₹
                </span>
              </div>

              <div>
                <p className="text-gray-900 text-base sm:text-lg font-bold">
                  Vehicle Pricing
                </p>

                <p className="text-gray-500 text-sm font-medium mt-1">
                  Add your vehicle image, base fare,
                  price per KM and waiting charge.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPricing(true)}
              className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Add Pricing
            </button>
          </div>
        ) : userData?.partnerOnBoardingSteps === 6 &&
          vehicleData?.status === "pending" ? (
          /*
            PRICING UNDER REVIEW
          */

          <div className="w-full mt-7 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <Clock3
                  size={24}
                  className="text-yellow-600"
                />
              </div>

              <div>
                <p className="text-yellow-800 text-base sm:text-lg font-bold">
                  Pricing Under Review
                </p>

                <p className="text-yellow-700 text-sm font-medium mt-1">
                  Your vehicle pricing details have
                  been submitted successfully and are
                  currently under review by the admin.
                </p>

                <p className="text-yellow-600 text-xs sm:text-sm font-semibold mt-2">
                  You will be notified once the review
                  is completed.
                </p>
              </div>
            </div>
          </div>
        ) : userData?.partnerOnBoardingSteps === 4 &&
          userData?.partnerStatus === "approved" &&
          userData?.videoKycStatus === "rejected" ? (
          /*
            VIDEO KYC REJECTED
          */

          <div className="w-full mt-7 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <XCircle
                  size={24}
                  className="text-red-600"
                />
              </div>

              <div>
                <p className="text-red-800 text-base sm:text-lg font-bold">
                  Video KYC Rejected
                </p>

                <p className="text-red-600 text-sm font-medium mt-1">
                  Your Video KYC was rejected.
                  Please start the verification again.
                </p>

                {userData?.videoKycRejectionReason && (
                  <div className="mt-3 px-4 py-3 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-xs font-bold text-red-800 uppercase tracking-wide">
                      Rejection Reason
                    </p>

                    <p className="text-sm text-red-700 mt-1">
                      {userData.videoKycRejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleRetryVideoKyc}
              className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-black hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Start Call Again
            </button>
          </div>
        ) : vehicleData?.status === "approved" &&
          activeStep === 8 ? (
          /*
            PARTNER IS LIVE
          */

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full mt-7 px-5 sm:px-8 lg:px-10 py-8 sm:py-10 bg-green-50 border border-green-200 rounded-2xl"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2
                  size={30}
                  className="text-green-600"
                />
              </div>

              <div>
                <p className="text-green-800 text-xl sm:text-2xl font-bold">
                  You're Live! 🎉
                </p>

                <p className="text-green-700 text-sm sm:text-base font-medium mt-1">
                  Congratulations! Your onboarding is
                  complete and your vehicle is now live.
                </p>

                <p className="text-green-600 text-sm font-semibold mt-2">
                  You can now start accepting rides.
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* PRICING MODAL */}
        <PricingModel
          open={showPricing}
          onClose={() => setShowPricing(false)}
          data={vehicleData}
        />
      </div>
    </div>
  );
};

export default PartnerDashboard;
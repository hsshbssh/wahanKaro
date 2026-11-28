"use client";

import React, { useEffect, useState } from "react";
import {
  Car,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import PartnerDetsNav from "@/components/PartnerDetsNav";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

const VehicleReview = () => {
  const params = useParams();
  const id = params?.id;

  const [image, setImage] = useState("");
  const [baseFare, setBaseFare] = useState("");
  const [pricePerKm, setPricePerKm] = useState("");
  const [waitingCharge, setWaitingCharge] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending"
  );

  // Rejection reason
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const router = useRouter();

  const getVehicleDets = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `/api/admin/review/vehicle/${id}`
      );

      console.log(
        "VEHICLE API RESPONSE:",
        data?.name,
        data?.email,
        data?.status
      );

      setImage(data?.imageUrl);
      setBaseFare(data?.baseFare);
      setPricePerKm(data?.pricePerKm);
      setWaitingCharge(data?.waitingCharge);
      setVehicleType(data?.type);
      setVehicleNumber(data?.vehicleNumber);
      setVehicleModel(data?.vehicleModel);

      setName(data?.owner?.name);
      setEmail(data?.owner?.email);

      // Existing rejection reason agar already saved hai
      setRejectionReason(data?.rejectionReason ?? "");

      setStatus(data?.status ?? "pending");

      setLoading(false);
    } catch (error: any) {
      console.log(
        error?.response?.data?.message ?? "something went wrong"
      );
      setLoading(false);
    }
  };

  const handleStatus = async (
    newStatus: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      setStatusLoading(true);

      const { data } = await axios.patch(
        `/api/admin/review/vehicle/${id}`,
        {
          status: newStatus,
          ...(newStatus === "rejected" && {
            reason
          }),
        }
      );

      console.log(data);

      setStatus(newStatus);
      setShowRejectModal(false);

      router.back();
    } catch (error: any) {
      console.log(
        error?.response?.data?.message ?? "something went wrong"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please enter rejection reason");
      return;
    }

    handleStatus("rejected", rejectionReason.trim());
  };

  useEffect(() => {
    getVehicleDets();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="font-bold text-gray-400">
          Loading vehicle details...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <PartnerDetsNav
        name={name}
        email={email}
        status={status}
      />

      <main className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-8">

          {/* ================= LEFT : VEHICLE IMAGE ================= */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[620px]">
            <div className="w-full h-full flex items-center justify-center bg-white">
              <img
                src={image}
                alt="Vehicle"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="space-y-7">

            {/* Vehicle Details */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-sm p-7">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Car
                    size={19}
                    className="text-gray-900"
                  />
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Vehicle Details
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Vehicle Type
                  </p>

                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {vehicleType}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Registration Number
                  </p>

                  <p className="text-sm font-semibold text-gray-900">
                    {vehicleNumber}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Model
                  </p>

                  <p className="text-sm font-semibold text-gray-900">
                    {vehicleModel}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Configuration */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-sm p-7">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <IndianRupee
                    size={19}
                    className="text-gray-900"
                  />
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Pricing Configuration
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Base Fare
                  </p>

                  <p className="text-sm font-semibold text-gray-900">
                    ₹{baseFare}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Price per KM
                  </p>

                  <p className="text-sm font-semibold text-gray-900">
                    ₹{pricePerKm}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Waiting Charge
                  </p>

                  <p className="text-sm font-semibold text-gray-900">
                    ₹{waitingCharge}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Decision */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-sm p-7">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <ShieldCheck
                    size={19}
                    className="text-gray-900"
                  />
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Admin Decision
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">

                {/* APPROVE */}
                <button
                  onClick={() => handleStatus("approved")}
                  disabled={statusLoading}
                  className="h-13 rounded-xl bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:opacity-50"
                >
                  <CheckCircle2 size={17} />

                  {statusLoading
                    ? "Processing..."
                    : "Approve"}
                </button>

                {/* REJECT */}
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={statusLoading}
                  className="h-13 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <XCircle size={17} />

                  Reject
                </button>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= REJECTION MODAL ================= */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle
                  size={22}
                  className="text-red-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Reject Vehicle
                </h2>

                <p className="text-sm text-gray-500">
                  Please provide a reason for rejection.
                </p>
              </div>
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) =>
                setRejectionReason(e.target.value)
              }
              placeholder="Enter rejection reason..."
              rows={5}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-black resize-none"
            />

            <div className="flex gap-3 mt-5">

              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                disabled={statusLoading}
                className="flex-1 h-11 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={
                  statusLoading ||
                  !rejectionReason.trim()
                }
                className="flex-1 h-11 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-400"
              >
                {statusLoading
                  ? "Rejecting..."
                  : "Confirm Rejection"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleReview;
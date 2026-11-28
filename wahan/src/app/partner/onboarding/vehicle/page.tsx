"use client";

import {
  Bike,
  Car,
  Package,
  Truck,
  ArrowLeft,
  CircleDashed,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const Vehicle = () => {
  const [vehicleType, setvehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVehicleFunc = async () => {
    setError("");
    try {
      setLoading(true);
      const { data } = await axios.post("/api/partner/onboarding/vehicle", {
        type: vehicleType,
        vehicleNumber,
        vehicleModel,
      });
      router.push("/partner/onboarding/documents");
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setError(error?.response?.data?.message ?? "something went wrong");
    }
  };
  const VEHICLE_TYPES = [
    { Icon: Bike, name: "Bike", type: "2 wheeler" },
    { Icon: Car, name: "Auto", type: "3 wheeler" },
    { Icon: Car, name: "Car", type: "4 wheeler" },
    { Icon: Package, name: "Loading", type: "Small Goods" },
    { Icon: Truck, name: "Truck", type: "Heavy Loads" },
  ];

  useEffect(() => {
    const handleGetVehicleFunc = async () => {
      try {
        const { data } = await axios.get("/api/partner/onboarding/vehicle");
        setvehicleType(data.vehicle.type);
        setVehicleModel(data.vehicle.vehicleModel);
        setVehicleNumber(data.vehicle.vehicleNumber);
      } catch (error) {
        console.log(error);
      }
    };
    handleGetVehicleFunc();
  }, []);

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
            Step 1 of 3
          </p>

          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Vehicle Details
          </h1>

          <p className="mt-1 text-sm sm:text-base text-zinc-500">
            Please provide the details of your vehicle.
          </p>
        </div>

        {/* VEHICLE TYPE */}
        <div className="mt-7 sm:mt-8">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-zinc-900">
            Vehicle Type
          </p>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {VEHICLE_TYPES.map((type, idx) => {
              const Icon = type.Icon;

              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setvehicleType(type.name)}
                  className={`group min-h-[115px] sm:min-h-[125px] rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300
                    ${
                      vehicleType === type.name
                        ? "bg-teal-500 border-teal-500 shadow-md"
                        : "bg-white border-zinc-200 hover:border-teal-400 hover:shadow-md"
                    }`}
                >
                  {/* ICON */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-colors duration-300
                      ${
                        vehicleType === type.name
                          ? "bg-white"
                          : "bg-zinc-100 group-hover:bg-teal-50"
                      }`}
                  >
                    <Icon
                      size={22}
                      className={
                        vehicleType === type.name
                          ? "text-teal-600"
                          : "text-zinc-700 group-hover:text-teal-600"
                      }
                    />
                  </div>

                  {/* VEHICLE NAME */}
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      vehicleType === type.name ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    {type.name}
                  </span>

                  {/* VEHICLE TYPE */}
                  <span
                    className={`text-[9px] sm:text-[10px] ${
                      vehicleType === type.name
                        ? "text-teal-50"
                        : "text-zinc-500"
                    }`}
                  >
                    {type.type}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* VEHICLE NUMBER */}
        <div className="mt-6 sm:mt-7">
          <label className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-zinc-900">
            Vehicle Number
          </label>

          <input
            type="text"
            placeholder="DL01AB1234"
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            value={vehicleNumber}
            className="mt-2 w-full h-11 sm:h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
          />
        </div>

        {/* VEHICLE MODEL */}
        <div className="mt-5">
          <label className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-zinc-900">
            Vehicle Model / Capacity
          </label>

          <input
            type="text"
            placeholder="CB Shine / 1 Ton"
            onChange={(e) => setVehicleModel(e.target.value)}
            value={vehicleModel}
            className="mt-2 w-full h-11 sm:h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
          />
        </div>
        {error && <p className="text-red-500 mt-4">*{error}</p>}
        {/* CONTINUE */}
        <motion.button
          disabled={loading}
          onClick={handleVehicleFunc}
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

export default Vehicle;

"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Gauge,
  MapPin,
  Navigation,
  Bike,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import axios from "axios";
import { IVehicle } from "@/model/vehicle.model";

// Leaflet uses browser APIs, so load the search map only on the client.
const SearchMap = dynamic(() => import("@/components/SearchMap"), {
  ssr: false,
});

const SearchContent = () => {
  const params = useSearchParams();

  const [pickupLocation, setPickupLocation] = useState(
    params.get("pickup") || "",
  );

  const [dropLocation, setDropLocation] = useState(
    params.get("drop") || "",
  );

  const [km, setKm] = useState<number>();

  const mobile = params.get("mobile");

  const [pickupLat, setPickupLat] = useState(
    Number(params.get("pickuplat")),
  );

  const [pickupLong, setPickupLong] = useState(
    Number(params.get("pickuplng")),
  );

  const dropLat = Number(params.get("droplat"));
  const dropLng = Number(params.get("droplng"));

  const vehicle = params.get("vehicle");

  const [vehicleLoading, setVehicleLoading] = useState(false);

  const [vehicleData, setVehicleData] = useState<IVehicle[]>([]);

  const router=useRouter()

  // sending data to nearbyVehicles api
  const dataForNearByVehicles = async () => {
    setVehicleLoading(true);

    try {
      const res = await axios.post("/api/vehicles/near-by", {
        pickupLat,
        pickupLong,
        vehicleType: vehicle,
      });

      console.log(res.data);

      setVehicleData(res.data);
    } catch (error) {
      console.log(`get near by vehicles error ${error}`);

      setVehicleData([]);
    } finally {
      setVehicleLoading(false);
    }
  };

  useEffect(() => {
    if (!pickupLat || !pickupLong || !vehicle) return;

    console.log(pickupLat, pickupLong, vehicle);

    dataForNearByVehicles();
  }, [pickupLat, pickupLong, vehicle]);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 overflow-x-hidden">
      {/* Back Button */}
      <div className="absolute top-5 left-5 z-50">
        <motion.button
          whileTap={{ scale: 0.88 }}
          className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-zinc-900" />
        </motion.button>
      </div>

      {/* Map */}
      <div className="w-full h-[52vh] relative z-0">
        <SearchMap
          pickup={pickupLocation}
          pickupLat={pickupLat}
          pickupLng={pickupLong}
          dropLat={dropLat}
          dropLng={dropLng}
          drop={dropLocation}
          onChange={(p, d) => {
            setPickupLocation(p);
            setDropLocation(d);
          }}
          onPickupLocationChange={(lat, lng) => {
            setPickupLat(lat);
            setPickupLong(lng);
          }}
          onDistance={setKm}
        />
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 160,
          damping: 22,
        }}
        className="relative z-20 mt-10 bg-white rounded-t-[28px] border-t border-zinc-200 shadow-[0_-8px_40px_rgba(0,0,0,0.08)] pt-5 pb-20 min-h-[52vh]"
      >
        <div className="px-5 lg:px-8 max-w-6xl mx-auto">
          {/* Route Details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden mb-8"
          >
            {/* Pickup */}
            <div className="flex gap-3 px-4 py-3 border-b border-zinc-100">
              <div className="flex flex-col items-center pt-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />

                <div
                  className="w-px flex-1 bg-zinc-300 my-1"
                  style={{ minHeight: 14 }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">
                  Pickup
                </p>

                <p className="text-sm text-zinc-900 font-semibold leading-snug truncate">
                  {pickupLocation || ""}
                </p>
              </div>

              <MapPin
                size={18}
                className="text-zinc-400 flex-shrink-0 mt-1.5"
              />
            </div>

            {/* Drop */}
            <div className="flex gap-3 px-4 py-3">
              <div className="flex flex-col items-center pt-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">
                  Drop
                </p>

                <p className="text-sm text-zinc-900 font-semibold leading-snug truncate">
                  {dropLocation || ""}
                </p>
              </div>

              <Navigation
                size={18}
                className="text-zinc-400 flex-shrink-0 mt-1.5"
              />
            </div>
          </motion.div>

          {/* Finding Vehicles */}
          {vehicleLoading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-14"
            >
              <div className="w-10 h-10 border-4 border-zinc-200 border-t-black rounded-full animate-spin mb-5" />

              <p className="text-xl font-bold text-zinc-900">
                Finding vehicles...
              </p>

              <p className="text-sm text-zinc-500 mt-1">
                Looking for nearby {vehicle || "vehicles"}
              </p>
            </motion.div>
          )}

          {/* No Nearby Vehicles */}
          {!vehicleLoading && vehicleData.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-14"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-5">
                <Bike size={28} className="text-zinc-500" />
              </div>

              <p className="text-xl font-bold text-zinc-900">
                No nearby vehicles
              </p>

              <p className="text-sm text-zinc-500 mt-1 text-center">
                No {vehicle || "vehicles"} are available near your pickup
                location.
              </p>
            </motion.div>
          )}

          {/* Available Vehicles */}
          {!vehicleLoading && vehicleData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start justify-center"
            >
              {/* Available Heading */}
              <div className="mb-5">
                <p className="font-bold text-3xl">
                  {vehicleData.length}{" "}
                  <span className="font-bold text-black text-2xl">
                    Available
                  </span>
                </p>

                <p className="text-sm text-zinc-500 mt-1">
                  Nearby {vehicle || "vehicles"} ready to book
                </p>
              </div>

              {/* Vehicle Cards */}
              <div className="flex flex-col gap-6 w-full">
                {vehicleData.map((i, idx) => {
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-[380px] border border-zinc-200"
                    >
                      {/* Vehicle Image */}
                      <div className="relative">
                        <img
                          src={i.imageUrl}
                          alt="vehicle image"
                          className="w-full h-[210px] object-cover"
                        />

                        {/* Best Pick */}
                        {idx === 0 && (
                          <div className="absolute top-4 left-4 bg-black text-white px-4 py-2 rounded-full text-xs font-bold">
                            ⚡ BEST PICK
                          </div>
                        )}

                        {/* Vehicle Type */}
                        <div className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase">
                          {i.type}
                        </div>
                      </div>

                      {/* Vehicle Details */}
                      <div className="px-5 py-5">
                        {/* Vehicle Model */}
                        <p className="font-bold text-xl text-zinc-900">
                          {i.vehicleModel}
                        </p>

                        {/* Vehicle Number */}
                        <p className="inline-block bg-zinc-100 px-3 py-1 text-zinc-700 rounded-md text-sm mt-2">
                          {i.vehicleNumber}
                        </p>

                        {/* Vehicle / Price / Waiting Boxes */}
                        <div className="grid grid-cols-3 gap-2 mt-5">
                          {/* Vehicle */}
                          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-center">
                            <div className="flex justify-center mb-2">
                              <Bike
                                size={18}
                                className="text-zinc-500"
                              />
                            </div>

                            <p className="text-[10px] uppercase tracking-wide text-zinc-400 font-semibold">
                              Vehicle
                            </p>

                            <p className="text-sm font-bold text-zinc-900 mt-1 uppercase truncate">
                              {i.type}
                            </p>
                          </div>

                          {/* Price Per KM */}
                          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-center">
                            <div className="flex justify-center mb-2">
                              <Gauge
                                size={18}
                                className="text-zinc-500"
                              />
                            </div>

                            <p className="text-[10px] uppercase tracking-wide text-zinc-400 font-semibold">
                              Price / Km
                            </p>

                            <p className="text-lg font-bold text-zinc-900 mt-1">
                              ₹{i.pricePerKm}
                            </p>
                          </div>

                          {/* Waiting */}
                          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-center">
                            <div className="flex justify-center mb-2">
                              <Clock
                                size={18}
                                className="text-zinc-500"
                              />
                            </div>

                            <p className="text-[10px] uppercase tracking-wide text-zinc-400 font-semibold">
                              Waiting
                            </p>

                            <p className="text-lg font-bold text-zinc-900 mt-1">
                              ₹{i.waitingCharge}
                            </p>
                          </div>
                        </div>

                        {/* Fare & Book */}
                        <div className="flex items-center justify-between mt-6">
                          {/* Estimated Fare */}
                          <div>
                            <p className="text-zinc-500 text-sm">
                              Est. Fare
                            </p>

                            <p className="text-3xl font-bold text-zinc-900">
                              ₹{(i.baseFare! + km!*i.pricePerKm!).toFixed(2)}
                            </p>
                          </div>

                          {/* Book Button */}
                          <button onClick={()=>router.push(`/book/checkout?pickup=${encodeURI(pickupLocation)}&drop=${encodeURI(dropLocation)}&vehicle=${vehicle!}&driverId=${encodeURI(i.owner.toString())}&vehicleId=${i._id}&fare=${encodeURI(String(i.baseFare! + i.pricePerKm!*km!))}&pickupLat=${pickupLat}&pickupLong=${pickupLong}&dropLat=${dropLat}&dropLong=${dropLng}&mobile=${mobile}`)} className="px-7 py-3 bg-black text-white text-base font-semibold rounded-xl hover:bg-zinc-800 transition flex items-center gap-2">
                            Book
                            <span className="text-lg">→</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const SearchPage = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Loading search...</p>
      </div>
    }
  >
    <SearchContent />
  </Suspense>
);

export default SearchPage;
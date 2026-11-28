"use client";

import {
  ArrowLeft,
  Circle,
  Bike,
  Car,
  Truck,
  Package,
  Phone,
  CircleDot,
  Square,
  ArrowRight,
  CheckCircle,
  LocateFixed,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VehicleType } from "@/model/vehicle.model";
import axios from "axios";

type place = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  state?: string;
  countryCode?: string;
  lat: number;
  lng: number;
};

const page = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType | undefined>(
    undefined,
  );
  const [mobileNumber, setMobileNumber] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [pickUpLongitude, setPickUpLongitude] = useState<number>();
  const [pickUpLatitude, setPickUpLatitude] = useState<number>();
  const [pickUpCountry, setPickUpCountry] = useState("");
  const [dropLongitude, setDropLongitude] = useState<number>();
  const [dropLatitude, setDropLatitude] = useState<number>();
  const [dropCountry, setDropCountry] = useState("");
  const [dropSuggestion, setDropSuggestion] = useState<place[]>();
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [pickUpSuggestion, setPickUpSuggestion] = useState<place[]>();

  const canContinue = !!(
    vehicleType &&
    mobileNumber &&
    pickupLocation &&
    dropLocation
  ); //agr ye sab true hoga tabhi ham continue kr paayenge*

  const router = useRouter();

  const vehicleTypes = [
    {
      name: "Bike",
      description: "Quick & affordable",
      icon: Bike,
    },
    {
      name: "Auto",
      description: "Everyday rides",
      icon: Car,
    },
    {
      name: "Car",
      description: "Comfort rides",
      icon: Car,
    },
    {
      name: "Loading",
      description: "Small cargo",
      icon: Package,
    },
    {
      name: "Truck",
      description: "Heavy transport",
      icon: Truck,
    },
  ];

  /*
    Progress ka current step calculate kar rahe hain.
    0 = Vehicle
    1 = Mobile
    2 = Pickup
    3 = Destination
  */
  const makeCircleBlack =
    dropLocation !== ""
      ? 3
      : pickupLocation !== ""
        ? 2
        : mobileNumber !== ""
          ? 1
          : selectedVehicle !== null
            ? 0
            : null;

  const searchAddressLocation = async (
    query: string,
    setResults: (r: place[]) => void,
    restrict?: string | null,
  ) => {
    try {
      if (!query || query.trim().length < 3) {
        setResults([]);
        return;
      }

      const { data } = await axios.get(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          query,
        )}&limit=8&lang=en`,
      ); //is url mein ham query bhejenge aur hame query ko bhi url form mein convert krna hoga isliye hamne encodedUri use kiya hai andd uske baad & laga ke meine limit set ki hai ki kitne suggestion chahiye mujhe and uske baad lang ke andr en diya hai kyunki mujhe suggestions english mein chahiye

      console.log(data);

      let results: place[] = (data.features ?? []).map((i: any) => ({
        id: String(i.properties.osm_id),
        name: i.properties.name,
        city: i.properties.city,
        state: i.properties.state,
        country: i.properties.country,
        countryCode: i.properties.countrycode,
        lat: i.geometry.coordinates[1],
        lng: i.geometry.coordinates[0],
      }));

      console.log(results);

      if (restrict) {
        results = results.filter((r) => r.country === restrict); //iska matlab hai drop location mein bas wahi suggestion dikhao joh ki pickup country ke jaise ho mtlb agr india hai pickup country mein toh drop mein suggestions bhi india ke hi aaye*
      }

      setResults(results);
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentLocation = () => {
    setLocating(true);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;

        setPickUpLatitude(latitude);
        setPickUpLongitude(longitude);
        setLocationError("");

        try {
          const { data } = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
              params: {
                format: "jsonv2",
                lat: latitude,
                lon: longitude,
              },
              timeout: 10000,
            },
          );

          if (data?.address) {
            const p = data.address;

            const address = [
              p.road || p.pedestrian || p.footway,
              p.suburb || p.neighbourhood || p.residential,
              p.city || p.town || p.village || p.municipality,
              p.state,
            ]
              .filter(Boolean)
              .join(", ");

            setPickUpCountry(p.country || "");
            setPickupLocation(
              address || data.display_name || `${latitude}, ${longitude}`,
            );
          } else {
            setPickupLocation(`${latitude}, ${longitude}`);
            setLocationError(
              "Address not found. Using your coordinates instead.",
            );
          }

          setPickUpSuggestion([]);
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          setPickupLocation(`${latitude}, ${longitude}`);
          setLocationError(
            "Couldn't fetch the address. Using your coordinates instead.",
          );
          setPickUpSuggestion([]);
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation failed:", error);

        if (error.code === 1) {
          setLocationError(
            "Location permission denied. Please allow location access.",
          );
        } else if (error.code === 2) {
          setLocationError("Your current location is unavailable.");
        } else if (error.code === 3) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError("Unable to get your current location.");
        }

        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      },
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 flex flex-col items-center justify-center px-4 py-8">
      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 21 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between h-[60px] w-full max-w-[430px] mb-2"
      >
        {/* Back + Heading */}
        <div className="flex items-center gap-3">
          <ArrowLeft
            onClick={() => router.push("/")}
            className="w-9 h-9 p-2 bg-white border border-gray-200 shadow-sm rounded-xl cursor-pointer hover:bg-black hover:text-white transition-all"
            size={22}
          />

          <div>
            <p className="font-bold text-black text-xl leading-tight">
              Book a Ride
            </p>

            <p className="text-gray-400 font-medium text-xs mt-1">
              Fill the details below
            </p>
          </div>
        </div>

        {/* Progress Circles */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                makeCircleBlack !== null && step <= makeCircleBlack
                  ? "bg-black"
                  : "bg-gray-200"
              }`}
            >
              <Circle
                className={`w-3 h-3 ${
                  makeCircleBlack !== null && step <= makeCircleBlack
                    ? "fill-white stroke-white"
                    : "fill-white stroke-gray-400"
                }`}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* ================= MAIN CARD ================= */}
      <motion.div
        initial={{ opacity: 0, y: 21 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[430px] bg-white rounded-2xl px-5 sm:px-6 pt-7 pb-6 shadow-xl shadow-gray-200/70 border border-gray-100"
      >
        {/* ================= VEHICLE ================= */}
        <div className="flex items-center gap-3 text-sm">
          <p className="bg-black rounded-full flex items-center justify-center h-6 w-6 text-white text-xs font-semibold">
            1
          </p>

          <div>
            <p className="text-gray-800 font-bold text-sm">CHOOSE VEHICLE</p>

            <p className="text-gray-400 text-[11px]">
              Select your preferred ride
            </p>
          </div>
        </div>

        {/* Vehicle Cards */}
        <div className="grid grid-cols-2 gap-3 w-full mt-5">
          {vehicleTypes.map((itm, idx) => {
            const Icon = itm.icon;
            const isSelected = selectedVehicle === idx;

            return (
              <motion.div
                whileTap={{ scale: 0.97 }}
                key={idx}
                onClick={() => {
                  setSelectedVehicle(idx);
                  setVehicleType(itm.name as VehicleType);
                }}
                className={`group p-3 rounded-xl flex items-center gap-3 border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-black border-black shadow-lg shadow-black/10"
                    : "bg-gray-50 border-gray-200 hover:bg-black hover:border-black hover:shadow-md"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isSelected ? "bg-white" : "bg-gray-200 group-hover:bg-white"
                  }`}
                >
                  <Icon size={21} className="text-black" />
                </div>

                {/* Text */}
                <div className="min-w-0">
                  <p
                    className={`font-bold text-sm transition-colors duration-200 ${
                      isSelected
                        ? "text-white"
                        : "text-black group-hover:text-white"
                    }`}
                  >
                    {itm.name}
                  </p>

                  <p
                    className={`font-medium text-[10px] mt-0.5 transition-colors duration-200 ${
                      isSelected
                        ? "text-gray-300"
                        : "text-gray-500 group-hover:text-gray-300"
                    }`}
                  >
                    {itm.description}
                  </p>
                </div>

                {isSelected && (
                  <CheckCircle
                    size={16}
                    className="text-white ml-auto shrink-0"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100 mt-7" />

        {/* ================= MOBILE NUMBER ================= */}
        <div className="mt-6">
          <div className="flex items-center gap-3 text-sm">
            <p className="bg-black rounded-full flex items-center justify-center h-6 w-6 text-white text-xs font-semibold">
              2
            </p>

            <div>
              <p className="text-gray-800 font-bold text-sm">MOBILE NUMBER</p>

              <p className="text-gray-400 text-[11px]">
                Where should we send ride updates?
              </p>
            </div>
          </div>

          {/* Phone Input */}
          <div className="mt-4 w-full h-14 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3 px-4 focus-within:border-black focus-within:bg-white transition-all">
            {/* Phone Icon */}
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
              <Phone size={17} className="text-gray-500" />
            </div>

            {/* Mobile Input */}
            <input
              type="tel"
              value={mobileNumber}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setMobileNumber(value);
              }}
              placeholder="Enter your mobile number"
              className="w-full bg-transparent outline-none text-sm text-black placeholder:text-gray-400"
            />

            {/* Green Check */}
            {mobileNumber.length === 10 && (
              <CheckCircle size={22} className="text-green-500 shrink-0" />
            )}
          </div>

          <p className="text-[11px] text-gray-400 mt-2 px-1">
            Ride updates will be sent to this number
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100 mt-6" />

        {/* ================= ROUTE ================= */}
        <div className="mt-6">
          <div className="flex items-center gap-3 text-sm">
            <p className="bg-black rounded-full flex items-center justify-center h-6 w-6 text-white text-xs font-semibold">
              3
            </p>

            <div>
              <p className="text-gray-800 font-bold text-sm">ROUTE</p>

              <p className="text-gray-400 text-[11px]">
                Choose pickup and destination
              </p>
            </div>
          </div>

          {/* Route Box */}
          <div className="mt-4 border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
            {/* Pickup Location */}
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex flex-col items-center self-stretch">
                <CircleDot
                  size={18}
                  className="text-black shrink-0"
                  fill="black"
                />

                <div className="w-px flex-1 bg-gray-300 mt-1" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                  Pickup
                </p>

                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => {
                    setPickupLocation(e.target.value);

                    searchAddressLocation(e.target.value, setPickUpSuggestion);
                  }}
                  placeholder="Pickup location"
                  className="w-full bg-transparent outline-none text-sm text-black placeholder:text-gray-400"
                />
              </div>

              <button
                disabled={locating}
                type="button"
                onClick={() => getCurrentLocation()}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0 hover:bg-gray-200 transition"
              >
                <LocateFixed
                  size={17}
                  className={`text-gray-500 ${locating ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            {pickUpSuggestion && pickUpSuggestion.length > 0 && (
              <div className="mx-3 mb-3 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {pickUpSuggestion.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const address = [
                        item.name,
                        item.city,
                        item.state,
                        item.country,
                      ]
                        .filter(Boolean)
                        .join(", ");

                      setPickupLocation(address);
                      setPickUpLatitude(item.lat);
                      setPickUpLongitude(item.lng);
                      setPickUpCountry(item.country || "");
                      setPickUpSuggestion([]);
                    }}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition"
                  >
                    <p className="text-sm font-medium text-black">
                      {item.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {[item.city, item.state, item.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Route Line */}
            <div className="h-px bg-gray-200 mx-4" />

            {/* Destination */}
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex flex-col items-center">
                <Square
                  size={14}
                  className="text-black shrink-0"
                  fill="black"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                  Destination
                </p>

                <input
                  type="text"
                  disabled={!pickupLocation} //isse ye hoga ki destination ka input disabled rahega jab tak pick up ka input fil nhi hota*
                  value={dropLocation}
                  onChange={(e) => {
                    setDropLocation(e.target.value);

                    searchAddressLocation(
                      e.target.value,
                      setDropSuggestion,
                      pickUpCountry,
                    );
                  }}
                  placeholder={
                    pickupLocation ? "Enter destination" : "Enter pickup first"
                  }
                  className="flex-1 min-w-0 w-full bg-transparent outline-none text-sm text-black placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-gray-300"
                />
              </div>

              <ArrowRight
                size={17}
                className={`shrink-0 transition ${
                  pickupLocation ? "text-gray-400" : "text-gray-200"
                }`}
              />
            </div>

            {dropSuggestion && dropSuggestion.length > 0 && (
              <div className="mx-3 mb-3 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {dropSuggestion.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const address = [
                        item.name,
                        item.city,
                        item.state,
                        item.country,
                      ]
                        .filter(Boolean)
                        .join(", ");

                      setDropLocation(address);
                      setDropLatitude(item.lat);
                      setDropLongitude(item.lng);
                      setDropCountry(item.country || "");
                      setDropSuggestion([]);
                    }}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition"
                  >
                    <p className="text-sm font-medium text-black">
                      {item.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {[item.city, item.state, item.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= CONTINUE ================= */}
        <motion.button
          onClick={() =>
            router.push(
              `/book/search?pickup=${encodeURI(pickupLocation)}&drop=${dropLocation}&vehicle=${vehicleType}&mobile=${encodeURI(mobileNumber)}&pickuplat=${pickUpLatitude}&pickuplng=${pickUpLongitude}&droplat=${dropLatitude}&droplng=${dropLongitude}`,
            )
          }
          whileTap={canContinue ? { scale: 0.98 } : {}}
          type="button"
          disabled={!canContinue}
          className={`mt-7 w-full h-14 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all ${
            canContinue
              ? "bg-black hover:bg-gray-800 shadow-lg shadow-black/10 cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
          <ArrowRight size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default page;

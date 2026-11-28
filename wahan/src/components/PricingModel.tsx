"use client";

import React, { useEffect, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { IVehicle } from "@/model/vehicle.model";
import axios from "axios";

type PropsType = {
  open: boolean;
  onClose: () => void;
  onSaved: (vehicle: IVehicle) => void;
  data: IVehicle | null;
};

const PricingModel = ({ open, onClose, onSaved, data }: PropsType) => {
  let [image, setImage] = useState<File | null>(null); //ye banaya hai taaki image joh upload krenge usse backend pe bhej sake
  let [preview, setPreview] = useState<string | null>(null); //ye banaya hai taaki joh image upload kari hai woh frontend pe bhi dikh sake

  let [baseFare, setbaseFare] = useState("");
  let [pricePerKm, setPricePerKm] = useState("");
  let [waitingCharge, setWaitingCharge] = useState("");

  // API call ke time loading state manage karne ke liye
  const [loading, setLoading] = useState(false);

  const handlePricingFunc = async () => {
    try {
      // API call start hone par loading true kar rahe hain
      setLoading(true);

      const formData = new FormData();

      if(image){
        formData.append("imageUrl",image)
      }
      formData.append("baseFare", baseFare);
      formData.append("pricePerKm", pricePerKm);
      formData.append("waitingCharge", waitingCharge);

      const { data } = await axios.post<{ vehicle: IVehicle }>(
        "/api/partner/pricing",
        formData,
      );

      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      setImage(null);
      setPreview(data.vehicle.imageUrl ?? null);
      onSaved(data.vehicle);
      onClose();
    } catch (error: any) {
      console.log(error?.response?.data?.message || "Something went wrong");
    } finally {
      // API success ya error dono cases mein loading false
      setLoading(false);
    }
  };

  useEffect(() => {
    const getPricingModel = async () => {
      try {
        const { data } = await axios.get("/api/partner/pricing");
        setPreview(data.imageUrl || null);
        setbaseFare(data.baseFare?.toString() || "");
        setPricePerKm(data.pricePerKm?.toString() || "");
        setWaitingCharge(data.waitingCharge?.toString() || "");
      } catch (error: any) {
        console.log(error?.response?.data?.message || "Something went wrong");
      }
    };
    getPricingModel();
  }, []);

  // Modal open nahi hai toh kuch render nahi karna
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center px-3 sm:px-4 py-4">
      {/* ================= MODAL ================= */}
      <div
        className="
          w-full
          max-w-[450px]
          max-h-[95vh]
          bg-white
          rounded-2xl
          shadow-2xl
          overflow-y-auto
        "
      >
        {/* ================= HEADER ================= */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Pricing & Vehicle Image
          </h2>

          <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
            Add your vehicle image and pricing details
          </p>
        </div>

        {/* ================= BODY ================= */}
        <div className="px-4 sm:px-6 py-4 space-y-4">
          {/* Vehicle Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Vehicle Image
            </label>

            {/* label bana do, kyunki label click karne par hidden file input open karwa sakta hai */}
            <label
              htmlFor="imageLabel"
              className="
                h-[160px]
                sm:h-[195px]
                w-full
                rounded-xl
                border-2
                border-dashed
                border-gray-400
                bg-gray-50
                flex
                flex-col
                items-center
                justify-center
                cursor-pointer
                hover:bg-gray-100
                hover:border-gray-600
                transition-all
                overflow-hidden
              "
            >
              {!preview ? (
                <div className="flex flex-col items-center justify-center">
                  <ImagePlus
                    size={25}
                    strokeWidth={1.8}
                    className="text-gray-500"
                  />

                  <p className="text-xs font-semibold text-gray-700 mt-2">
                    Upload Vehicle Image
                  </p>

                  <p className="text-[10px] text-gray-400 mt-1">
                    PNG, JPG or JPEG
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={preview}
                    alt="Vehicle Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 py-2 text-center text-xs font-semibold text-white">
                    Click to change image
                  </span>
                </div>
              )}
              <input
                id="imageLabel"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  if (!file.type.startsWith("image/")) {
                    alert("Please select an image file only");
                    e.currentTarget.value = "";
                    return;
                  }

                  if (preview?.startsWith("blob:")) {
                    URL.revokeObjectURL(preview);
                  }
                  setImage(file);
                  setPreview(URL.createObjectURL(file));
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {/* Base Fare */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Base Fare
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-700">
                ₹
              </span>

              <input
                type="text"
                placeholder="Enter base fare"
                onChange={(e) => setbaseFare(e.target.value)}
                value={baseFare}
                className="
                  w-full
                  h-11
                  pl-8
                  pr-3
                  rounded-lg
                  border
                  border-gray-300
                  outline-none
                  text-sm
                  text-gray-800
                  placeholder:text-gray-400
                  focus:border-black
                  transition-all
                "
              />
            </div>
          </div>

          {/* Price Per KM */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Price per KM
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-700">
                ₹
              </span>

              <input
                type="text"
                placeholder="Enter price per KM"
                onChange={(e) => setPricePerKm(e.target.value)}
                value={pricePerKm}
                className="
                  w-full
                  h-11
                  pl-8
                  pr-3
                  rounded-lg
                  border
                  border-gray-300
                  outline-none
                  text-sm
                  text-gray-800
                  placeholder:text-gray-400
                  focus:border-black
                  transition-all
                "
              />
            </div>
          </div>

          {/* Waiting Charge */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Waiting Charge / Min
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-700">
                ₹
              </span>

              <input
                type="text"
                placeholder="Enter waiting charge"
                onChange={(e) => setWaitingCharge(e.target.value)}
                value={waitingCharge}
                className="
                  w-full
                  h-11
                  pl-8
                  pr-3
                  rounded-lg
                  border
                  border-gray-300
                  outline-none
                  text-sm
                  text-gray-800
                  placeholder:text-gray-400
                  focus:border-black
                  transition-all
                "
              />
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex gap-3">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="
              flex-1
              h-10
              rounded-lg
              border
              border-gray-300
              bg-white
              text-gray-800
              text-sm
              font-semibold
              hover:bg-gray-100
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-all
            "
          >
            Cancel
          </button>

          {/* Save Button */}
          <button
            onClick={handlePricingFunc}
            disabled={loading}
            className="
              flex-1
              h-10
              rounded-lg
              bg-black
              text-white
              text-sm
              font-semibold
              hover:bg-gray-800
              active:scale-[0.98]
              disabled:opacity-70
              disabled:cursor-not-allowed
              transition-all
              flex
              items-center
              justify-center
              gap-2
            "
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingModel;

"use client";

import {
  Bike,
  Bus,
  Car,
  CarTaxiFront,
  ChevronLeft,
  ChevronRight,
  Truck,
} from "lucide-react";

import React, { useRef, useState } from "react"; // ⭐ ADDED
import { motion } from "framer-motion";

const VehicleSlider = () => {
  //ye ref banaya hai apni sliding functionality banane ke liye
  const sliderRef = useRef<HTMLDivElement>(null);
  // ⭐ ADDED
  // Currently hovered card ka index store karega
  const [hovered, setHovered] = useState<number | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir == "left" ? -300 : 300 });
  };
  const VEHICLE_CATEGORIES = [
    {
      title: "All Vehicles",
      desc: "Browse the full fleet",
      Icon: CarTaxiFront,
      tag: "Popular",
    },
    {
      title: "Bikes",
      desc: "Fast & affordable rides",
      Icon: Bike,
      tag: "Quick",
    },
    {
      title: "Cars",
      desc: "Comfortable city travel",
      Icon: Car,
      tag: "Comfort",
    },
    {
      title: "SUVs",
      desc: "Premium & spacious",
      Icon: Car,
      tag: "Premium",
    },
    {
      title: "Vans",
      desc: "Family & group transport",
      Icon: Bus,
      tag: "Family",
    },
    {
      title: "Trucks",
      desc: "Heavy & commercial transport",
      Icon: Truck,
      tag: "Cargo",
    },
  ];

  return (
    <div className="w-full bg-white py-20">
      {/* ================= HEADER ================= */}

      <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-zinc-900" />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Fleet
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-teal-950 leading-none">
              Vehicles <br />
              <span className="relative inline-block">
                Categories
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-zinc-900 origin-left"
                />
              </span>
            </h2>

            <p className="text-zinc-400 text-sm mt-3 font-medium justify-around hue-rotate-0 select-text text-2xl">
              Choose the ride that suits your journey
            </p>
          </div>

          {/* ================= ARROWS ================= */}

          <div className="hidden sm:flex items-center gap-2">
            {/* LEFT BUTTON */}

            <motion.div
              onClick={() => scroll("left")}
              whileTap={{ scale: 0.88 }}
              className="w-11 h-11 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-900 hover:border-zinc-900 hover:text-white disabled:opacity-25 disabled:hover:bg-white disabled:hover:text-zinc-900 disabled:hover:border-zinc-200 transition-all text-zinc-700 shadow-sm cursor-pointer"
            >
              <ChevronLeft size={18} />
            </motion.div>

            {/* RIGHT BUTTON */}

            <motion.div
              onClick={() => scroll("right")}
              whileTap={{ scale: 0.88 }}
              className="w-11 h-11 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-900 hover:border-zinc-900 hover:text-white disabled:opacity-25 disabled:hover:bg-white disabled:hover:text-zinc-900 disabled:hover:border-zinc-200 transition-all text-zinc-700 shadow-sm cursor-pointer"
            >
              <ChevronRight size={18} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ================================================= */}
      {/* ================= VEHICLE SLIDER ================= */}
      {/* ================================================= */}

      {/* ye div hai hamara slider wali div  */}
      <div className="relative">
        {/* ⭐ ADDED
            Screenshot wala horizontal scroll container */}
        <div
          ref={sliderRef}
          className="
            flex
            gap-5
            pt-20
            overflow-x-auto
            scroll-smooth
            pb-4
            lg:px-20
            px-10
          "
          // ⭐ ADDED
          // Browser scrollbar hide karne ke liye
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* ================================================= */}
          {/* ================= MAP CATEGORIES ================= */}
          {/* ================================================= */}

          {VEHICLE_CATEGORIES.map((c, i) => {
            // ⭐ ADDED
            // Check karega ki current card hover hua hai ya nahi
            const isHovered = hovered === i;

            return (
              <motion.div
                // ⭐ ADDED
                key={i}
                // ⭐ ADDED
                // Card initially thoda neeche se appear hoga
                initial={{
                  opacity: 0,
                  y: 28,
                }}
                // ⭐ ADDED
                // Screen mein aane par normal position
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                // ⭐ ADDED
                // Har card ki animation thodi delay ke saath
                transition={{
                  delay: 0.1 + i * 0.08,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                // ⭐ ADDED
                // Hover par card 8px upar
                whileHover={{
                  y: -8,
                }}
                // ⭐ ADDED
                // Hover start
                onHoverStart={() => setHovered(i)}
                // ⭐ ADDED
                // Hover end
                onHoverEnd={() => setHovered(null)}
                // ⭐ ADDED
                className="
                  group
                  relative
                  min-w-[220px]
                  sm:min-w-[260px]
                  flex-shrink-0
                  cursor-pointer
                "
              >
                {/* ================================================= */}
                {/* ================= CARD ============================ */}
                {/* ================================================= */}

                <motion.div
                  // ⭐ ADDED
                  // Hover ke according card ka background,
                  // border aur shadow change hoga

                  animate={{
                    backgroundColor: isHovered ? "#09090b" : "#ffffff",

                    borderColor: isHovered ? "#09090b" : "#e4e4e7",

                    boxShadow: isHovered
                      ? "0 24px 56px rgba(0,0,0,0.2)"
                      : "0 2px 16px rgba(0,0,0,0.06)",
                  }}
                  // ⭐ ADDED
                  transition={{
                    duration: 0.25,
                  }}
                  className="
                    relative
                    rounded-3xl
                    border
                    p-6
                    sm:p-7
                    overflow-hidden
                    h-full
                  "
                >
                  {/* ================================================= */}
                  {/* ================= ICON ============================ */}
                  {/* ================================================= */}

                  <div
                    className={`
                      w-16
                      h-16
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      mb-6
                      transition-all
                      duration-300
                      ${
                        isHovered
                          ? "bg-white text-zinc-900"
                          : "bg-zinc-100 text-zinc-900"
                      }
                    `}
                  >
                    <c.Icon size={32} strokeWidth={1.8} />
                  </div>

                  {/* ================================================= */}
                  {/* ================= TAG ============================= */}
                  {/* ================================================= */}

                  <span
                    className={`
                      inline-flex
                      px-3
                      py-1
                      rounded-full
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      mb-4
                      transition-all
                      duration-300
                      ${
                        isHovered
                          ? "bg-white text-zinc-900"
                          : "bg-zinc-100 text-zinc-500"
                      }
                    `}
                  >
                    {c.tag}
                  </span>

                  {/* ================================================= */}
                  {/* ================= TITLE ============================ */}
                  {/* ================================================= */}

                  <h3
                    className={`
                      text-xl
                      sm:text-2xl
                      font-black
                      tracking-tight
                      transition-colors
                      duration-300
                      ${isHovered ? "text-white" : "text-zinc-900"}
                    `}
                  >
                    {c.title}
                  </h3>

                  {/* ================================================= */}
                  {/* ================= DESCRIPTION ===================== */}
                  {/* ================================================= */}

                  <p
                    className={`
                      text-sm
                      mt-2
                      font-medium
                      transition-colors
                      duration-300
                      ${isHovered ? "text-zinc-400" : "text-zinc-500"}
                    `}
                  >
                    {c.desc}
                  </p>

                  {/* ================================================= */}
                  {/* ================= BOTTOM LINE ===================== */}
                  {/* ================================================= */}

                  <div
                    className={`
                      mt-8
                      h-px
                      w-full
                      transition-colors
                      duration-300
                      ${isHovered ? "bg-zinc-700" : "bg-zinc-200"}
                    `}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
      {/* ================= VEHICLE STATS ================= */}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-6 mt-8 pt-6 lg:px-20 px-10 border-t border-zinc-100"
      >
        {[
          { num: "6+", label: "Categories" },
          { num: "10+", label: "Vehicle types" },
          { num: "24/7", label: "Availability" },
        ].map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <p className="text-zinc-900 text-lg font-black tracking-tight">
              {d.num}
            </p>

            <p className="text-zinc-400 text-sm sm:text-xs font-medium">{d.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default VehicleSlider;

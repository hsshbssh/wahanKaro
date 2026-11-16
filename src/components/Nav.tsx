"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Menu, X, LogOut, ChevronRight, Bike, CarFront } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { signOut } from "next-auth/react";
import { setUserData } from "@/redux/userSlice";
import { getSocketIo } from "@/lib/socket";

const Nav = () => {
  const MotionLink = motion(Link);

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Getting user data from Redux
  const userData = useSelector((state: RootState) => state.user.userData);

  // First letter of email
  const profileAlph = userData?.email?.slice(0, 1).toUpperCase();

  const menuItems = ["Home", "Bookings", "Fleet", "FAQ", "Contact"];

  // ================= LOGOUT =================

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });

    dispatch(setUserData(null));

    setShowProfile(false);
    setIsOpen(false);
  };


  return (
    <nav className="absolute top-10 left-1/2 transform -translate-x-1/2 rounded-full w-[90%] h-[70px] bg-gray-800 flex items-center justify-between px-6 z-50">
      {/* ================================================= */}
      {/* LOGO */}
      {/* ================================================= */}

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-white text-xl md:text-2xl font-bold"
      >
        wahan
        <span className="text-gray-400">K</span>
        ARO
      </motion.h1>

      {/* ================================================= */}
      {/* DESKTOP MENU */}
      {/* ================================================= */}

      <ul className="hidden md:flex items-center gap-8 text-white font-medium">
        {menuItems.map((item, i) => {
          const href = item === "Home" ? "/" : `/user/${item.toLowerCase()}`;

          const isActive = pathname === href;

          return (
            <MotionLink
              href={href}
              key={i}
              className={`cursor-pointer transition ${
                isActive ? "text-teal-400 font-semibold" : "hover:text-teal-400"
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {item}
            </MotionLink>
          );
        })}
      </ul>

      {/* ================================================= */}
      {/* DESKTOP LOGIN / PROFILE */}
      {/* ================================================= */}

      {userData ? (
        <motion.div
          onClick={() => setShowProfile((prev) => !prev)}
          className="hidden md:flex text-white bg-teal-500 w-10 h-10 rounded-full items-center justify-center cursor-pointer"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {profileAlph}
        </motion.div>
      ) : (
        <motion.button
          onClick={() => router.push("/login")}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden md:block bg-white text-black px-5 py-2 rounded-md font-semibold hover:bg-teal-500 hover:text-white transition"
        >
          Login
        </motion.button>
      )}

      {/* ================================================= */}
      {/* PROFILE DROPDOWN */}
      {/* ================================================= */}

      {showProfile && (
        <div className="absolute top-[80px] right-6 bg-white shadow-xl rounded-xl w-[250px] p-4 z-[100]">
          {/* USER NAME */}

          <div>
            <h2 className="text-black text-sm font-semibold">
              {userData?.name || "Ayush Sahu"}
            </h2>

            <p className="text-gray-500 text-[10px] mt-1">
              {userData?.role.toUpperCase() || "USER"}
            </p>
          </div>

          {/* ================================================= */}
          {/* BECOME A PARTNER */}
          {/* ================================================= */}

          {userData?.role == "partner" ?"" : (
            <button
              onClick={() => {
                console.log("Become Partner clicked");
                setShowProfile(false);
                router.push("/partner/onboarding/vehicle");
              }}
              className="mt-3 w-full h-[40px] bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-between px-2 transition"
            >
              {/* VEHICLE ICONS */}

              <div className="flex items-center gap-1">
                {/* BIKE */}
                <div className="bg-black text-white rounded-full w-[30px] h-[30px] flex items-center justify-center">
                  <Bike size={16} />
                </div>

                {/* CAR */}
                <div className="bg-black text-white rounded-full w-[30px] h-[30px] flex items-center justify-center">
                  <CarFront size={16} />
                </div>
              </div>

              {/* TEXT */}

              <span className="text-black text-xs font-medium">
                Become a Partner
              </span>

              {/* RIGHT ARROW */}

              <ChevronRight size={17} className="text-black" />
            </button>
          )}

          {/* ================================================= */}
          {/* LOGOUT */}
          {/* ================================================= */}

          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center gap-3 px-1 py-2 text-black hover:bg-gray-100 rounded-md transition"
          >
            <LogOut size={16} />

            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}

      {/* ================================================= */}
      {/* MOBILE PROFILE + HAMBURGER */}
      {/* ================================================= */}

      <div className="md:hidden flex items-center gap-4">
        {/* MOBILE PROFILE */}

        {userData && (
          <motion.div
            onClick={() => setShowProfile((prev) => !prev)}
            className="text-white bg-teal-500 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {profileAlph}
          </motion.div>
        )}

        {/* HAMBURGER */}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-2xl"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* ================================================= */}
      {/* MOBILE DROPDOWN */}
      {/* ================================================= */}

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-[80px] left-0 w-full bg-gray-900 rounded-md flex flex-col items-center gap-6 py-6 md:hidden"
        >
          {/* MOBILE LINKS */}

          {menuItems.map((item, i) => {
            const href = item === "Home" ? "/" : `/user/${item.toLowerCase()}`;

            const isActive = pathname === href;

            return (
              <Link
                href={href}
                key={i}
                className={`text-white text-lg ${
                  isActive
                    ? "text-teal-400 font-semibold"
                    : "hover:text-teal-400"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item}
              </Link>
            );
          })}

          {/* MOBILE LOGIN / LOGOUT */}

          {userData ? (
            <button
              onClick={handleLogout}
              className="bg-white text-black px-5 py-2 rounded-md font-semibold hover:bg-teal-500 hover:text-white transition"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                router.push("/login");
                setIsOpen(false);
              }}
              className="bg-white text-black px-5 py-2 rounded-md font-semibold hover:bg-teal-500 hover:text-white transition"
            >
              Login
            </button>
          )}
        </motion.div>
      )}
    </nav>
  );
};

export default Nav;

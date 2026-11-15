"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Car,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

const Footer = () => {
  const QUICK_LINKS = [
    "Home",
    "About Us",
    "Our Fleet",
    "How It Works",
    "Contact",
  ];

  const VEHICLE_LINKS = [
    "All Vehicles",
    "Bikes",
    "Cars",
    "SUVs",
    "Vans",
    "Trucks",
  ];

  return (
    <footer className="relative overflow-hidden bg-zinc-950 text-white">

      {/* ================= TOP ANIMATED LINE ================= */}

      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="h-px w-full origin-left bg-zinc-700"
      />

      {/* ================= BACKGROUND GLOW ================= */}

      <motion.div
        animate={{ x: [0, 80, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 right-0 h-[400px] w-[400px] rounded-full bg-teal-900/20 blur-[120px]"
      />

      <motion.div
        animate={{ x: [0, -60, 0], y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-zinc-700/10 blur-[100px]"
      />

      {/* ================= MAIN CONTAINER ================= */}

      <div className="relative mx-auto max-w-7xl px-8 sm:px-10 lg:px-20">

        {/* ================= CTA SECTION ================= */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-8 border-b border-zinc-800 py-16 md:flex-row md:items-end md:justify-between"
        >

          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px w-8 bg-white" />

              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                Ready to ride?
              </span>
            </div>

            <h2 className="max-w-2xl text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
              Your next journey
              <br />
              starts <span className="text-zinc-500">here.</span>
            </h2>
          </div>

          {/* CTA BUTTON */}

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group flex w-fit items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black text-zinc-950 transition-all hover:bg-zinc-200"
          >
            Explore Vehicles

            <motion.span whileHover={{ x: 4, y: -4 }}>
              <ArrowUpRight size={18} />
            </motion.span>
          </motion.button>

        </motion.div>

        {/* ================= FOOTER GRID ================= */}

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">

          {/* ================= BRAND ================= */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >

            <div className="mb-5 flex items-center gap-3">

              <motion.div
                whileHover={{ rotate: -8, scale: 1.05 }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-zinc-950"
              >
                <Car size={22} />
              </motion.div>

              <div>
                <h3 className="text-xl font-black tracking-tight">
                  WahanKaro
                </h3>

                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                  Move freely
                </p>
              </div>

            </div>

            <p className="max-w-xs text-sm leading-6 text-zinc-500">
              Find the perfect ride for every journey. Simple, reliable and
              convenient vehicle rentals made for you.
            </p>

            {/* SOCIAL BUTTONS */}

            <div className="mt-6 flex items-center gap-2">

              {["IG", "X", "LI"].map((item, index) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 text-[10px] font-black text-zinc-500 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
                >
                  {item}
                </motion.button>
              ))}

            </div>

          </motion.div>

          {/* ================= QUICK LINKS ================= */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >

            <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              Explore
            </h4>

            <div className="flex flex-col gap-3">

              {QUICK_LINKS.map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  whileHover={{ x: 5 }}
                  className="group flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  <ChevronRight size={13} className="opacity-0 transition-all group-hover:opacity-100" />
                  {item}
                </motion.a>
              ))}

            </div>

          </motion.div>

          {/* ================= VEHICLES ================= */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >

            <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              Vehicles
            </h4>

            <div className="flex flex-col gap-3">

              {VEHICLE_LINKS.map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  whileHover={{ x: 5 }}
                  className="group flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  <ChevronRight size={13} className="opacity-0 transition-all group-hover:opacity-100" />
                  {item}
                </motion.a>
              ))}

            </div>

          </motion.div>

          {/* ================= CONTACT ================= */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >

            <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              Get in touch
            </h4>

            <div className="space-y-4">

              {/* LOCATION */}

              <div className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-zinc-600" />

                <p className="text-sm leading-5 text-zinc-400">
                  New Delhi, India
                </p>
              </div>

              {/* PHONE */}

              <div className="flex items-center gap-3">
                <Phone size={17} className="shrink-0 text-zinc-600" />

                <p className="text-sm text-zinc-400">
                  +91 98765 43210
                </p>
              </div>

              {/* EMAIL */}

              <div className="flex items-center gap-3">
                <Mail size={17} className="shrink-0 text-zinc-600" />

                <p className="text-sm text-zinc-400">
                  hello@wahankaro.com
                </p>
              </div>

            </div>

            {/* ================= NEWSLETTER ================= */}

            <div className="mt-7">

              <p className="mb-3 text-xs font-bold text-zinc-500">
                Get updates & offers
              </p>

              <div className="flex overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">

                <input
                  type="email"
                  placeholder="Your email"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
                />

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="flex w-12 items-center justify-center bg-white text-zinc-950 transition-colors hover:bg-zinc-200"
                >
                  <Send size={16} />
                </motion.button>

              </div>

            </div>

          </motion.div>

        </div>

        {/* ================= BOTTOM BAR ================= */}

        <div className="flex flex-col gap-4 border-t border-zinc-800 py-7 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} WahanKaro. All rights reserved.
          </p>

          <div className="flex items-center gap-6">

            <a href="#" className="transition-colors hover:text-zinc-300">
              Privacy
            </a>

            <a href="#" className="transition-colors hover:text-zinc-300">
              Terms
            </a>

            <a href="#" className="transition-colors hover:text-zinc-300">
              Cookies
            </a>

          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
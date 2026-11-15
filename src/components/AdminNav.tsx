import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
const AdminNav = () => {
  return (
    <div className="w-full h-[60px] z-[999] shadow-black shadow-lg border-b border-black fixed px-25 py-8 bg-white flex items-center justify-between">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-black text-xl md:text-2xl font-bold"
        >
          wahan
          <span className="text-gray-400">K</span>
          ARO
        </motion.h1>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-[25px] min-w-auto rounded-3xl bg-green-200 text-green-600 flex items-center justify-between px-4"
      >
        <Shield className="w-5 h-5 text-green-700"/>
        <p className="text-xs">Secure mode</p>
      </motion.div>
    </div>
  );
};

export default AdminNav;

'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Bike, Car, Truck, Bus } from "lucide-react"

const vehicles = [
  { icon: Bike, label: "Bike" },
  { icon: Car, label: "Car" },
  { icon: Truck, label: "Truck" },
  { icon: Bus, label: "Van" },
]

const VehicleIcons = () => {
  return (
    <div className="flex items-center justify-center gap-10 mt-5 text-white">
      {vehicles.map((v, i) => {
        const Icon = v.icon
        return (
          <motion.div
            key={i}
            className="flex flex-col items-center cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Icon size={20} className="text-teal-400 hover:text-amber-200" />
            <span className="mt-2 text-xs">{v.label}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

export default VehicleIcons

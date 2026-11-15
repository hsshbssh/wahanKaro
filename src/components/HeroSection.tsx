
import { motion } from "framer-motion";
import VehicleIcons from "./VehicleComponent";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSocketIo } from "@/lib/socket";
const HeroSection = () => {
  const {userData}=useSelector((state:RootState)=>state.user)
  const router=useRouter()
  const handleBookClick=()=>{
    if(userData){
      router.push('/book')
    }else{
      router.push('/login')
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80" />
      {/* Content */}
      <div className="relative top-[250px] md:top-[400px] lg:top-[250px] z-10 flex flex-col items-center justify-center h-full text-white text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl md:text-6xl font-bold"
        >
          Welcome to WahanKaro
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 text-lg text-gray-400 md:text-sm max-w-xl"
        >
          From daily rides to heavy transport-all in one platform.
        </motion.p>

        <VehicleIcons/>
        <motion.button
        onClick={handleBookClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{scale:1.2}}
          transition={{ duration: 0.3 }}
          className="mt-6 px-6 py-3 bg-teal-500 hover:bg-teal-600 rounded-md text-white font-semibold"
        >
          Book Now
        </motion.button>
      </div>
    </div>
  );
};

export default HeroSection;

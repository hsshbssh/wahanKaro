"use client";

//isko hame call krna h signup ke turant baad yaani jaake register api mein issko call krdo
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleDashed } from "lucide-react";

const OtpVerification = () => {
  const searchParams=useSearchParams()
  const email=searchParams.get("email")

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading,setLoading]=useState(false)
  const[err,setErr]=useState("")
  const router=useRouter()

  const handleChangeOtp = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    
    updated[index] = value;
    setOtp(updated);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };
  const handleVerifyEmail=async()=>{
    setLoading(true)
    try {
      const verifyOtp= otp.join("")
      const res=await axios.post('/api/auth/verify-otp',{
        email,
        otp:verifyOtp
      })
      console.log(res.data)
      setOtp(["", "", "", "", "", ""])
      router.push('/login')
      setLoading(false)
    } catch (error:any) {
      setLoading(false)
      setErr(error.response.data.message ?? "something went wrong")
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 px-4">
      <motion.div
        className="w-full max-w-[400px] min-h-[450px] md:min-h-[500px] bg-gray-800 rounded-2xl shadow-2xl flex flex-col items-center justify-center px-6 sm:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeIn" }}
      >
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-200">
          <span className="text-blue-400">Verify</span>{" "}
          <span className="text-green-400">Email</span>
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-sm sm:text-base text-center mt-4">
          Enter the 6-digit OTP sent to your email
        </p>

        {/* OTP Inputs */}
        <div className="mt-8 flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              onChange={(e) => handleChangeOtp(i, e.target.value)}
              value={digit}
              maxLength={1}
              className="w-9 h-11 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold rounded-xl bg-gray-700 border border-gray-600 text-gray-200 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-300"
            />
          ))}
        </div>
          {err==""?null:<p className="mt-3 text-red-500">"{err}"</p>}
        {/* Verify Button */}
        <button disabled={loading} onClick={handleVerifyEmail} className="w-full h-12 mt-8 rounded-full bg-green-600 text-white font-semibold text-lg hover:bg-green-700 transition-colors cursor-pointer flfex items-center justify-center">

          {!loading? "Verify and create account":<CircleDashed size={18} color="white" className="animate-spin"/>}
        </button>

        {/* Resend OTP */}
        <p className="text-sm sm:text-base text-gray-400 mt-6 text-center">
          Didn't receive the code?{" "}
          <span className="text-green-400 font-medium cursor-pointer hover:underline">
            Resend OTP
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default OtpVerification;

"use client";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  CircleDashed,
  CreditCard,
  Landmark,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const page = () => {
  const router = useRouter();
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("")
  const [ifscCode, setIfscCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [upiId, setUpiId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBankDets = async () => {
    setError("");
    try {
      setLoading(true);
      const { data } = await axios.post("/api/partner/onboarding/bank", {
        accountHolder:accountHolderName,
        accountNumber,
        ifsc:ifscCode,
        mobile:mobileNumber,
        upi:upiId || null,
      });

      router.push("/");
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setError(error?.response?.data?.message);
      console.log(error);
    }
  };

  useEffect(()=>{
    const handleGetBankDets=async()=>{
      try {
        const {data}=await axios.get('/api/partner/onboarding/bank')
        setAccountHolderName(data.bankRecs.accountHolder)
        setAccountNumber(data.bankRecs.accountNumber)
        setIfscCode(data.bankRecs.ifsc)
        setUpiId(data.bankRecs.upi)
        setMobileNumber(data.mobileNumber)

      } catch (error) {
        console.log(error)
      }
    }
    handleGetBankDets()
  },[])
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-xl bg-white rounded-3xl border border-zinc-200 shadow-[0_25px_70px_rgba(0,0,0,0.10)] p-5 sm:p-7 lg:p-8"
      >
        {/* BACK BUTTON */}
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-teal-500 cursor-pointer transition-colors duration-300 group"
        >
          <ArrowLeft
            size={18}
            className="text-zinc-700 group-hover:text-white transition-colors"
          />
        </motion.div>

        {/* HEADER */}
        <div className="text-center pt-8 sm:pt-4">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-teal-600">
            Step 3 of 3
          </p>

          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Bank Payout Setup
          </h1>

          <p className="mt-1 text-sm sm:text-base text-zinc-500">
            Used for Partner payouts
          </p>
        </div>
        <div className="mt-7 sm:mt-8 space-y-3 sm:space-y-4">
          <div>
            <label
              htmlFor="ahn"
              className="text-xs font-semibold text-gray-400"
            >
              Account holder name
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-500">
                <BadgeCheck />
              </div>
              <input
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                id="ahn"
                type="text"
                placeholder="As per bank records"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
              />
            </div>
          </div>
          <div>
            <label htmlFor="an" className="text-xs font-semibold text-gray-400">
              Account number
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-500">
                <CreditCard />
              </div>
              <input
                // ye input field ko number mein convert krne ke liye hai bas
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                id="an"
                type="text"
                placeholder="Enter account number"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="ifsc"
              className="text-xs font-semibold text-gray-400"
            >
              IFSC Code
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-500">
                <Landmark />
              </div>
              <input
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                id="ifsc"
                type="text"
                placeholder="HDFC0001234"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
              />
            </div>
          </div>
          <div>
            <label htmlFor="mn" className="text-xs font-semibold text-gray-400">
              Mobile Number
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-500">
                <Phone />
              </div>
              <input
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                id="mn"
                type="number"
                placeholder="Enter 10-digit mobile number"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="upi"
              className="text-xs font-semibold text-gray-400"
            >
              UPI ID(Optional)
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                value={upiId ?? ""}
                onChange={(e) => setUpiId(e.target.value)}
                id="upi"
                type="text"
                placeholder="name@upi"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 sm:mt-7 flex items-start gap-3 rounded-2xl bg-zinc-50 border border-zinc-100 p-3.5 sm:p-4">
          <div className="shrink-0 w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
            <CheckCircle size={16} />
          </div>

          <p className="pt-1 text-[11px] sm:text-xs leading-relaxed text-zinc-500">
            Bank details are verified before first payout. This usually takes
            24-48 hours
          </p>
        </div>
        {error && <p className="text-red-500 mt-4">*{error}</p>}
        <motion.button
          disabled={loading}
          onClick={handleBankDets}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-6 sm:mt-8 w-full h-12 sm:h-14 rounded-2xl bg-zinc-900 hover:bg-teal-500 text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-colors duration-300"
        >
          {loading ? (
            <CircleDashed className="text-white animate-spin" />
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default page;

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
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setUserData } from "@/redux/userSlice";

const normalizeMobileNumber = (value: string) =>
  value.replace(/\D/g, "").slice(0, 10);

type BankField = "accountHolder" | "accountNumber" | "mobile" | "ifsc" | "upi";
type BankFieldErrors = Partial<Record<BankField, string>>;
type BankErrorResponse = {
  message?: string;
  errors?: BankFieldErrors;
};

const BankOnboardingPage = () => {
  const router = useRouter();
  const { update } = useSession();
  const dispatch = useDispatch();
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("")
  const [ifscCode, setIfscCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<BankFieldErrors>({});
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: BankField) => {
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setError("");
  };

  const handleBankDets = async () => {
    setError("");
    setFieldErrors({});

    const errors: BankFieldErrors = {};
    if (!accountHolderName.trim()) {
      errors.accountHolder = "Account holder name is required.";
    } else if (accountHolderName.trim().length < 3) {
      errors.accountHolder = "Name must be at least 3 characters.";
    }

    if (!accountNumber.trim()) {
      errors.accountNumber = "Account number is required.";
    } else if (accountNumber.trim().length < 9) {
      errors.accountNumber = "Account number must be at least 9 digits.";
    }

    if (!ifscCode.trim()) {
      errors.ifsc = "IFSC code is required.";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifscCode.trim())) {
      errors.ifsc = "Invalid IFSC format. Example: HDFC0001234.";
    }

    if (!mobileNumber.trim()) {
      errors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(normalizeMobileNumber(mobileNumber))) {
      errors.mobile = "Mobile number must be exactly 10 digits.";
    }

    if (!upiId.trim()) {
      errors.upi = "UPI ID is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);

    try {
      setLoading(true);
      await axios.post("/api/partner/onboarding/bank", {
        accountHolder:accountHolderName,
        accountNumber: accountNumber.trim(),
        ifsc: ifscCode.trim().toUpperCase(),
        mobile:normalizedMobileNumber,
        upi:upiId.trim(),
      });

      const session = await update();
      if (session?.user.role !== "partner") {
        throw new Error("Partner session could not be refreshed. Please try again.");
      }

      const { data: user } = await axios.get("/api/user/me");
      dispatch(setUserData(user));
      router.push("/");
    } catch (submitError: unknown) {
      if (axios.isAxiosError<BankErrorResponse>(submitError)) {
        const response = submitError.response?.data;
        if (response?.errors) {
          setFieldErrors(response.errors);
        } else {
          setError(
            response?.message ?? "Unable to save bank details. Please try again.",
          );
        }
      } else {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to save bank details. Please try again.",
        );
      }
      console.error("BANK DETAILS SUBMIT ERROR:", submitError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    const handleGetBankDets=async()=>{
      try {
        const {data}=await axios.get('/api/partner/onboarding/bank')
        setAccountHolderName(data.bankRecs.accountHolder)
        setAccountNumber(data.bankRecs.accountNumber)
        setIfscCode(data.bankRecs.ifsc)
        setUpiId(data.bankRecs.upi ?? "")
        const savedMobileNumber = String(data.mobileNumber ?? "").replace(
          /\D/g,
          "",
        );
        setMobileNumber(savedMobileNumber.slice(-10));

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
                onChange={(e) => {
                  setAccountHolderName(e.target.value);
                  clearFieldError("accountHolder");
                }}
                id="ahn"
                type="text"
                placeholder="As per bank records"
                aria-invalid={Boolean(fieldErrors.accountHolder)}
                aria-describedby={
                  fieldErrors.accountHolder ? "account-holder-error" : undefined
                }
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${
                  fieldErrors.accountHolder
                    ? "border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
              />
            </div>
            {fieldErrors.accountHolder && (
              <p
                id="account-holder-error"
                className="mt-1 text-xs text-red-600"
                role="alert"
              >
                {fieldErrors.accountHolder}
              </p>
            )}
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
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  clearFieldError("accountNumber");
                }}
                id="an"
                type="text"
                placeholder="Enter account number"
                aria-invalid={Boolean(fieldErrors.accountNumber)}
                aria-describedby={
                  fieldErrors.accountNumber ? "account-number-error" : undefined
                }
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${
                  fieldErrors.accountNumber
                    ? "border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
              />
            </div>
            {fieldErrors.accountNumber && (
              <p
                id="account-number-error"
                className="mt-1 text-xs text-red-600"
                role="alert"
              >
                {fieldErrors.accountNumber}
              </p>
            )}
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
                onChange={(e) => {
                  setIfscCode(e.target.value);
                  clearFieldError("ifsc");
                }}
                id="ifsc"
                type="text"
                placeholder="HDFC0001234"
                aria-invalid={Boolean(fieldErrors.ifsc)}
                aria-describedby={fieldErrors.ifsc ? "ifsc-error" : undefined}
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${
                  fieldErrors.ifsc
                    ? "border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
              />
            </div>
            {fieldErrors.ifsc && (
              <p
                id="ifsc-error"
                className="mt-1 text-xs text-red-600"
                role="alert"
              >
                {fieldErrors.ifsc}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="mobile"
              className="text-xs font-semibold text-gray-400"
            >
              Mobile Number
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-500">
                <Phone />
              </div>
              <input
                value={normalizeMobileNumber(mobileNumber)}
                onChange={(e) => {
                  setMobileNumber(normalizeMobileNumber(e.currentTarget.value));
                  clearFieldError("mobile");
                }}
                id="mobile"
                type="text"
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]{10}"
                autoComplete="tel"
                placeholder="Enter 10-digit mobile number"
                aria-invalid={Boolean(fieldErrors.mobile)}
                aria-describedby={
                  fieldErrors.mobile ? "mobile-error" : undefined
                }
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${
                  fieldErrors.mobile
                    ? "border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
              />
              {mobileNumber.length === 10 && (
                <CheckCircle
                  size={20}
                  className="shrink-0 text-green-500"
                  aria-label="Valid 10-digit mobile number"
                />
              )}
            </div>
            {fieldErrors.mobile && (
              <p
                id="mobile-error"
                className="mt-1 text-xs text-red-600"
                role="alert"
              >
                {fieldErrors.mobile}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="upi"
              className="text-xs font-semibold text-gray-400"
            >
              UPI ID
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  clearFieldError("upi");
                }}
                id="upi"
                type="text"
                required
                placeholder="name@upi"
                aria-invalid={Boolean(fieldErrors.upi)}
                aria-describedby={fieldErrors.upi ? "upi-error" : undefined}
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${
                  fieldErrors.upi
                    ? "border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
              />
            </div>
            {fieldErrors.upi && (
              <p
                id="upi-error"
                className="mt-1 text-xs text-red-600"
                role="alert"
              >
                {fieldErrors.upi}
              </p>
            )}
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

export default BankOnboardingPage;

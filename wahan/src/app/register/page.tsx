"use client";

import axios from "axios";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  CircleDashed,
  ArrowLeft,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const inputDivFields = [
    {
      icon: Mail,
      type: "email",
      placeholder: "Email address",
      value: email,
      onchange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
      },
    },
    {
      icon: Lock,
      type: "password",
      placeholder: "Password",
      value: password,
      onchange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
      },
    },
    {
      icon: User,
      type: "text",
      placeholder: "Full name",
      value: name,
      onchange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
      },
    },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      console.log(result);

      router.push(
        `/verifyotp?email=${encodeURIComponent(email)}`
      );

      setLoading(false);
    } catch (error: any) {
      setLoading(false);

      setError(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0f12] flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="absolute inset-0 pointer-events-none">

        {/* Glow */}
        <div className="absolute top-[-150px] left-[-100px] w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-3xl" />

        <div className="absolute bottom-[-150px] right-[-100px] w-[350px] h-[350px] bg-teal-400/10 rounded-full blur-3xl" />

        {/* Grid / road-like pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

      </div>


      {/* ================================================= */}
      {/* REGISTER CARD */}
      {/* ================================================= */}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[430px] bg-white rounded-3xl shadow-2xl overflow-hidden"
      >

        {/* ================================================= */}
        {/* TOP SECTION */}
        {/* ================================================= */}

        <div className="px-7 pt-8 pb-4">

          {/* Back */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition text-sm mb-7"
          >
            <ArrowLeft size={17} />
            Back
          </button>


          {/* Logo */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">
              wahan
              <span className="text-teal-500">K</span>
              ARO
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              Create your account and get moving.
            </p>
          </div>


          {/* Heading */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Create an account
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Enter your details to continue
            </p>
          </div>

        </div>


        {/* ================================================= */}
        {/* FORM */}
        {/* ================================================= */}

        <form
          onSubmit={handleRegister}
          className="px-7 pb-7"
        >

          {/* INPUTS */}

          <div className="space-y-4">

            {inputDivFields.map((item, idx) => {

              const Icon = item.icon;

              return (
                <div
                  key={idx}
                  className="group w-full h-[54px] bg-gray-100 border border-gray-200 rounded-xl flex items-center px-4 gap-3 transition focus-within:bg-white focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-400/10"
                >

                  <Icon
                    size={19}
                    className="text-gray-400 group-focus-within:text-teal-500 transition"
                  />

                  <input
                    required
                    type={item.type}
                    placeholder={item.placeholder}
                    value={item.value}
                    onChange={item.onchange}
                    className="w-full h-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                  />

                </div>
              );

            })}

          </div>


          {/* ERROR */}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
            >
              {error}
            </motion.p>
          )}


          {/* SEND OTP */}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full h-[54px] bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
          >

            {loading ? (
              <>
                <CircleDashed
                  size={19}
                  className="animate-spin"
                />

                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}

          </button>

        </form>


        {/* ================================================= */}
        {/* BOTTOM SECTION */}
        {/* ================================================= */}

        <div className="border-t border-gray-100 px-7 py-6">

          {/* SIGN IN */}

          <p className="text-center text-sm text-gray-500">

            Already have an account?{" "}

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-teal-500 font-semibold hover:text-teal-600 transition"
            >
              Sign in
            </button>

          </p>


          {/* OR */}

          <div className="flex items-center gap-3 my-5">

            <div className="flex-1 h-px bg-gray-200" />

            <span className="text-xs text-gray-400 font-medium">
              OR
            </span>

            <div className="flex-1 h-px bg-gray-200" />

          </div>


          {/* GOOGLE */}

          <button
            type="button"
            onClick={async () => {
              await signIn("google", {
                callbackUrl: "/",
              });
            }}
            className="w-full h-[50px] bg-white border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center justify-center gap-3 text-gray-800 font-medium transition"
          >

            <img
              src="/google-icon.svg"
              alt="Google"
              className="w-[19px] h-[19px]"
            />

            Continue with Google

          </button>

        </div>

      </motion.div>

    </main>
  );
};

export default Register;
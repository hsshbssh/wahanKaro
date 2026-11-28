"use client";

import axios from "axios";
import { BarChart2, Star, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Cell,
} from "recharts";

type Earning = {
  date: string;
  earnings: number;
};
const PartnerEarning = () => {
  const [earningData, setEarningData] = useState<Earning[]>([]);
  useEffect(() => {
    const handleFetchPartnerEarnings = async () => {
      try {
        const { data } = await axios.get("/api/partner/earnings");

        //hame earning mien sirf last 7days ka data show karana hai so ye kro
        const last7DaysEarning: Earning[] = data.earnings.slice(-7);

        setEarningData(last7DaysEarning);
        console.log("API Response:", data);
      } catch (error) {
        console.log("API Error:", error);
      }
    };

    handleFetchPartnerEarnings();
  }, []);

  const totalEarnings = earningData.reduce((a, b) => a + b.earnings, 0);
  const avg =
    earningData.length > 0 ? Math.round(totalEarnings / earningData.length) : 0;
  const max =
    earningData.length > 0
      ? Math.max(...earningData.map((b) => b.earnings))
      : 0;
  const bestDay = earningData.find((b) => b.earnings === max);
  const todayEarning = earningData[earningData.length - 1];
  const yesterdayEarning = earningData[earningData.length - 2];

  const delta =
    todayEarning && yesterdayEarning
      ? todayEarning.earnings - yesterdayEarning.earnings
      : 0;
  const deltaPositive = delta >= 0;
  const deltaPercentage = yesterdayEarning?.earnings
    ? Math.abs(Math.round((delta / yesterdayEarning.earnings) * 100))
    : 0;

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const metrics = [
    {
      label: "Best Day",
      value: fmt(max),
      sub: bestDay?.date ?? "-",
      icon: <Star size={14} />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Daily Avg",
      value: fmt(avg),
      sub: "per day",
      icon: <BarChart2 size={14} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Today",
      value: todayEarning ? fmt(todayEarning.earnings) : "-",
      sub:
        todayEarning && yesterdayEarning
          ? `${deltaPositive ? "+" : ""}${fmt(delta)} vs yesterday`
          : "-",
      icon: <Zap size={14} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border mt-6 border-gray-100 shadow-sm p-6 w-full">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
            Admin Dashboard
          </span>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Daily Earnings
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Last 7 Day performance.
          </p>
        </div>
        <div className="sm:ml-auto sm:text-right">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Weekly Total
          </p>
          <motion.div
            key={totalEarnings}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 font-mono tracking-tight"
          >
            {fmt(totalEarnings)}
          </motion.div>
          <div
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              deltaPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {deltaPositive ? (
              <TrendingUp size={13} />
            ) : (
              <TrendingDown size={13} />
            )}
            <span>{deltaPercentage}% vs yesterday</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${metric.bg} ${metric.color}`}
            >
              {metric.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500">
                {metric.label}
              </p>
              <p className="truncate text-lg font-bold text-gray-900">
                {metric.value}
              </p>
              <p className="truncate text-xs text-gray-400">{metric.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="h-56"
        >
          <ResponsiveContainer width={"100%"} height={"100%"}>
            <BarChart data={earningData} barCategoryGap={"30%"}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fontWeight: 500, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)
                }
              />
              <Bar dataKey="earnings" radius={[8, 8, 3, 3]}>
                {earningData.map((d, i) => {
                  const isToday = i === earningData.length - 1;
                  const isBest = d.earnings === max && !isToday;

                  return (
                    <Cell
                      key={`cell-${i}`}
                      fill={
                        isToday ? "#10b981" : isBest ? "#8b5cf6" : "#bfdbfe"
                      }
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PartnerEarning;

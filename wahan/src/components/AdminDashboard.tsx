"use client";

import axios from "axios";
import {
  CheckCircle,
  Clock,
  Minus,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TabButton from "./TabButton";
import ContentShow from "./ContentShow";
import AdminEarning from "./AdminEarning";

type Stats = {
  totalPartners: number;
  totalApprovedPartners: number;
  totalRejectedPartners: number;
  totalPendingPartners: number;
};

type Tab = "partner" | "kyc" | "vehicle";

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>();
  const [partnerReviews, setPartnerReviews] = useState<any>();
  const [pendingKycReviews, setPendingKycReviews] = useState<any>();
  const [pendingVehicleReviews, setPendingVehicleReviews] = useState<any>();


  const handleGetAdmin = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard");
      setStats(data.stats);
      setPartnerReviews(data.pendingPartnersReviews);
      setPendingVehicleReviews(data.pendingVehicleReviews)
    } catch (error: any) {
      console.log("ADMIN API ERROR:", error);
      console.log("SERVER RESPONSE:", error.response?.data);
      console.log("STATUS:", error.response?.status);
    }
  };

  const handleGetPendingVideoKyc=async()=>{
    try {
      const {data}=await axios.get('/api/admin/videoKyc/pending')
      setPendingKycReviews(data)
    } catch (error) {
      console.log(`Pending Kyc Fetching error ${error}`)
    }
  }

  useEffect(() => {
    handleGetAdmin();
    handleGetPendingVideoKyc()
  }, []);

  const CardsArray = [
    {
      id: 1,
      Icon: Users,
      title: "Total Vendors",
      subTitle: "vs last month",
      percentage: "+12",
      percentageIcon: TrendingUp,
      color: "green",
      value: stats?.totalPartners,
    },
    {
      id: 2,
      Icon: CheckCircle,
      title: "Approved",
      subTitle: "verified vendors",
      percentage: "+3",
      percentageIcon: TrendingUp,
      color: "green",
      value: stats?.totalApprovedPartners,
    },
    {
      id: 3,
      Icon: Clock,
      title: "Pending",
      subTitle: "awaiting reviews",
      percentage: "0",
      percentageIcon: Minus,
      color: "gray",
      value: stats?.totalPendingPartners,
    },
    {
      id: 4,
      Icon: XCircle,
      title: "Rejected",
      subTitle: "declined",
      percentage: "-3",
      percentageIcon: TrendingDown,
      color: "red",
      value: stats?.totalRejectedPartners,
    },
  ];

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Heading */}
      <div className="mt-[60px]">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Here's what's happening with your vendors.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {CardsArray.map((item, idx) => {
          const Icon = item.Icon;
          const SubIcon = item.percentageIcon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: idx * 0.08,
              }}
              className="w-full min-h-[190px] rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 sm:p-6 flex flex-col justify-between"
            >
              {/* Top */}
              <div className="flex items-center justify-between">
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    item.color === "green"
                      ? "bg-green-50 text-green-600"
                      : item.color === "red"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Percentage */}
                <div
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 ${
                    item.color === "green"
                      ? "bg-green-100 text-green-700"
                      : item.color === "red"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <SubIcon className="w-3.5 h-3.5" />

                  <span className="text-xs font-semibold">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Value */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {item.value ?? 0}
                </h2>

                <p className="text-sm text-gray-500 mt-1">{item.subTitle}</p>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-gray-700">
                {item.title}
              </h3>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-2 mt-10 shadow-lg border border-gray-100 flex flex-wrap gap-2">
        <TabButton
          active={activeTab === "partner"}
          count={partnerReviews?.length ?? 0}
          icon={<Users size={15} />}
          onClick={() => setActiveTab("partner")}
        >
          Pending Partner Reviews
        </TabButton>
        <TabButton
          active={activeTab === "kyc"}
          count={pendingKycReviews?.length ?? 0}
          icon={<Video size={15} />}
          onClick={() => setActiveTab("kyc")}
        >
          Pending Video Kyc
        </TabButton>
        <TabButton
          active={activeTab === "vehicle"}
          count={pendingVehicleReviews?.length ?? 0}
          icon={<Truck />}
          onClick={() => setActiveTab("vehicle")}
        >
          Pending Vehicle Reviews
        </TabButton>
      </div>
      {/*ab hume ye krna h ki pending partner reviews pe click ho toh pending partner reviews dikhne lage aur similarly baaki do bhi aur ye bhi dekhna hai ki jiska bhi count 0 ho toh No available data show ho*/}
      <AnimatePresence>
        <motion.div
        key={activeTab}
        initial={{opacity:0,y:16}}
        animate={{opacity:1,y:0}}
        exit={{opacity:0,y:-8}}
        transition={{duration:0.2,ease:"easeOut"}}
        className="space-y-3">
          {activeTab==="partner" && <ContentShow data={partnerReviews ?? []} type={"partner"}/>}
          {/* {partnerReviews ?? []} iska mtlb hai ki agr partnerReviews hai toh theek nhi toh data mein [] bhej do */}
          {activeTab==="kyc" && <ContentShow data={pendingKycReviews ?? []} type={"kyc"}/>}
          {activeTab==="vehicle" && <ContentShow data={pendingVehicleReviews ?? []} type={"vehicle"}/>}
        </motion.div>
        <AdminEarning/>
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;

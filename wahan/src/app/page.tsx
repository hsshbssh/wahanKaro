'use client'

import AdminDashboard from "@/components/AdminDashboard";
import AdminNav from "@/components/AdminNav";
import Footer from "@/components/Footer";
import GeoUpdater from "@/components/GeoUpdater";
import Nav from "@/components/Nav";
import PartnerDashboard from "@/components/PartnerDashboard";
import PartnerNav from "@/components/PartnerNav";
import PublicHome from "@/components/PublicHome";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const Home = () => {
  const { userData } = useSelector((state: RootState) => state.user);

  return (
    <div className="w-full min-h-screen bg-white">
      <GeoUpdater userId={userData?._id}/>
      {userData?.role==="admin"?(
        <AdminNav />
      ):userData?.role==="partner" ? (
        <PartnerNav/>
      ):(
        <Nav/>
      )}
      {userData?.role === "admin" ? (
        <AdminDashboard />
      ) : userData?.role === "partner" ? (
        <PartnerDashboard />
      ) : (
        <PublicHome />
      )}
      <Footer />
    </div>
  );
};

export default Home;

"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, IndianRupee, MessageCircle, Phone, User } from "lucide-react";
import RideChat from "./RideChat";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect } from "react";

// const PanelContents = ({isActive,displayDist,displayEta,status,cfg}:any) => { aise directly destructure nahi krskte kyunki parent se iss form mein props aarhe hai

// {
//   props: {
//     isActive,
//     displayDist,
//     displayEta,
//     status,
//     cfg
//   }
// }

//   return (
//     <div>
//         {displayDist}
//     </div>
//   )
// }

// export default PanelContents
//issliye hume aise krna hoga

const PanelContents = ({ props }: any) => {
  const {
    isActive,
    displayDist,
    displayEta,
    status,
    cfg,
    activeBookings,
    paymentStatus,
    canChat,
    chatOpen,
    onChatToggle,
  } = props;

  const {userData}=useSelector((state:RootState)=>state.user)
  let currentRole;
  useEffect(()=>{
    if(userData?._id===activeBookings[0]?.driver._id){
        currentRole="driver"
    }else{
        currentRole="user"
    }
    console.log(currentRole)
  },[userData?._id])

  return (
    <div className="flex flex-col pt-5 pb-4 gap-3">
      {isActive && (
        <div className="mx-5 lg:mx-6 grid grid-cols-2 gap-2">
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-zinc-600" />
            </div>

            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                ETA
              </p>
              <p className="text-lg font-black text-zinc-900 leading-none mt-0.5">
                {displayEta !== null ? Math.round(displayEta) : "--"}{" "}
                <span className="text-xs font-normal text-zinc-400 ml-0.5">
                  min
                </span>
              </p>
            </div>
          </div>

          <div className="bg-zinc-950 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <IndianRupee size={16} className="text-white" />
            </div>

            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                Fare
              </p>
              <p className="text-lg font-black text-white leading-none mt-0.5">
                {activeBookings[0].fare}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeBookings[0].user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-5 lg:mx-6"
        >
          <div className="bg-zinc-950 rounded-2xl p-4 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center">
                <User size={26} className="text-zinc-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-400 w-4 h-4 rounded-full border-2 border-zinc-950" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-white font-bold text-base truncate">
                  {activeBookings[0].user.name || "customer"}
                </p>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full flex-shrink-0">
                  <IndianRupee size={10} className="bg-amber-400" />
                  <span className="text-white text-xs font-semibold">
                    {activeBookings[0].fare}
                  </span>
                </div>
              </div>
              {activeBookings[0].paymentStatus && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      paymentStatus?.cls ?? "bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {paymentStatus?.label}
                  </span>
                </div>
              )}
            </div>

            {/* Right content yahan hoga, image me nahi dikh raha */}
          </div>
          {isActive && (
            <div className="flex gap-2 mt-2">
              {activeBookings[0].userMobile && (
                <a
                  href={`tel:${activeBookings[0].userMobileNumber}`}
                  className={`flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 active:scale-[0.97] transition-all text-zinc-900 py-3 rounded-xl text-sm font-semibold ${canChat ? "flex-1" : "w-full"}`}
                >
                  <Phone size={15} />
                  Call
                </a> //aise krne se jab mobile pe hum call pe click krenge toh seedha dialpad khulega aur waha pe number pasted milega user ka
              )}
              {canChat && (
                <button
                  onClick={onChatToggle}
                  className={`flex-1 flex items-center justify-center gap-2 active:scale-[0.97] transition-all py-3 rounded-xl text-sm font-semibold ${
                    chatOpen
                      ? "bg-zinc-200 text-zinc-900"
                      : "bg-zinc-900 hover:bg-zinc-800 text-white"
                  }`}
                >
                  <MessageCircle size={15} />
                  {chatOpen ? "Close Chat" : "Message"}
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {chatOpen && canChat && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-5 lg:mx-6 overflow-hidden"
          >
            <div className="rounded-2xl overflow-hidden border border-zinc-100 h-[400px]">
              <RideChat currentRole={currentRole} bookingId={activeBookings[0]?._id} username={activeBookings[0]?.user?.name || "Customer"} driverName={activeBookings[0]?.driver?.name || " Driver"}/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PanelContents;

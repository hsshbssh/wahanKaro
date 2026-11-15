"use client";
const RideChat = ({ currentRole, bookingId, username, driverName }: any) => {
  const otherName = currentRole === "user" ? driverName : username; //iska mtlb hai ki agr currentRole user hai toh other name driver ka hoga and vice versa
  const myName = currentRole === "user" ? username : driverName;
  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-2xl overflow-hidden border border-zinc-100">
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-zinc-100">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white"/>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-zinc-900 leading-none">{otherName}</p>
          <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">Active Now</p>
        </div>
      </div>
    </div>
  );
};

export default RideChat;

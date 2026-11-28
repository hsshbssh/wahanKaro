import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connectDb();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const session=await getServerSession(authOptions)
    if(!session){
      return NextResponse.json(
        {success:false,message:'unauthorised access denied'},
        {status:400}
      )
    }

    const driver=await User.findOne({email:session.user.email})

    const bookings = await Booking.find({
      driver:driver._id,
      paymentStatus: "paid",
      createdAt: { $gte: sevenDaysAgo },
    }).select("partnerAmount createdAt");

    let earningMap: Record<string, number> = {};

    bookings.forEach((b) => {
      const date = new Date(b.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      earningMap[date] = (earningMap[date] || 0) + (b.partnerAmount || 0);
    });

    const earnings = Object.entries(earningMap).map(([date, earnings]) => ({
      date,
      earnings,
    }));

    return Response.json({ earnings },{status:200});
  } catch (error) {
    return Response.json({error: "Failed to fetch partner earnings" }, { status: 500 });
  }
};

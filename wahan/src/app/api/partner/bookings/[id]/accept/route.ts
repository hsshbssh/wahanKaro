import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  try {
    const id = (await context.params).id;
    await connectDb();

    const booking = await Booking.findById(id);
    if (!booking || booking.bookingStatus !== "requested") {
      return NextResponse.json({ message: "Invalid Booking" }, { status: 400 });
    }
    if(booking.bookingStatus==="awaiting-payment"){
        return NextResponse.json(
            {message:"Booking already accepted"},
            {status:400}
        )
    }
    booking.bookingStatus = "awaiting-payment";

    //ab agr payment nahi hui 5 min ke andr toh booking status reject hojaaye toh uske liye pehle booking model mein payment deadline daalni hogi jaake dekh

    booking.paymentDeadline = new Date(Date.now() + 5 * 60 * 1000); //abhi se leke 5 min tak time jud jaaega

    await booking.save();

    try {
          await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
            event: "accept-booking",
            userId: booking.user,//booking mein user ki id hi hai bas
            data: booking.bookingStatus,
          });
        } catch (error) {
          console.error("ACCEPT BOOKING NOTIFICATION ERROR:", error);
        }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("ACCEPT BOOKING ERROR:", error);

    return NextResponse.json(
      { message: "accept booking error" },
      { status: 500 },
    );
  }
};

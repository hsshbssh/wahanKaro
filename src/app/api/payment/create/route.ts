import connectDb from "@/lib/db";
import razorpay from "@/lib/razorpay";
import Booking from "@/model/booking.model";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();
    const { bookingId } = await req.json();
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 400 },
      );
    }
    //creating razorpay order
    const order = await razorpay.orders.create({
      amount: booking.fare * 100, //we have to convert the amount from ₹ to paise
      currency: "INR",
      receipt: booking._id.toString(),
    });
    //payment status ko awaiting payment kardete hai
    booking.bookingStatus = "awaiting-payment";
    await booking.save();

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
      },
      { status: 200 },
    );
    
  } catch (error) {
    return NextResponse.json(
        {message:"Payment creation error"},
        {status:500}
    )
  }
};

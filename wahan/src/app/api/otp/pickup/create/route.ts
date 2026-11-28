import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { sendEmail } from "@/lib/sendMail";

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID required" },
        { status: 400 },
      );
    }

    const booking = await Booking.findById(bookingId).populate("user");

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 },
      );
    }


    if (booking.bookingStatus !== "confirmed") {
      return NextResponse.json(
        { success: false, message: "Ride is not confirmed" },
        { status: 400 },
      );
    }

    // Generate new 6 digit OTP
    const pickUpotp = crypto.randomInt(100000, 1000000).toString();

    // OTP expires after 5 minutes
    const expiresIn = new Date(Date.now() + 5 * 60 * 1000);

    booking.pickUpOtp = pickUpotp;
    booking.pickUpOtpExpires = expiresIn;

    await booking.save();

    if (booking.user.email) {
      await sendEmail(
        booking.user.email,
        "Your Pickup OTP - RYDEX",
        `
  <div style="font-family:sans-serif;padding:20px">
      <h2>Ride OTP</h2>

      <p>Your pickup OTP is:</p>

      <h1 style="letter-spacing:6px">${pickUpotp}</h1>

      <p>This OTP is valid for 5 minutes.</p>

      <p>Share this OTP with your driver to start the ride.</p>

      <br/>

      <b>WahanKaro</b>
  </div>
  `,
      );
    }

    return NextResponse.json(
      {success:true,message:"Pickup otp sent."},
      {status:200}
    )
  } catch (error) {
    console.log("Pickup OTP Create Error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to generate pickup OTP" },
      { status: 500 },
    );
  }
};

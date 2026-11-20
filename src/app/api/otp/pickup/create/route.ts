
import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";


export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Only booking owner can generate pickup OTP
    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    if (booking.bookingStatus !== "confirmed") {
      return NextResponse.json(
        { success: false, message: "Ride is not confirmed" },
        { status: 400 }
      );
    }

    // Generate new 6 digit OTP
    const pickUpotp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before storing
    const hashedOtp = crypto
      .createHmac("sha256", process.env.OTP_SECRET!)
      .update(pickUpotp)
      .digest("hex");

    // OTP expires after 5 minutes
    const expiresIn = new Date(Date.now() + 5 * 60 * 1000);

    booking.pickUpOtp = hashedOtp;
    booking.pickUpOtpExpires = expiresIn;

    await booking.save();

    return NextResponse.json(
      {
        success: true,
        pickUpotp,
        expiresAt: expiresIn,
      },
      { status: 200 }
    );

  } catch (error) {
    console.log("Pickup OTP Create Error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to generate pickup OTP" },
      { status: 500 }
    );
  }
};

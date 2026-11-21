
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

    const { bookingId, driverEnteredDropOtp } = await req.json();

    if (!bookingId || !driverEnteredDropOtp) {
      return NextResponse.json(
        { success: false, message: "Booking ID and OTP required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId).populate("user");

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Only assigned driver can verify drop OTP
    if (booking.driver.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    if (booking.dropotp!=driverEnteredDropOtp) {
      return NextResponse.json(
        { success: false, message: "Invalid Drop Otp" },
        { status: 400 }
      );
    }

    if (
      !booking.dropOtpExpires ||
      booking.dropOtpExpires.getTime() < Date.now()
    ) {
      return NextResponse.json(
        { success: false, message: "Drop OTP expired" },
        { status: 400 }
      );
    }

    booking.bookingStatus = "completed";

    // Invalidate used OTP
    booking.dropOtp = undefined;
    booking.dropOtpExpires = undefined;

    await booking.save();

    return NextResponse.json(
      {
        success: true,
        message: "Drop OTP verified successfully",
      },
      { status: 200 }
    );

  } catch (error) {
    console.log("Drop OTP Verify Error:", error);

    return NextResponse.json(
      { success: false, message: "Drop verification failed" },
      { status: 500 }
    );
  }
};

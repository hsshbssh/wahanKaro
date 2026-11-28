
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

    const { bookingId, driverEnteredPickUpOtp } = await req.json();

    if (!bookingId || !driverEnteredPickUpOtp) {
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


    if (booking.pickUpOtp!=driverEnteredPickUpOtp) {
      return NextResponse.json(
        { success: false, message: "Invalid PickUp Otp status" },
        { status: 400 }
      );
    }

    if (
      !booking.pickUpOtpExpires ||
      booking.pickUpOtpExpires.getTime() < Date.now()
    ) {
      return NextResponse.json(
        { success: false, message: "Pickup OTP expired" },
        { status: 400 }
      );
    }

    booking.bookingStatus = "started";

    // Invalidate used OTP
    booking.pickUpOtp = undefined;
    booking.pickUpOtpExpires = undefined;

    await booking.save();

    return NextResponse.json(
      {
        success: true,
        message: "Pickup OTP verified successfully",
      },
      { status: 200 }
    );

  } catch (error) {
    console.log("Pickup OTP Verify Error:", error);

    return NextResponse.json(
      { success: false, message: "Pickup verification failed" },
      { status: 500 }
    );
  }
};

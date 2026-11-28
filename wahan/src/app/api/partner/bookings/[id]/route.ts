import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 },
      );
    }

    await connectDb();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorised access denied." },
        { status: 401 },
      );
    }

    // Booking ID ko logged-in partner se scope karke sirf usi ki booking return karo.
    const booking = await Booking.findOne({
      _id: id,
      driver: session.user.id,
    }).populate("user driver vehicle");

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, booking }, { status: 200 });
  } catch (error) {
    console.error("GET PARTNER BOOKING ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to fetch booking details" },
      { status: 500 },
    );
  }
};

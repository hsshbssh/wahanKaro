import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  try {
    await connectDb();

    const { id: bookingId } = await context.params;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID is missing" },
        { status: 400 },
      );
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "No Booking Found" },
        { status: 404 },
      );
    }

    //ab hamare paas booking hai toh ham booking status ko confirm kardenge*
    booking.bookingStatus = "confirmed";
    booking.paymentStatus = "cash";

    await booking.save();

    return NextResponse.json(
      { success: true, booking },
      { status: 200 },
    );
  } catch (error) {
    console.error("Cash payment confirmation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Cash payment error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};
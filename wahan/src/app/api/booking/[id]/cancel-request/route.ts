import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorize access denied" },
        { status: 400 },
      );
    }

    const id=(await context.params).id

    const user = await User.findById(session?.user.id);

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json(
        { message: "No requested Booking found" },
        { status: 400 },
      );
    }

    booking.bookingStatus = "cancelled";
    booking.save();

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    console.log(`cancelling request error ${error}`);
    return NextResponse.json(
      { message: "cancelling request error", error },
      { status: 500 },
    );
  }
};

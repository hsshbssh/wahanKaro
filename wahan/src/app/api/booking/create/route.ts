import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import axios from "axios";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    //session check krte h taki pta chale ki woh authenticated hai ya nahi
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized access denied." },
        { status: 400 },
      );
    }

    const {
      driverId,
      vehicleId,
      pickUpLocation,
      dropLocation,
      pickUpAddress,
      dropAddress,
      fare,
      mobileNumber,
    } = await req.json();

    if (
      !driverId ||
      !vehicleId ||
      !pickUpLocation?.coordinates ||
      !dropLocation?.coordinates ||
      !pickUpAddress ||
      !dropAddress ||
      fare === undefined ||
      fare === null ||
      !mobileNumber
    ) {
      return NextResponse.json(
        { message: "missing required details" },
        { status: 400 },
      );
    }
    //finding driver
    const driver = await User.findById(driverId);
    if (!driver) {
      return NextResponse.json({ message: "No driver found" }, { status: 400 });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return NextResponse.json({ message: "No vehicle found" }, { status: 400 });
    }

    //agar user ki pehle se koi booking exist krti hai toh bhi error do taaki pehle uski ek booking complete ho then woh doosri kar paaye

    const existingBooking = await Booking.findOne({
      user: session.user.id,
      bookingStatus: {
        $in: ["requested", "awaiting-payment", "confirmed", "started"],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        existingBooking, //agr booking hai pehle se toh wohi booking bhej denge ham
      );
    }

    const booking = await Booking.create({
      user:session.user.id,
      driver: driver._id,
      vehicle: vehicle._id,

      pickUpAddress,
      dropAddress,

      pickUpLocation,
      dropLocation,

      fare,

      userMobile: mobileNumber,
      driverMobile: driver.mobile,

      bookingStatus: "requested",
    });
    
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
        event: "new-booking",
        userId: driverId,
        data: booking,
      });
    } catch (error) {
      console.error("BOOKING NOTIFICATION ERROR:", error);
    }

    return NextResponse.json(
      booking,
      { status: 200 },
    );
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

  return NextResponse.json(
    { message: `create Booking error ${error}` },
    { status: 500 }
  );
  }
};

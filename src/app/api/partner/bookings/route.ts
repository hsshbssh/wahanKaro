import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import Vehicle from "@/model/vehicle.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorised access denied." },
        { status: 400 },
      );
    }

    // Booking aur Vehicle dono mein _id ObjectId hai; isi matching reference se
    // populate vehicle document ko response mein include karta hai.
    const bookings = await Booking.find({ driver: session.user.id })
      .populate("user driver vehicle")
      .sort({ createdAt: -1 });

      //ye neeche joh bhi extra kaam hua hai woh isliye hua hai kyunki pehle hamare paas vehicle null aarhi thi booking ke andr toh ye sab krne ke baad ab null nahi aarhi hai
      //humne kiya ye hai ki jinki booking milgyi pehle hi populate krne pe toh ye logic mein se return booking ke through hum return kr jaaenge aur jinki vehicle null aarhi hai unke liye specificaaly vehicle find ki jaaegi

    const bookingsWithVehicle = await Promise.all(
      bookings.map(async (booking) => {
        if (booking.vehicle) {
          return booking;
        }

        // Legacy bookings may contain a reference whose BSON type differs from
        // the vehicle _id type, so regular populate cannot resolve the vehicle.
        const vehicleId = booking.get("vehicle");
        if (!vehicleId) {
          return booking;
        }

        const vehicle = await Vehicle.collection.findOne({
          $expr: { $eq: [{ $toString: "$_id" }, String(vehicleId)] },
        });

        if (vehicle) {
          booking.set("vehicle", vehicle);
        }
        return booking;
      }),
    );

    return NextResponse.json(
      { success: true, bookings: bookingsWithVehicle },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `get partner bookings error ${error}` },
      { status: 500 },
    );
  }
};

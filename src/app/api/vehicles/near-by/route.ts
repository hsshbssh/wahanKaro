import connectDb from "@/lib/db";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

//toh iske andr ye hoga basically
//ham frontend se pickupLong aur pickupLat leke aayenge jisse hum uss particular lng aur lat ke 5 km ke range ke andr joh vehicles available honge woh show kra denge
//aur saath mein vehicle ka type bhi leke aayenge taaki hum pata laga paaye ki kiss type k vehicle show krani hai

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();
    const { pickupLat, pickupLong, vehicleType } = await req.json();
    if (!pickupLat || !pickupLong || !vehicleType) {
      return NextResponse.json(
        { message: "All details are necessary" },
        { status: 400 },
      );
    }

    //ab hume woh partner database se leke aane hai jinka role partner ho aur isOnline true ho aur partnerStatus approved ho, saath mein location coordinates ke 5 km ke andr

    const partner = await User.find({
      role: "partner",
      isOnline: true,
      partnerStatus: "approved",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [pickupLong, pickupLat],
          },
          $maxDistance: 5000, //mtlb 5 km ki range ke andr ho
        },
      },
    });
    const partnerIds = partner.map((p) => p._id);

    if (partnerIds.length === 0) {
      return NextResponse.json(
        { message: "No vehicles found" },
        { status: 400 },
      );
    }

    const vehicles = await Vehicle.find({
      owner: { $in: partnerIds },
      type: vehicleType,
      status: "approved",
    }).lean();

    return NextResponse.json(vehicles, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "nearBy vehicles error", error },
      { status: 500 },
    );
  }
};

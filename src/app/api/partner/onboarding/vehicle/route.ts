import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

//ab vehicleNumber kuch bhi toh nahi hoskta hai toh ham ek regular epression denge vehicle number ka ki ye number issi type ka hona chaiye

const VEHICLE_REG_EXP = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 400 },
      );
    }

    // ✅ findOne use karo email ke liye
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "No user found" }, { status: 400 });
    }

    let { type, vehicleNumber, vehicleModel } = await req.json();

    if (!type || !vehicleNumber || !vehicleModel) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    vehicleNumber = vehicleNumber.toUpperCase();

    if (!VEHICLE_REG_EXP.test(vehicleNumber)) {
      return NextResponse.json(
        { message: "Invalid vehicle number format" },
        { status: 400 },
      );
    }

    //flow aisa hoga kuch

    //sabse pehle vehicle ko find krenge ki joh current logged in user hai usse koi vehcle registered hai ya nahi agr hai toh ussi mein updation hoga aur nhi hai toh uss owner ke naam pe vehicle register hojaayegi

    const vehicle = await Vehicle.findOne({ owner: user._id });

    if (vehicle) {
      // Approved partner agar apni vehicle details change karta hai
      // toh usko dobara admin review ke liye bhejna hai
      if (
        user.partnerStatus === "approved" ||
        user.partnerStatus === "rejected"
      ) {
        user.partnerStatus = "pending";
        user.videoKycStatus="pending"
        user.partnerOnBoardingSteps = 3;
      }

      vehicle.type = type;
      vehicle.vehicleNumber = vehicleNumber;
      vehicle.vehicleModel = vehicleModel;
      vehicle.status = "pending"; //abhi vehicle register nhi hui hai toh status initially pending hi hoga

      await vehicle.save();
      await user.save();

      return NextResponse.json(vehicle, { status: 200 });
    }

    // ek aur check lagana hai ki agar humbne joh vehicle number enter kiya hai ki kahi woh pehle se hi toh nhi exist krta hai aur agr haa toh error do

    //ye duplicate wala create hone se just pehle likhna hoga otherwise updat nhi hoga
    const duplicate = await Vehicle.findOne({ vehicleNumber });

    if (duplicate) {
      return NextResponse.json(
        { message: "Vehicle number already exists" },
        { status: 400 },
      );
    }

    // ✅ create ke time owner assign karo
    const newVehicle = await Vehicle.create({
      type,
      vehicleNumber,
      vehicleModel,
      owner: user._id,
    });

    //ab hume partnerOnBoardingSteps ko increase bhi krna hai isliye ye kiya
    if (user.partnerOnBoardingSteps < 1) {
      user.partnerOnBoardingSteps = 1;
    }

    //mtlb partner ke bank dets mein koi change hon toh wapis se status pending krdo taaki wapis admin ke paas review ke liye chala jaaye
    user.partnerStatus = "pending";

    //jaise hi 1st step complete hoga waise hi user se partner bana denge hum apne user ko
    await user.save();

    return NextResponse.json(newVehicle, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `vehicle error ${error}` },
      { status: 500 },
    ); // ✅ error pe 500
  }
};

//ab humne vehicle ki details fill karne ke liye api toh bna li but ab mein chahta hu ki jab mein waapis vehicle page pe aau toh joh meine details fill kri thi toh woh already waha filled mile toh iske liye ham ek aur api bnayenge getApi joh ki page load hone pe khud chalgi aur agr details h hamare paas toh usme laake automatically fill krdegi

export const GET = async (req: NextRequest) => {
  try {
    await connectDb();

    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 400 },
      );
    }

    // ✅ findOne use karo email ke liye
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "No user found" }, { status: 400 });
    }

    const vehicle = await Vehicle.findOne({ owner: user._id });

    if (vehicle) {
      return NextResponse.json(
        { message: "vehicle data fetched successfully", vehicle },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { message: "Vehicle data not found", vehicle: null },
        { status: 200 },
      );
    }
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "vehicle data fetched unsuccessfull", error },
      { status: 500 },
    );
  }
};

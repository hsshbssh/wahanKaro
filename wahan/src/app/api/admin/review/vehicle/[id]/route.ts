import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) {
      return NextResponse.json(
        { message: "unauthorized access denied" },
        { status: 400 },
      );
    }

    await connectDb();

    const vehicleId = (await context.params).id;//abki joh hame params se id milegi woh vehicle ki id hogi

    if (!vehicleId) {
      return NextResponse.json(
        { message: "vehicle ID is required" },
        { status: 400 },
      );
    }
    const vehicle = await Vehicle.findById(vehicleId).populate("owner");//isse hame vehicle mein hi user ki bhi details mil jaaegi

    if (!vehicle) {
      return NextResponse.json(
        { message: "vehicle not found" },
        { status: 400 },
      );
    }

    return NextResponse.json(
        vehicle,
        {status:200}
    )

  } catch (error) {
    console.log('getting vehicle details error',error)
    return NextResponse.json(
        {message:'Vehicle details not found'},
        {status:500}
    )
  }
};

export const PATCH=async(req:NextRequest,context:{params:Promise<{id:String}>})=>{
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) {
      return NextResponse.json(
        { message: "unauthorized access denied" },
        { status: 400 },
      );
    }

    await connectDb();

    const vehicleId = (await context.params).id;//abki joh hame params se id milegi woh vehicle ki id hogi

    if (!vehicleId) {
      return NextResponse.json(
        { message: "vehicle ID is required" },
        { status: 400 },
      );
    }

    // ab partner find krenge iss partner id se
    const vehicle = await Vehicle.findById(vehicleId).populate("owner");//isse hame vehicle mein hi user ki bhi details mil jaaegi

    if (!vehicle) {
      return NextResponse.json(
        { message: "partner not found" },
        { status: 400 },
      );
    }

    const {status,reason}=await req.json()
    if(status!=="approved" && status!=="rejected"){
      return NextResponse.json(
        {message:"Invalid status"},
        {status:400}
      )
    }

    if(status==="approved"){
      vehicle.status=status
      vehicle.rejectionReason=undefined
      vehicle.owner.partnerOnBoardingSteps=7
    }

    if(status==="rejected"){
      vehicle.status=status
      vehicle.rejectionReason=reason
      vehicle.owner.partnerOnBoardingSteps=6
    }

    await vehicle.owner.save();
    await vehicle.save()
    return NextResponse.json(
      {message: `Partner ${status} successfully`},
      {status:200}
    )
  } catch (error) {
    return NextResponse.json(
      {message:'vehicle status updation error',error},
      {status:500}
    )
  }
}

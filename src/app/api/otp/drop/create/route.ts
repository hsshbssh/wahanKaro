import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"
import Booking from "@/model/booking.model";

export const POST = async (req:NextRequest) => {
  try {
    await connectDb()
    const {bookingId}=await req.json()
    //sabse pehele otp generate krwaya hai
    const dropOtp=crypto.randomInt(100000,1000000).toString()

    //ab iss generated otp ko hash krwao
    const hashedOtp=crypto.createHmac("sha256",process.env.OTP_SECRET!).update(dropOtp).digest("hex")
    const expiresIn=new Date(Date.now() + 5*60*1000)
    //ab booking ke andr isse store kradenge
    const booking=await Booking.findByIdAndUpdate(
        {bookingId},
        {dropOtp:hashedOtp},
        {dropOtpExpires:expiresIn}
    )

    if(!booking){
        return NextResponse.json(
            {success:false,message:"No Booking found."},
            {status:400}
        )
    }
    return NextResponse.json(
        {success:true,dropOtp},
        {status:200}
    )
  } catch (error) {
    return NextResponse.json(
        {success:false,message:`PickUp Otp create error ${error}`},
        {status:500}
    )
  }
};

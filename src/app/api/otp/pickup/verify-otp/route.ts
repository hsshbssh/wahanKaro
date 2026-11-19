import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"

export const POST=async(req:NextRequest)=>{
    try {
        await connectDb()
        const {bookingId,driverEnteredPickUpOtp}=await req.json()
        const booking=await Booking.findById(bookingId)
        if(!booking){
            return NextResponse.json(
                {success:false,message:"Booking not found."},
                {status:500}
            )
        }

        const hashedDriverEnteredPickUpOtp= crypto.createHmac("sha256",process.env.OTP_SECRET!).update(driverEnteredPickUpOtp).digest("hex")

        if(booking.pickUpOtpExpires < Date.now()){
            return NextResponse.json(
                {success:false,message:"PickUp Otp expired."},
                {status:400}
            )
        }
        if(booking.pickUpOtp===hashedDriverEnteredPickUpOtp){
            booking.bookingStatus="started"
        }
        await booking.save()
        return NextResponse.json(
            {success:true,message:"PickUp Otp verified successfully"},
            {status:200}
        )
        
    } catch (error) {
        return NextResponse.json(
            {success:false,message:`PickUp Otp verification error ${error}`},
            {status:500}
        )
    }
}
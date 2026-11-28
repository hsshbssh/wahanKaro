import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET=async(req:NextRequest)=>{
    try {
        await connectDb()
        const session=await getServerSession(authOptions)
        if(!session){
            return NextResponse.json(
                {success:false,message:"Unauthorised access denied."},
                {status:400}
            )
        }

        const activeBookings=await Booking.find({
            driver:session.user.id,
            bookingStatus:{$in:["confirmed","started"]}
        }).populate("user driver vehicle")
        if(activeBookings.length===0){
            return NextResponse.json(
                {success:true,message:"No active bookings found"}
            )
        }

        return NextResponse.json(
            {success:true,activeBookings},
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {success:false,message:`Fetch active-bookings error ${error}`},
            {status:500}
        )
    }
}
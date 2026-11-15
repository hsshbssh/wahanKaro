import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET=async(req:NextRequest)=>{
    try {
        await connectDb()
        const session=await getServerSession(authOptions)
        if(!session){
            return NextResponse.json(
                {message:"Unauthorised access denied"},
                {status:400}
            )
        }

        const partner=await User.findById(session.user.id)
        if(!partner){
            return NextResponse.json(
                {message:"partner not found"},
                {status:200}
            )
        }

        const pendingBookingDocs=await Booking.find({
            driver:partner._id,
            bookingStatus:"requested"
        })
        if(!pendingBookingDocs){
            return NextResponse.json(
                {message:"No pending Bookings available"},
                {status:200}
            )
        }
        return NextResponse.json(
            pendingBookingDocs,
            {status:200}
        )
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {message:"pending bookings docs error",error},
            {status:500}
        )
    }
}
import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST=async(req:NextRequest)=>{
    try {
        await connectDb()
        const {bookingId}=await req.json()
        const session=await getServerSession(authOptions)
        if(!session){
            return NextResponse.json(
                {success:false,message:"Unauthorised access denied."},
                {status:400}
            )
        }
        if(typeof bookingId!=="string" || !bookingId){
            return NextResponse.json(
                {success:false,message:"A valid booking ID is required."},
                {status:400}
            )
        }

        const booking=await Booking.findOne({
            _id:bookingId,
            user:session.user.id
        }).populate("user driver vehicle")

        return NextResponse.json(
            {success:true,activeBookings:booking ? [booking] : []},
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {success:false,message:`Fetch active-user-bookings error ${error}`},
            {status:500}
        )
    }
}
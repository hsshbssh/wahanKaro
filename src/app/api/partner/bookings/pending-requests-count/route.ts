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

        // const Bookings=await Booking.find({ find nahi krenge kyunki ye complete docs dedega instead hum count docuents krenge
        //     bookingStatus:"requested",
        //     paymentStatus:"pending"
        // })

        const Bookings=await Booking.countDocuments({
            driver:partner._id,
            bookingStatus:"requested",
        })

        if(!Bookings){
            return NextResponse.json(
                {message:"No Pending Requests available"},
                {status:400}
            )
        }

        return NextResponse.json(
            Bookings,
            {status:200}
        )
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {message:"Get pending requests error"},
            {status:500}
        )
    }
}
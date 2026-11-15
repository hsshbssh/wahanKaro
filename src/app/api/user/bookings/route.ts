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
                {success:false, message:"Unauthorised aceess denied."},
                {status:400}
            )
        }

        const bookings=await Booking.find({user:session.user.id}).populate("user vehicle driver").sort({createdAt:-1})

        if(!bookings){
            return NextResponse.json(
                {success:false, message:"no bookings with current user found."}
            )
        }

        return NextResponse.json(
            {success:true, message:"User Bookings fetched successfully.",bookings},
            {status:200}
        )

    } catch (error) {
        return NextResponse.json(
            {success:false, message:`User Bookings fetching error ${error}.`},
            {status:500}
        )
    }
}
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
            {booking:null}
        }

        const user=await User.findById(session?.user.id)
        
        const booking=await Booking.findOne({
            user:user._id,
            bookingStatus:{$in:["requested","awaiting-payment","confirmed","started"]}
        })

        if(!booking){
            return NextResponse.json(
                {booking:"idle"}//agr hamare paas koi booking nahi hai toh stauts idle krdo ab jaake ek baar jaha status set krrha hai api mein waha bhi dekhle
            )
        }

        return NextResponse.json(
            {booking}
        )
    } catch (error) {
        console.log('get active booking status error',error)
        return NextResponse.json(
            {message:"get active booking status error",error},
            {status:500}
        )
    }
}
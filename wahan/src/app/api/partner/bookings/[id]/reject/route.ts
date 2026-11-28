import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


export const POST=async(
    req:NextRequest,
    context:{params:Promise<{id:string}>}
)=>{
    try {
        const id=(await context.params).id
        await connectDb()

        const booking=await Booking.findById(id)
        if(!booking || booking.bookingStatus!=="requested"){
            return NextResponse.json(
                {message:"Invalid Booking"},
                {status:400}
            )
        }

        booking.bookingStatus="rejected"
        await booking.save()

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
                event: "reject-booking",
                userId: booking.user.toString(),
                data: booking.bookingStatus,
            })
        } catch (error) {
            console.error("REJECT BOOKING NOTIFICATION ERROR:", error)
        }

        return NextResponse.json(
            {message:'booking rejected successfully'},
            {status:200}
        )

    } catch (error) {
        return NextResponse.json(
            {message:"reject booking error",error},
            {status:500}
        )
    }
}
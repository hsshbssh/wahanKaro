import connectDb from "@/lib/db"
import ChatMessage from "@/model/chat.model"
import { NextRequest, NextResponse } from "next/server"

export const GET=async(req:NextRequest)=>{
    try {
        await connectDb()
        const {bookingId}=await req.json()
        const messages=await ChatMessage.find({bookingId}).sort({createdAt:-1}) //saare messages find kro iss particcular bookingId se {aur createdAt -1 ka mtlb hai ki sbse naye messages ko sabse upr sort krdo}

        if(messages){
            return NextResponse.json(
                messages,
                {status:200}
            )
        }
    } catch (error) {
        return NextResponse.json(
                {message:`get-all messages error ${error}`},
                {status:500}
            )
    }
}
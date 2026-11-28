import connectDb from "@/lib/db";
import ChatMessage from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";

export const POST=async(req:NextRequest)=>{
    try {
        await connectDb()
        const {bookingId,sender,text}=await req.json()
        const message=await ChatMessage.create({
            bookingId,sender,text
        })
        if(message){
            return NextResponse.json(
                message,
                {status:200}
            )
        }
    } catch (error) {
        console.log(`send message error ${error}`)
        return NextResponse.json(
            {message:`send chat error ${error}`},
            {status:500}
        )
    }
}
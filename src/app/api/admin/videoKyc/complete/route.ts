import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST=async(req:NextRequest)=>{
    try {
        await connectDb()
        const session=await getServerSession(authOptions)
        if(!session){
            return NextResponse.json(
                {message:'Unauthorised access denied'},
                {status:400}
            )
        }

        const {roomId,action,reason}=await req.json()
        if(!roomId){
            return NextResponse.json(
                {message:'RoomId not found'},
                {status:400}
            )
        }

        if(!["approved","rejected"].includes(action)){
            return NextResponse.json(
                {message:'Invalid action status'},
                {status:400}
            )
        }

        const partner=await User.findOne({
            videokycRoomId:roomId,//iss room id mein jiska role partner hai usko le aao
            role:"partner"
        })
        if(!partner){
            return NextResponse.json(
                {message:'Partner not found'},
                {status:400}
            )
        }

        if(action==="approved"){
            partner.videoKycStatus="approved"
            partner.videoKycRejectionReason=undefined
            partner.partnerOnBoardingSteps=5
        }
        if(action==="rejected"){
            if(!reason){
                return NextResponse.json(
                {message:'Rejection reason is required'},
                {status:400}
            )
            }
            partner.videoKycStatus="rejected"
            partner.videoKycRejectionReason=reason.trim()
            partner.partnerOnBoardingSteps=4
        }

        await partner.save()

        return NextResponse.json(
            {status:partner.videoKycStatus},
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:'kyc complete error',error},
            {status:500}
        )
    }
}
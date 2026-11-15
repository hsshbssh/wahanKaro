import connectDb from "@/lib/db";
import User from "@/model/user.model";
import { NextRequest, NextResponse } from "next/server";

export const POST=async(req:NextRequest)=>{
    try {
        await connectDb()
        const {email,otp}=await req.json()
        if(!email || !otp){
            return NextResponse.json(
                {message:'email and otp is required'},
                {status:400}
            )
        }
        let user=await User.findOne({email})
        if(!user){
            return NextResponse.json(
                {message:'user not found'},
                {status:400}
            )
        }
        if(user.isEmailVerified){
            return NextResponse.json(
                {message:'Email is already verified'},
                {status:400}
            )
        }
        if(!user.otpExpiresIn || user.otpExpiresIn< new Date()){
            return NextResponse.json(
                {message:'otp has been expired'},
                {status:400}
            )
        }
        if(!user.otp || user.otp!=otp){
            return NextResponse.json(
                {message:'Invalid otp'},
                {status:400}
            )
        }

        user.isEmailVerified=true
        user.otp=undefined
        user.otpExpiresIn=undefined

        await user.save()

        return NextResponse.json(
            {message:'email is verified'},
            {status:200}
        )

    } catch (error) {
        return NextResponse.json(
            {message:`Verify email error ${error}`},
            {status:500}
        )
    }
}

//iske baad jaake verify otp ke andr isko fetch krle
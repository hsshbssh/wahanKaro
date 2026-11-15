import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Booking from "@/model/booking.model";

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();
    const {
      bookingId,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_order_id,
    } = await req.json();
    //ye kuch procedure hai joh hume follow krne hote hai
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    //ab ye joh hamare paas signature aaya hai ye agr hamare razorpay_signature ke equal hai toh hamari payment verified kehlaegi

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({
        success: false,
        message: "Invalid Signature.",
      });
    }

    //ab agr payment verify hogyi toh ab hum apni booking_id se booking ko find krenge
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: "No Booking Found" },{status:400});
    }

    //ab hamare paas booking hai toh ham booking status ko confirm kardenge
    booking.bookingStatus="confirmed"
    booking.paymentStatus="paid"

    //hame partnerAmout aur adminCommision bhi assign krne hai
    const adminCommision=booking.fare*0.10 //10% jaaega admin ke paas
    const partnerAmount=booking.fare-adminCommision

    booking.adminCommision=adminCommision
    booking.partnerAmount=partnerAmount
    await booking.save()

    return NextResponse.json(
        {success:true,adminCommision,partnerAmount},
        {status:200}
    )
  } catch (error) {
    return NextResponse.json(
        {success:false,message:"payment verification error"},
        {status:500}
    )
  }
};

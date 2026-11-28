import connectDb from "@/lib/db";
import { sendEmail } from "@/lib/sendMail";
import User from "@/model/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    // Frontend se name, email aur password le rahe hain
    const { name, email, password } = await req.json();

    // Check kar rahe hain ki koi bhi required field empty toh nahi hai
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Password kam se kam 6 characters ka hona chahiye
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    // Database se connection establish kar rahe hain
    await connectDb();

    // 6 digit ka random OTP generate kar rahe hain
    // toString() isliye lagaya hai taaki OTP string format mein save ho
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP ki expiry time set kar rahe hain
    // Current time ke 10 minutes baad OTP expire ho jayega
    const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000);

    // Password ko database mein save karne se pehle hash kar rahe hain
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check kar rahe hain ki is email se pehle se koi user exist karta hai ya nahi
    let user = await User.findOne({ email });

    // Agar user exist karta hai aur uska email already verified hai
    // toh same email se dobara account create nahi karna
    if (user && user.isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists with same email",
        },
        { status: 400 }
      );
    }

    // Agar user exist karta hai lekin uska email verify nahi hua hai
    // toh naya user create karne ke bajaye existing user ko update karenge
    if (user && !user.isEmailVerified) {
      user.name = name;

      // Password ko plain text mein save nahi karna
      // hashed password ko save karna hai
      user.password = hashedPassword;

      // Naya OTP existing user ke saath update kar rahe hain
      user.otp = otp;

      // OTP ki expiry time bhi update kar rahe hain
      user.otpExpiresIn = otpExpiresIn;

      // User mein changes karne ke baad database mein save kar rahe hain
      await user.save();
    } else {
      // Agar user exist hi nahi karta
      // toh naya user create karenge
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiresIn,

        // Starting mein email verified nahi hai
        isEmailVerified: false,
      });
    }

    // User ke email par OTP send kar rahe hain
    await sendEmail(
      email,
      "Your OTP for email verification",
      `<h2>Your email verification OTP is <strong>${otp}</strong></h2>`
    );

    // OTP successfully send hone ke baad response bhej rahe hain
    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    // Agar code mein kahin bhi error aata hai toh console mein error print karenge
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "User creation unsuccessful",
      },
      { status: 500 }
    );
  }
};
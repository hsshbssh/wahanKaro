import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import PartnerBankDocs from "@/model/partnerBank.model";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const IFSC_REG_EXP = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized access denied." },
        { status: 400 },
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400 },
      );
    }

    let {
      accountHolder,
      accountNumber,
      mobile,
      ifsc,
      upi = null,
    } = await req.json();

    if (!accountHolder || accountNumber === null || !mobile || !ifsc) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    ifsc = ifsc.toUpperCase();

    if (!IFSC_REG_EXP.test(ifsc)) {
      return NextResponse.json(
        { message: "Invalid IFSC Format" },
        { status: 400 },
      );
    }

    const isNameValid = accountHolder.trim().length >= 3;
    const isAccountValid = accountNumber.trim().length >= 9;
    const isMobileValid = mobile.trim().length === 10;

    if (!isNameValid) {
      return NextResponse.json(
        { message: "Name should be more than 2 characters" },
        { status: 400 },
      );
    }

    if (!isAccountValid) {
      return NextResponse.json(
        {
          message:
            "Account number should be equal or more than 9 digits",
        },
        { status: 400 },
      );
    }

    if (!isMobileValid) {
      return NextResponse.json(
        {
          message: "Mobile number should be equal to 10 digits",
        },
        { status: 400 },
      );
    }

    const duplicate = await PartnerBankDocs.findOne({
      ifsc,
      accountNumber,
      owner: { $ne: user._id },//Ab duplicate tabhi mana jayega jab kisi doosre partner ka same bank account ho.
    });

    if (duplicate) {
      return NextResponse.json(
        { message: "Following Credentials already exist" },
        { status: 400 },
      );
    }

    user.mobile = mobile; //user ke andr mobile number dalwa diya

    if (user.partnerOnBoardingSteps < 3) {
      user.partnerOnBoardingSteps = 3;
    }

    if (user.partnerOnBoardingSteps === 3) {
      user.role = "partner";
    }

    //mtlb partner ke bank dets mein koi change hon toh wapis se status pending krdo taaki wapis admin ke paas review ke liye chala jaaye
    if (user.partnerStatus === "approved" || user.partnerStatus==="rejected") {
      user.partnerStatus = "pending";
      user.videoKycStatus="pending"
      user.partnerOnBoardingSteps = 3;
    }

    await user.save();

    const bankRecs = await PartnerBankDocs.findOne({
      owner: user._id,
    });

    if (bankRecs) {
      bankRecs.accountHolder = accountHolder;
      bankRecs.accountNumber = accountNumber;
      bankRecs.ifsc = ifsc;
      bankRecs.upi = upi;

      // Existing approved bank details change hone ke baad
      // bank ko dobara admin verification ke liye bhejna hai
      if (bankRecs.status === "verified") {
        bankRecs.status = "added";
      }

      await bankRecs.save();

      return NextResponse.json(
        {
          message: "Bank details updated successfully",
          bankRecs,
        },
        { status: 200 },
      );
    } else {
      const newBankRecs = await PartnerBankDocs.create({
        owner: user._id,
        accountHolder,
        accountNumber,
        ifsc,
        upi,
        status: "added",
      });

      if (newBankRecs) {
        return NextResponse.json(
          {
            message: "Bank details stored successfully",
            newBankRecs,
          },
          { status: 201 },
        );
      }
    }

    return NextResponse.json(
      { message: "Bank details operation failed" },
      { status: 500 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Bank details error", error },
      { status: 500 },
    );
  }
};

//ab iski get api bhi banani hogi

export const GET = async (req: NextRequest) => {
  try {
    await connectDb();

    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized access denied." },
        { status: 400 },
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400 },
      );
    }

    const bankRecs = await PartnerBankDocs.findOne({
      owner: user._id,
    });

    if (bankRecs) {
      return NextResponse.json(
        {
          message: "bank records fetched successfully",
          bankRecs,
          mobileNumber: user.mobile,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        message: "Bank records not found",
        bankRecs: null,
        mobileNumber: user.mobile || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Bank details fetching error", error },
      { status: 500 },
    );
  }
};
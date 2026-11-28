import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import PartnerBankDocs from "@/model/partnerBank.model";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const IFSC_REG_EXP = /^[A-Z]{4}0[A-Z0-9]{6}$/;
type BankField = "accountHolder" | "accountNumber" | "mobile" | "ifsc" | "upi";
type DuplicateBankField = "accountNumber" | "ifsc" | "upi";

const DUPLICATE_MESSAGES: Record<DuplicateBankField, string> = {
  accountNumber: "Account number already exists.",
  ifsc: "IFSC code is already in use.",
  upi: "UPI ID is already in use.",
};

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
      upi,
    } = await req.json();

    const errors: Partial<Record<BankField, string>> = {};
    if (typeof accountHolder !== "string" || !accountHolder.trim()) {
      errors.accountHolder = "Account holder name is required.";
    }
    if (typeof accountNumber !== "string" || !accountNumber.trim()) {
      errors.accountNumber = "Account number is required.";
    }
    if (typeof mobile !== "string" || !mobile.trim()) {
      errors.mobile = "Mobile number is required.";
    }
    if (typeof ifsc !== "string" || !ifsc.trim()) {
      errors.ifsc = "IFSC code is required.";
    }
    if (typeof upi !== "string" || !upi.trim()) {
      errors.upi = "UPI ID is required.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { message: "Please correct the highlighted fields.", errors },
        { status: 400 },
      );
    }

    accountHolder = accountHolder.trim();
    accountNumber = accountNumber.trim();
    mobile = mobile.trim();
    upi = upi.trim();
    ifsc = ifsc.trim().toUpperCase();

    if (!IFSC_REG_EXP.test(ifsc)) {
      return NextResponse.json(
        {
          message: "Please correct the highlighted field.",
          errors: { ifsc: "Invalid IFSC format. Example: HDFC0001234." },
        },
        { status: 400 },
      );
    }

    if (accountHolder.length < 3) {
      errors.accountHolder = "Name must be at least 3 characters.";
    }
    if (accountNumber.length < 9) {
      errors.accountNumber = "Account number must be at least 9 digits.";
    }
    if (!/^\d{10}$/.test(mobile)) {
      errors.mobile = "Mobile number must be exactly 10 digits.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { message: "Please correct the highlighted fields.", errors },
        { status: 400 },
      );
    }

    const [duplicateAccount, duplicateIfsc, duplicateUpi] = await Promise.all([
      PartnerBankDocs.exists({
        accountNumber,
        owner: { $ne: user._id },
      }),
      PartnerBankDocs.exists({
        ifsc,
        owner: { $ne: user._id },
      }),
      PartnerBankDocs.exists({
        upi,
        owner: { $ne: user._id },
      }),
    ]);

    if (duplicateAccount) {
      errors.accountNumber = DUPLICATE_MESSAGES.accountNumber;
    }
    if (duplicateIfsc) {
      errors.ifsc = DUPLICATE_MESSAGES.ifsc;
    }
    if (duplicateUpi) {
      errors.upi = DUPLICATE_MESSAGES.upi;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { message: "Some bank details are already in use.", errors },
        { status: 409 },
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
    console.error("BANK DETAILS SAVE ERROR:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      const duplicateField = (
        ["accountNumber", "ifsc", "upi"] as const
      ).find(
        (field) =>
          ("keyPattern" in error &&
            typeof error.keyPattern === "object" &&
            error.keyPattern !== null &&
            field in error.keyPattern) ||
          ("keyValue" in error &&
            typeof error.keyValue === "object" &&
            error.keyValue !== null &&
            field in error.keyValue),
      );

      if (duplicateField) {
        const message = DUPLICATE_MESSAGES[duplicateField];
        return NextResponse.json(
          {
            message: "Some bank details are already in use.",
            errors: { [duplicateField]: message },
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { message: "Unable to save bank details. Please try again." },
      { status: 500 },
    );
  }
};

//ab iski get api bhi banani hogi

export const GET = async () => {
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
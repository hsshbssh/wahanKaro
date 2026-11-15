import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorised access denied" },
        { status: 400 },
      );
    }

    await connectDb();

    const partner = await User.find({
      role: "partner",
      partnerStatus: "approved", //jab partner status ho tabhi pending kyc mein woh partner field aaye
      videoKycStatus: { $in: ["pending", "in_progress"] },
    });

    if (partner.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const pendingKycPartners = partner.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      email: p.email,
      videoKycStatus: p.videoKycStatus,
      videokycRoomId: p.videokycRoomId,
    }));

    return NextResponse.json(pendingKycPartners, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Video Kyc pending get Error", error },
      { status: 500 },
    );
  }
};

// ab chalke iss ko fetch kr admin dashboard mein

//ab patch api banayenge jisse start kyc click pe videokycstatus in_progress hojaaye

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: String }> },
) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorised access denied" },
        { status: 400 },
      );
    }

    const partnerId = (await context.params).id;
    const { status } = await req.json();

    await connectDb();

    const partner = await User.findById(partnerId);

    if (!partner) {
      return NextResponse.json(
        { message: "partner not found" },
        { status: 400 },
      );
    }

    if (status !== "in_progress") {
      return NextResponse.json(
        { message: "Invalid KYC status" },
        { status: 400 },
      );
    }

    partner.videoKycStatus = status;

    await partner.save();

    return NextResponse.json(partner, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Video KYC status update issue" },
      { status: 400 },
    );
  }
};
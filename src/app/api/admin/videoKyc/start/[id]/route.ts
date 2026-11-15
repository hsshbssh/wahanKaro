import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) {
      return NextResponse.json(
        { message: "unauthorized access denied" },
        { status: 400 },
      );
    }

    await connectDb();

    const partnerId = (await context.params).id;

    if (!partnerId) {
      return NextResponse.json(
        { message: "Partner ID is required" },
        { status: 400 },
      );
    }

    // ab partner find krenge iss partner id se
    const partner = await User.findById(partnerId);

    if (!partner || partner.role !== "partner") {
      return NextResponse.json(
        { message: "partner not found" },
        { status: 400 },
      );
    }

    const roomId =
      partner.videokycRoomId ||
      `kyc-${partnerId}-${Date.now()}`;

    partner.videokycRoomId = roomId;
    partner.videoKycStatus = "in_progress";

    await partner.save();

    return NextResponse.json(
      {
        success: true,
        roomId,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Video Kyc start failed", error },
      { status: 500 },
    );
  }
};
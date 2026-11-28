import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    await connectDb();

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    if (user.role !== "partner") {
      return NextResponse.json(
        {
          success: false,
          message: "Only partners can retry Video KYC",
        },
        {
          status: 403,
        }
      );
    }

    if (user.videoKycStatus !== "rejected") {
      return NextResponse.json(
        {
          success: false,
          message: "Video KYC is not rejected",
        },
        {
          status: 400,
        }
      );
    }

    if (!user.videokycRoomId) {
      return NextResponse.json(
        {
          success: false,
          message: "Video KYC Room ID not found",
        },
        {
          status: 400,
        }
      );
    }

    user.videoKycStatus = "in_progress";
    user.videoKycRejectionReason = "";

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Video KYC restarted successfully",
        roomId: user.videokycRoomId,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Retry Video KYC Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while restarting Video KYC",
      },
      {
        status: 500,
      }
    );
  }
};
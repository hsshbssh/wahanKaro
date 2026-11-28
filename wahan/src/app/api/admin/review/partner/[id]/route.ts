import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import PartnerBankDocs from "@/model/partnerBank.model";
import PartnerDocs from "@/model/partnerDocs.model";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
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

    const name = partner.name;
    const email = partner.email;

    // ye partner status hame kaam ayega jab hum iss api ko
    // fetch krenge apne partner dets page pe kyunki iski help se
    // mein vendor ko approve ya reject krskunga
    const partnerStatus = partner.partnerStatus;

    const vehicle = await Vehicle.findOne({
      owner: partnerId,
    });

    const document = await PartnerDocs.findOne({
      owner: partnerId,
    });

    const bank = await PartnerBankDocs.findOne({
      owner: partnerId,
    });

    return NextResponse.json(
      {
        vehicle: vehicle || null,
        document: document || null,
        bank: bank || null,
        name,
        email,
        partnerStatus,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("Partner Details fetching error", error);

    return NextResponse.json(
      {
        message: "Partner Details fetching error",
      },
      {
        status: 500,
      },
    );
  }
};

export const PATCH = async (
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

    const { status } = await req.json();

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { message: "Invalid partner status" },
        { status: 400 },
      );
    }

    const partnerId = (await context.params).id;

    if (!partnerId) {
      return NextResponse.json(
        { message: "Partner ID is required" },
        { status: 400 },
      );
    }

    await connectDb();

    const partner = await User.findById(partnerId);

    if (!partner || partner.role !== "partner") {
      return NextResponse.json(
        { message: "Partner Doesn't exist" },
        { status: 400 },
      );
    }

    /*
      Pehle saare partner documents find karenge.
      Uske baad hi database mein koi update karenge.
    */

    const partnerDocs = await PartnerDocs.findOne({
      owner: partnerId,
    });

    const partnerBankDocs = await PartnerBankDocs.findOne({
      owner: partnerId,
    });

    const partnerVehicle = await Vehicle.findOne({
      owner: partnerId,
    });

    /*
      Agar vendor ki required details complete nahi hain
      toh partner status bhi update nahi hoga.
    */

    if (!partnerBankDocs || !partnerDocs || !partnerVehicle) {
      return NextResponse.json(
        {
          message: "Fill All details first",
        },
        {
          status: 400,
        },
      );
    }

    /*
      Yahan status automatically decide hoga.

      Vendor APPROVED:
      Partner       -> approved
      Documents     -> approved
      Bank          -> verified
      Vehicle       -> approved

      Vendor REJECTED:
      Partner       -> rejected
      Documents     -> rejected
      Bank          -> rejected
      Vehicle       -> rejected
    */

    partner.partnerStatus = status;

    if (status === "approved") {
      partnerDocs.status = "approved";
      partnerBankDocs.status = "verified";
      partnerVehicle.status = "approved";
    } else {
      partnerDocs.status = "rejected";
      partnerBankDocs.status = "rejected";
      partnerVehicle.status = "rejected";
    }

    /*
      Partner onboarding complete tabhi hoga
      jab vendor approve hoga.
    */

    if (status === "approved") {
      partner.videoKycStatus="pending"
      partner.partnerOnBoardingSteps = 4;
    }

    /*
      Ab saare documents save karenge.
    */

    await partner.save();
    await partnerDocs.save();
    await partnerBankDocs.save();
    await partnerVehicle.save();

    return NextResponse.json(
      {
        message: `Partner ${status} successfully`,
        partnerStatus: partner.partnerStatus,
        partnerOnBoardingSteps: partner.partnerOnBoardingSteps,
        documentStatus: partnerDocs.status,
        bankStatus: partnerBankDocs.status,
        vehicleStatus: partnerVehicle.status,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("Partner status update error", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
};
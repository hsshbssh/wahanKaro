import authOptions from "@/lib/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    // =========================
    // Check user session
    // =========================
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorised access denied" },
        { status: 400 },
      );
    }

    await connectDb();

    // =========================
    // Find logged-in partner
    // =========================
    const partner = await User.findOne({
      email: session.user.email,
    });

    if (!partner) {
      return NextResponse.json(
        { message: "Partner not found" },
        { status: 400 },
      );
    }

    // =========================
    // Find partner's vehicle
    // =========================
    const vehicle = await Vehicle.findOne({
      owner: partner._id,
    });

    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 400 },
      );
    }

    // =========================
    // Get FormData
    // =========================
    const formData = await req.formData();

    const imageUrl = formData.get("imageUrl") as File | null;

    const baseFareValue = formData.get("baseFare");
    const pricePerKmValue = formData.get("pricePerKm");
    const waitingChargeValue = formData.get("waitingCharge");

    // =========================
    // Validate pricing fields
    // =========================

    // Check whether fields are present
    if (
      baseFareValue === null ||
      pricePerKmValue === null ||
      waitingChargeValue === null
    ) {
      return NextResponse.json(
        { message: "All pricing fields are required" },
        { status: 400 },
      );
    }

    // Convert FormData values into numbers
    const baseFare = Number(baseFareValue);
    const pricePerKm = Number(pricePerKmValue);
    const waitingCharge = Number(waitingChargeValue);

    // Check whether values are valid numbers
    if (
      !Number.isFinite(baseFare) ||
      !Number.isFinite(pricePerKm) ||
      !Number.isFinite(waitingCharge)
    ) {
      return NextResponse.json(
        { message: "Pricing values must be valid numbers" },
        { status: 400 },
      );
    }

    // =========================
    // Validate negative values
    // =========================
    if (baseFare < 0 || pricePerKm < 0 || waitingCharge < 0) {
      return NextResponse.json(
        { message: "Pricing values cannot be negative" },
        { status: 400 },
      );
    }

    // =========================
    // Upload image only if
    // a new image was provided
    // =========================
    if (imageUrl && imageUrl.size > 0) {
      // Check whether uploaded file is actually an image
      if (!imageUrl.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "Please upload an image file only" },
          { status: 400 },
        );
      }

      // Upload new image to Cloudinary
      const uploadImage = await uploadOnCloudinary(imageUrl);

      if (!uploadImage) {
        return NextResponse.json(
          { message: "Image upload failed" },
          { status: 400 },
        );
      }

      // Replace old image URL with new Cloudinary URL
      vehicle.imageUrl = uploadImage;
    }

    // =========================
    // Update pricing details
    // =========================
    vehicle.baseFare = baseFare;
    vehicle.pricePerKm = pricePerKm;
    vehicle.waitingCharge = waitingCharge;

    vehicle.status = "pending";
    vehicle.rejectionReason = undefined;
    await vehicle.save();

    // =========================
    // Pricing completed
    // Move onboarding to step 6
    // =========================
    partner.partnerOnBoardingSteps = 6;

    await partner.save();

    return NextResponse.json(
      {
        success: true,
        message: "Vehicle pricing updated successfully",
        vehicle,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Pricing API error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
};

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorised access denied" },
        { status: 400 },
      );
    }

    await connectDb();

    const partner = await User.findOne({
      email: session.user.email,
    });

    if (!partner) {
      return NextResponse.json(
        { message: "Partner not found" },
        { status: 400 },
      );
    }

    const vehicle = await Vehicle.findOne({
      owner: partner._id,
    });

    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 400 },
      );
    }

    let imageUrl=vehicle.imageUrl
    let baseFare=vehicle.baseFare
    let pricePerKm=vehicle.pricePerKm
    let waitingCharge=vehicle.waitingCharge

    return NextResponse.json(
        {
            imageUrl,
            baseFare,
            pricePerKm,
            waitingCharge
        },
        {status:200}
    )

  } catch (error) {
    console.log('Fetching pricing model error',error)
    return NextResponse.json(
        {message:'Get pricing model error'},
        {status:500}
    )
  }
};

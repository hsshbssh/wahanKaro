import authOptions from "@/lib/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import PartnerDocs from "@/model/partnerDocs.model";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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

    //ab hamari joh images aaegi frontend se woh hum json mein toh bhejenge nahi bali ham unhe formData mein bhejenge

    const formData = await req.formData();

    const aadhar = formData.get("aadhar") as Blob | null; //yha get ke andr woh likhte hai jiss name se tumne frontend se image bheji thi formData ke andr {aur blob mein isliye convert kiya kyunki ham cloudinary ke andr file ko as Blob store kra rahe hai}

    const vehicleRc = formData.get("vehicleRc") as Blob | null;

    const license = formData.get("license") as Blob | null;

    if (!aadhar || !vehicleRc || !license) {
      return NextResponse.json(
        { message: "All docs are required" },
        { status: 400 },
      );
    }

    const updatePayload: any = {
      status: "pending",
    };

    // Pehle: teeno files ek-ek karke upload hoti thi, isliye har upload ka wait hota tha.
    /*
    if (aadhar) {
      const url = await uploadOnCloudinary(aadhar);

      if (!url) {
        return NextResponse.json(
          { message: "aadhar upload failed" },
          { status: 500 },
        );
      }

      updatePayload.aadharUrl = url; //aadharUrl isliye kiya kyunki model mein humne aadharUrl hi declare kiya hai
    }

    if (vehicleRc) {
      const url = await uploadOnCloudinary(vehicleRc);

      if (!url) {
        return NextResponse.json(
          { message: "vehicleRc upload failed" },
          { status: 500 },
        );
      }

      updatePayload.rcUrl = url;
    }

    if (license) {
      const url = await uploadOnCloudinary(license);

      if (!url) {
        return NextResponse.json(
          { message: "license upload failed" },
          { status: 500 },
        );
      }

      updatePayload.licenseUrl = url; //aadharUrl isliye kiya kyunki model mein humne aadharUrl hi declare kiya hai
    }
    */

    // Baad mein: teeno files parallel upload hoti hain; aage badhne se pehle sabka result wait karte hain.
    const [aadharUrl, rcUrl, licenseUrl] = await Promise.all([
      uploadOnCloudinary(aadhar),
      uploadOnCloudinary(vehicleRc),
      uploadOnCloudinary(license),
    ]);

    if (!aadharUrl) {
      return NextResponse.json(
        { message: "aadhar upload failed" },
        { status: 500 },
      );
    }

    if (!rcUrl) {
      return NextResponse.json(
        { message: "vehicleRc upload failed" },
        { status: 500 },
      );
    }

    if (!licenseUrl) {
      return NextResponse.json(
        { message: "license upload failed" },
        { status: 500 },
      );
    }

    updatePayload.aadharUrl = aadharUrl;
    updatePayload.rcUrl = rcUrl;
    updatePayload.licenseUrl = licenseUrl;

    // ab in sbko database mein daaldenge

    const partnerDocs = await PartnerDocs.findOneAndUpdate(
      { owner: user._id },
      { $set: updatePayload },
      { upsert: true, new: true }, //agr nhi honge iss partner ke docs pehle se toh ye create krdega aur new true krne se hame hamesha naya data hi milega
    );

    //ab hume partnerOnBoardingSteps ko increase bhi krna hai isliye ye kiya
    if (user.partnerOnBoardingSteps < 2) {
      user.partnerOnBoardingSteps = 2;
    }

    //mtlb partner ke bank dets mein koi change hon toh wapis se status pending krdo taaki wapis admin ke paas review ke liye chala jaaye
    if (user.partnerStatus === "approved" || user.partnerStatus==="rejected") {
      user.partnerStatus = "pending";
      user.videoKycStatus="pending"
      user.partnerOnBoardingSteps = 3;
    }

    await user.save();

    return NextResponse.json(partnerDocs, { status: 201 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "partner docs error", error },
      { status: 500 },
    );
  }
};

export const GET = async () => {
  try {
    await connectDb();

    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized access denied" },
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

    const partnerDocs = await PartnerDocs.findOne({
      owner: user._id,
    });

    if (!partnerDocs) {
      return NextResponse.json(
        { message: "Partner documents not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Partner documents fetched successfully",
        partnerDocs,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Partner docs error", error },
      { status: 500 },
    );
  }
};
import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !session.user.email ||
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { message: "Unauthorised access denied" },
        { status: 400 },
      );
    }

    const totalPartners = await User.countDocuments({ role: "partner" }); //unn sabhi partners ko count karo jinka role partner hai
    const totalPendingPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "pending",
    });

    const totalApprovedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "approved",
    });
    const totalRejectedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "rejected",
    });

    const pendingPartnerUsers = await User.find({
      //yaha find isliye likha kyunki poore documents chahiye the joh inn conditions ko satisfy kre aur countDocuments hame sirf count return krta hai
      role: "partner",
      partnerStatus: "pending",
      partnerOnBoardingSteps: { $gte: 3 }, //$gte ye hai greaterthanequalto operator
    });

    const pricingCompletedPartners = await User.find({
      role: "partner",
      partnerOnBoardingSteps: { $gte: 6 },
    }).select("_id");

    const pricingCompletedPartnerIds = pricingCompletedPartners.map(
      (p) => p._id,
    );

    const pendingVehicleReviews = await Vehicle.find({
      status: "pending",
      owner:{$in:pricingCompletedPartnerIds}
    }).populate("owner"); //isse joh bhi iss vehicle ka owner hai uska poora document milega wrna usually sirf owner ke andr user ki id milti hai

    //ab hume in partner ki ids bhi chahiye hogi kyunki ussi ki help se hum unn particular partner ki vehicle bank aur baaki details nikalenge
    const partnerIds = pendingPartnerUsers.map((p) => p._id);

    const partnerVehicles = await Vehicle.find(
      { owner: { $in: partnerIds } }, //ye in operator parnterIds ke array ke andr jaake har partnerId ko check krega joh bhi kisi bhi vehicle ki owner hogi uss vehicle ki details hame dedega
    );
    const vehicleType = new Map(
      partnerVehicles.map((v) => [String(v.owner), v.type]),
    ); //purpose ye hai ki har partnerId ke against uske vehicle ka type store karna. Matlab ek mapping ban rahi hai:
    // Key → Partner ka _id (string form me)
    // Value → Us partner ke vehicle ka type

    //map aisa banadega
    /*
    {
  "64a8f1" => "car",
  "64a8f2" => "bike",
  "64a8f3" => "truck"
}
    */

    const pendingPartnersReviews = pendingPartnerUsers.map((p) => ({
      id: p._id,
      name: p.name,
      email: p.email,
      vehicleType: vehicleType.get(String(p._id)),
    }));

    return NextResponse.json({
      pendingVehicleReviews,
      stats: {
        totalPartners,
        totalApprovedPartners,
        totalRejectedPartners,
        totalPendingPartners,
      },
      pendingPartnersReviews,
    });
  } catch (error) {
    console.log("Admin catch error", error);
    return NextResponse.json({ message: "Admin Error" }, { status: 400 });
  }
};

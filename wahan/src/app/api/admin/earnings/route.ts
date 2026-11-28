import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";

export const GET = async () => {
  try {
    await connectDb();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const bookings = await Booking.find({
      paymentStatus: "paid",
      createdAt: { $gte: sevenDaysAgo },
    }).select("adminCommision createdAt");

    let earningMap: Record<string, number> = {};

    bookings.forEach((b) => {
      const date = new Date(b.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      //same date ki earnings ko add karke uss particular key ke andr total earnings of that particular day ko store kara diya
      earningMap[date] = (earningMap[date] || 0) + (b.adminCommision || 0);
    });

    const earnings = Object.entries(earningMap).map(([date, earnings]) => ({
      date,
      earnings,
    }));

    return Response.json({ earnings },{status:200});
  } catch (error) {
    return Response.json({error: "Failed to fetch admin earnings" }, { status: 500 });
  }
};

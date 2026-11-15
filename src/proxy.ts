import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "./lib/auth";

const PUBLIC_ROUTES = ["/","/login","/register","/verifyotp"];
const PUBLIC_APIS = ["/api/auth"]; //joh bhi api /api/auth se shuru hogi unko allow krna hai iss middleware mein

export async function proxy(req: NextRequest) {
  //ye route based cheeze hogyi hai
  const { pathname } = req.nextUrl; //isse url mil jaaega jiss bhi page pe ham jaaenge waha ka
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(pathname)//iska mtlb hai ki sabhi image ko allow kro, ye likhne se pehle kabhi kabhi images gayab hojaarhi thi herosection ki kyunki woh routes allowed nhi the but ab ye problem nahi aayegi
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }
  if (PUBLIC_APIS.some((api) => pathname.startsWith(api))) {
    return NextResponse.next();
  }

  // Ab:

  // /api/auth
  // /api/auth/session
  // /api/auth/signin
  // /api/auth/signout
  // /api/auth/callback/google

  // sab allow ho jayenge.

  //ab hum role based cheeze krenge
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL("/", req.url)); //isse ispe redirect hojaaega https://localhost:3000/
  }
  const role = session.user.role;
  if (pathname.startsWith("/admin")) {
    //iska mtlb hai ki agr user /admin ke route ko access krna chahega toh ham check krenge ki uska role user hai ya nhi agr hai toh woh access krskta hai aur agr nhi hai toh seedhe home page pe redirect krdo
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  if (pathname.startsWith("/partner")) {
    // Partner onboarding ko normal logged-in users bhi access kar sakte hain
    if (pathname.startsWith("/partner/onboarding")) {
      return NextResponse.next();
    }

    // Baaki partner routes sirf partner role ke liye
    if (role !== "partner") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  //agr hamare paas session bhi nhi hai ya authenticated nhi hai toh /api wlae route ko bhi acces na krpaaye
  if (pathname.startsWith("/api")) {
    if (!session.user) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }
  }
  return NextResponse.next();
}
//abhi joh hamara middleware hai ye sare routes ke liye chalega aur ab mein chahta hu ki ye jo hamara middleware hai ye hamare static routes/files in sab ke liye na chale toh iske liya alg se config banana hoga

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], //matcher ka mtlb hai ki kin kin routes ke liye middleware chalana hai {isme likha hai ki static favicon image aur . wale routes chodd dena}
};

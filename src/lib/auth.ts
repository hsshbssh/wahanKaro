import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDb from "./db";
import User from "@/model/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

//pehle proviers banao
//fir Credentials mein do fields hoti hai pehli credentials{isme frontend mein se email aur password aaega}, aur doosri authorize{isme saara logic hoga}
const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "Email",
        },
        password: {
          type: "password",
          label: "Password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // instead of throw
        }

        await connectDb();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordMatch) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("SIGN IN CALLBACK RUNNING");
      console.log("ACCOUNT:", account);
      console.log("USER:", user);
      if (account?.provider === "google") {
        await connectDb();
        let existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          existingUser = await User.create({
            name: user.name,
            email: user.email,
          });
        }
        ((user.id = existingUser._id), (user.role = existingUser.role));
      }
      return true;
    },
    async jwt({ token, user }) {
      //iss user mein joh hume credentials provider ke andr return kiya hai object woh milega
      if (user) {
        ((token.id = user.id),
          (token.name = user.name),
          (token.email = user.email),
          (token.role = user.role)); //role mein red line aarhi thi kyunki hamara user by default next-auth ke User type ka hota hai usme sirf id name email ye sab hoti hai , usme role nahi hota toh mein types.d.ts mein role ko User mein add kiya hai
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
};

export default authOptions;

import authOptions from "@/lib/auth"
import connectDb from "@/lib/db"
import User from "@/model/user.model"
import { getServerSession } from "next-auth"

export const GET=async(req:Request)=>{
    try {
        await connectDb()
        //ab hume chhaiye hamare current logged in user ki details toh ham frontend mein toh useSession ki help se nikal lete the but backend mein we have to use getServerSession
        const session=await getServerSession(authOptions)
        if(!session || !session.user){
            return Response.json(
                {message:'User not authenticated'},
                {status:400}
            )
        }
        //agr aisa nhi hai toh ab um apna user find krlenge

        const user=await User.findOne({email:session.user.email})
        if(!user){
            return Response.json(
                {message:'user not found'},
                {status:400}
            )
        }
        return Response.json(
            user,
            {status:200}
        )
        
    } catch (error) {
        return Response.json(
                {message:`get me error ${error}`},
                {status:500}
            )
    }
}
//ab iss api ko call krne ke liye ham custom hooks banayenge src ke andr hooks naam se folder bnake uske andr UseGetMe naam ka hook banayenge
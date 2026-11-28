import { Connection } from "mongoose"
import { DefaultSession } from "next-auth"

declare global{
    var mongoose:{
        conn:Connection | null,
        promise:Promise<Connection> | null
    }
}

declare module "next-auth"{
    interface User{
        role:string
    }
    interface Session{
        user:{
            id:string,
            role:string
        } & DefaultSession['user']
    }
}

export {}
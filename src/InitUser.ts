'use client'
import { useSession } from "next-auth/react"
import UseGetMe from "./hooks/UseGetMe"

export const InitUser=()=>{
  const session=useSession()
  UseGetMe(session.status=="authenticated")//agr sta
  return null
}
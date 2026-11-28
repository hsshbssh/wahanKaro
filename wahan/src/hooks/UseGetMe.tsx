'use client'

import { setUserData } from "@/redux/userSlice"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const UseGetMe = (enabled:boolean) => {
    const dispatch=useDispatch()//ye hook hamara ek function return krta hai
useEffect(()=>{
    if(!enabled){//iska mtlb hai ki agr hamara status authenticated nahi hoga yaani ye false hoga toh ham yahi se return krjaaenge faaltu mein koi useEffect call nhi hoga jisse error aarhe the
        return
    }
    const getMe=async()=>{
        const {data}=await axios.get('/api/user/me')
        // console.log(data)

        //ab joh ye data milrha hai usse hame store mein store bhi toh krna hai toh ham use krenge useDispatch hook ka

        dispatch(setUserData(data))//iski help se hamara data set hogya hai userData mein joh userSlice ke andr h
    }
    getMe()
},[enabled])
}

export default UseGetMe

//ab iss hook ko hame page khulte hi yaani website load hote hi call krana hai toh hume isko use krna hoga layout.tsx mein kyunki wohi sbse pehle render hoti hai and uske liye bhi hum ek InitUser.tsx naam ki file banayenge src ke andr jisme ham isko tab call kraenge jab session mein status authenticated hoga
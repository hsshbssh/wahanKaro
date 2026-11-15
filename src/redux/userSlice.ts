import { Iuser } from "@/model/user.model";
import { createSlice } from "@reduxjs/toolkit";

interface IuserState{
    userData:Iuser | null//ye Iuser import kiya hai user model se kyunki hamara userData issi Iuser type ka hona chahiye
}
const initialState:IuserState={
    userData:null//initially ye null hoga
}
export const userSlice=createSlice({
    name:'user',
    initialState,//ab iss initialState ke andr hum state toh rkhte hai but initial state rkhte hai {ex-otp naaki setOtp } aur isko  dekh upar bana rkha hai

    reducers:{//ye ek type ka function hai joh ki hame help krta hai store se data laane aur lejaane mein
        setUserData:(state,actions)=>{//ye joh state hai woh initialState ko target krti hai
            state.userData=actions.payload //actions.payload ke andr hame data milega joh hum daalna chahte hai userData mein
        }
    }
})

export const {setUserData}=userSlice.actions

export default userSlice.reducer // isko ham store mein lenge
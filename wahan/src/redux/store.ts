import { configureStore } from "@reduxjs/toolkit";
import userReducer from './userSlice'//isme woh aaega joh bhi hamne user slice mein defaultly export kiya hoga

//data ko store se access krne ke liye hum use krte hai useSelector ka aur data ko bhejne ke liye hum use krte hai useDispatch ka aur ye dono hame react-redux se milte hai

export const store=configureStore({
    reducer:{//iss reducer ke andr hi slices banate hai hum
        user:userReducer//1st slice is user slice
    }
})

export type RootState= ReturnType<typeof store.getState>
export type AppDispatch=typeof store.dispatch

//ab humne joh ye store banaya hai na, isse hume provide krana hoga poore app ke liye
//jaise hume session ko provide krwaya tha sessionProvider se wrap krwake
import mongoose from "mongoose";

type VideoKycStatus="not_required"|"pending"|"in_progress"|"approved"|"rejected"
export interface Iuser {
  _id?: string;
  name: string;
  email: string;
  role: "user" | "partner" | "admin"
  password?: string;
  isEmailVerified?:boolean;
  otp?:string;
  otpExpiresIn?:Date;
  partnerOnBoardingSteps:number;
  partnerStatus:"pending" | "approved" | "rejected";
  videoKycStatus:VideoKycStatus;
  videokycRoomId:string;//jiske andr admin aur user ki video call hogi
  videoKycRejectionReason:string| undefined;
  mobile?:string;
  location?:{
    type:"Point",
    coordinates:[number,number]
  },
  socketId:string|null,
  isOnline:boolean,
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<Iuser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique:true,
      lowercase:true,
      trim:true
    },
    password: {
      type: String,
      required: false,
    },
    role:{
      type:String,
      default:'user',
      enum:["user","partner","admin"]
    },
    isEmailVerified:{
      type:Boolean,
      default:false
    },
    otp:{
      type:String,
    },
    otpExpiresIn:{
      type:Date
    },
    partnerOnBoardingSteps:{
      type:Number,
      min:0,
      max:8,
      default:0
    },
    partnerStatus:{
      type:String,
      enum:["pending","approved","rejected"],
      default:"pending"
    },
    mobile:{
      type:String
    },
    videoKycStatus:{
      type:String,
      enum:["not_required","pending","in_progress","approved","rejected"],
      default:"not_required"
    },
    videokycRoomId:{
      type:String
    },
    videoKycRejectionReason:{
      type:String
    },
    location:{
      type:{ 
        type:String,
        enum:["Point"]
      },
      coordinates:[Number,Number]
    },
    socketId:{
      type:String,
      default:null
    },
    isOnline:{
      type:Boolean,
      default:false,
      index:true//ab mongo db mein index ka matlab ye hai ki agr index false hai toh mongoDb ko data dhundne ke liye poori collection ko search karega but agr index true hai toh hum mongo db ko pehle hi bata rahe hai ki ye particular data iss index pe hai , toh mongoDb bina poori collection ko search kiye seedha ussi index pe phoch jaaega
      //ab index yaha pe kayi type ke hote hai mongo db mein jisme se ek hota hai 0th spacial jisme hum location se related cheeze krte hai aur hum isme apni location ko geoJSON format mein rkhte hai aur yehi format humne apne userModel mein location ke liye use kiya hai
    }
  },
  { timestamps: true },
);
userSchema.index({location:"2dsphere"})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

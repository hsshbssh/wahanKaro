import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
      index:true
    }
  },
  { timestamps: true },
);
userSchema.index({location:"2dsphere"})

const User = mongoose.model("User", userSchema);

export default User;

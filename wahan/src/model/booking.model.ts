import mongoose from "mongoose";

export type BookingStatus =
  | "idle"
  | "requested"
  | "awaiting-payment"
  | "confirmed"
  | "started"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

export type paymentStatus = "pending" | "paid" | "cash" | "failed";

export interface Ibooking {
  _id:string,
  user: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;

  pickUpAddress: String;
  dropAddress: string;

  pickUpLocation: {
    type: "Point";
    coordinates: [number, number];
  };

  dropLocation: {
    type: "Point";
    coordinates: [number, number];
  };

  fare: number;

  userMobile: string;
  driverMobile?: string;

  bookingStatus: BookingStatus;
  paymentStatus: paymentStatus;

  adminCommision?: number;
  partnerAmount?: number;

  paymentDeadline:Date;

  pickUpOtp: string;
  pickUpOtpExpires?: Date;
  dropOtp: string;
  dropOtpExpires?: Date;

  createdAt?: Date;
  updatedAt?: Date; //ye dono optional honge kyunki ye hamare paas tab aayenge jab booking create hojaegi
}

const bookingSchema = new mongoose.Schema<Ibooking>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      // Vehicle ka MongoDB _id ObjectId hota hai; same type rakhne se populate
      // booking response mein vehicle document correctly return karta hai.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    pickUpAddress: {
      type: String,
      required: true,
    },
    dropAddress: {
      type: String,
      required: true,
    },
    pickUpLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number, Number],
    },
    dropLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number, Number],
    },
    fare: {
      type: Number,
      required: true,
    },
    paymentDeadline:{
      type:Date
    },
    userMobile: {
      type: String,
      required: true,
      maxLength: 10,
    },
    driverMobile: {
      type: String,
      maxLength: 10
    },
    bookingStatus: {
      type: String,
      enum: [
        "idle",
        "requested",
        "awaiting-payment",
        "confirmed",
        "started",
        "completed",
        "cancelled",
        "rejected",
        "expired",
      ],
      default: "idle",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cash", "failed"],
      default: "pending",
    },
    adminCommision: {
      type: Number
    },
    partnerAmount: {
      type: Number
    },
    pickUpOtp: {
      type: String,
      trim: true,
    },
    pickUpOtpExpires: {
      type: Date
    },
    dropOtp: {
      type: String,
      trim: true,
    },
    dropOtpExpires: {
      type: Date
    },
  },
  { timestamps: true },
);

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);
  
export default Booking;

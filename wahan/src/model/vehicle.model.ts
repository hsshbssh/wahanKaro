import mongoose from "mongoose";

export type VehicleType = "Bike" | "Auto" | "Car" | "Loading" | "Truck";

export interface IVehicle {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  type: VehicleType;
  vehicleModel: string;
  vehicleNumber: string;

  imageUrl?: string;
  baseFare?: number;
  pricePerKm?: number;
  waitingCharge?: number;

  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

const vehicleSchema = new mongoose.Schema<IVehicle>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["Bike", "Auto", "Car", "Loading", "Truck"],
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
    },

    baseFare: {
      type: Number,
    },

    pricePerKm: {
      type: Number,
    },

    waitingCharge: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle =
  mongoose.models.Vehicle ||
  mongoose.model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;
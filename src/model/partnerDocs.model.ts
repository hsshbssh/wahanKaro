import mongoose from "mongoose";

interface IDocs {
  owner: mongoose.Types.ObjectId;

  aadharUrl: string;
  rcUrl: string;
  licenseUrl: string;

  status: "pending" | "approved" | "rejected";

  rejectionReason?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const partnerDocsSchema = new mongoose.Schema<IDocs>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    aadharUrl: {
      type: String,
      required: true,
    },

    rcUrl: {
      type: String,
      required: true,
    },

    licenseUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const PartnerDocs =
  mongoose.models.PartnerDocs ||
  mongoose.model<IDocs>("PartnerDocs", partnerDocsSchema);

export default PartnerDocs;
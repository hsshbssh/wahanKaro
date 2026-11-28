import mongoose from 'mongoose';

interface Ibank{
    owner:mongoose.Types.ObjectId,
    accountHolder:string,
    accountNumber:string,
    ifsc:string,
    upi?:string | null,
    status:"not_added" | "added" | "verified" | "rejected",
    createdAt:Date,
    updatedAt:Date
}


const partnerBankSchema = new mongoose.Schema<Ibank>({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    accountHolder:{
        type:String,
        required:true
    },
    accountNumber:{
        type:String,
        required:true,
        unique:true
    },
    ifsc:{
        type:String,
        required:true,
        unique:true,
        uppercase:true
    },
    upi:{
        type:String,
        required:true,
        unique:true
    },
    status:{
        type:String,
        enum:["not_added","added","verified","rejected"],
        default:"not_added"
    }

},{timestamps:true});

const PartnerBankDocs = mongoose.models.PartnerBankDocs || mongoose.model("PartnerBankDocs", partnerBankSchema);

export default PartnerBankDocs;
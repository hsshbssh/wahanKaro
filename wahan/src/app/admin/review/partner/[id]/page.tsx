"use client";

import PartnerDetsNav from "@/components/PartnerDetsNav";
import axios from "axios";
import { Banknote, Car, FileText, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type StatusType = "pending" | "approved" | "rejected";

const page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<StatusType>("pending");

  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [accountHName, setAccountHName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upi, setUpi] = useState("");

  const [aadhar, setAadhar] = useState("");
  const [license, setLicense] = useState("");
  const [vehicleRc, setVehicleRc] = useState("");

  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const handleGetPartnerDets = async () => {
    if (!id) {
      console.log("Partner ID missing");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `/api/admin/review/partner/${id}`
      );

      setName(data.name);
      setEmail(data.email);
      setStatus(data.partnerStatus);

      setVehicleType(data.vehicle?.type);
      setVehicleNumber(data.vehicle?.vehicleNumber);
      setVehicleModel(data.vehicle?.vehicleModel);

      setAccountHName(data.bank?.accountHolder);
      setAccountNumber(data.bank?.accountNumber);
      setIfsc(data.bank?.ifsc);
      setUpi(data.bank?.upi);

      setAadhar(data.document?.aadharUrl);
      setLicense(data.document?.licenseUrl);
      setVehicleRc(data.document?.rcUrl);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetPartnerDets();
  }, [id]);

  const handlePartnerStatus = async (
    status: "approved" | "rejected",
    partnerDocStatus:"approved" | "rejected",
    partnerBankDocsStatus:"verified" | "rejected",
    partnerVehicleStatus:"approved"| "rejected"
  ) => {
    try {
      await axios.patch(
        `/api/admin/review/partner/${id}`,
        { status,partnerBankDocsStatus,partnerDocStatus,partnerVehicleStatus }
      );

      setStatus(status); //ye sitf frontend mein status change krrha hai but mongo mein abhi bhi status pending hi hoga kyunki backend mein ham kuch change hi nahi krrhe hai aur ye krne ke liye apne [id] wale api mein ek aur api banani hogi PATCH krke joh ki update ya change krta hai data ko database mein dekh jaake

      router.back();
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-500">
        Loading Partner Details...
      </div>
    );
  }

  return (
    <>
      <PartnerDetsNav
        name={name}
        email={email}
        status={status}
      />

      <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 bg-white">
        <div className="mt-[60px] px-6 lg:px-12">
          {/* Details Container */}
          <div className="flex flex-col lg:flex-row items-stretch gap-6">
            {/* Vehicle Details */}
            <div className="flex-1 min-w-0 bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-2xl px-8 py-8">
              <div className="flex items-center gap-2">
                <Car size={18} className="text-black" />

                <p className="text-sm font-bold text-black">
                  Vehicle Details
                </p>
              </div>

              <div className="flex items-center justify-between gap-6 mt-6">
                <p className="text-gray-500 text-sm font-semibold">
                  Vehicle Type
                </p>

                <p className="text-black font-bold text-sm text-right">
                  {vehicleType}
                </p>
              </div>

              <div className="flex items-center justify-between gap-6 mt-5">
                <p className="text-gray-500 text-sm font-semibold">
                  Registration Number
                </p>

                <p className="text-black font-bold text-sm text-right">
                  {vehicleNumber}
                </p>
              </div>

              <div className="flex items-center justify-between gap-6 mt-5">
                <p className="text-gray-500 text-sm font-semibold">
                  Vehicle Model
                </p>

                <p className="text-black font-bold text-sm text-right">
                  {vehicleModel}
                </p>
              </div>
            </div>

            {/* Bank Details */}
            <div className="flex-1 min-w-0 bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-2xl px-8 py-8">
              <div className="flex items-center gap-2">
                <Banknote size={18} className="text-black" />

                <p className="text-sm font-bold text-black">
                  Bank Details
                </p>
              </div>

              <div className="flex items-center justify-between gap-6 mt-6">
                <p className="text-gray-500 text-sm font-semibold">
                  Account Holder
                </p>

                <p className="text-black font-bold text-sm text-right">
                  {accountHName}
                </p>
              </div>

              <div className="flex items-center justify-between gap-6 mt-5">
                <p className="text-gray-500 text-sm font-semibold">
                  Account Number
                </p>

                <p className="text-black font-bold text-sm text-right">
                  {accountNumber}
                </p>
              </div>

              <div className="flex items-center justify-between gap-6 mt-5">
                <p className="text-gray-500 text-sm font-semibold">
                  IFSC
                </p>

                <p className="text-black font-bold text-sm text-right">
                  {ifsc}
                </p>
              </div>

              <div className="flex items-center justify-between gap-6 mt-5">
                <p className="text-gray-500 text-sm font-semibold">
                  UPI ID
                </p>

                <p className="text-black font-bold text-sm text-right">
                  {upi}
                </p>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* Documents + Admin Decision */}
          {/* ================================================= */}

          <div className="flex flex-col lg:flex-row gap-6 mt-6">
            {/* Documents Box */}
            <div className="flex-[2] min-w-0 bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-2xl px-8 py-8">
              {/* Heading */}
              <div className="flex items-center gap-2 mb-6">
                <FileText size={18} className="text-black" />

                <p className="text-sm font-bold text-black">
                  Documents
                </p>
              </div>

              {/* Documents Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Aadhaar */}
                <div className="border border-gray-300 rounded-2xl overflow-hidden bg-white">
                  <div className="px-4 py-3 border-b border-gray-300">
                    <p className="text-sm font-bold text-black">
                      Aadhaar
                    </p>
                  </div>

                  <div className="h-[210px] bg-gray-100 flex items-center justify-center overflow-hidden">
                    {aadhar ? (
                      aadhar.toLowerCase().includes(".pdf") ? (
                        <iframe
                          src={aadhar}
                          title="Aadhaar Document"
                          className="w-full h-full"
                        />
                      ) : (
                        <img
                          src={aadhar}
                          alt="Aadhaar Document"
                          className="w-full h-full object-contain"
                        />
                      )
                    ) : (
                      <div className="text-center">
                        <FileText
                          size={35}
                          className="mx-auto text-gray-400 mb-2"
                        />

                        <p className="text-xs text-gray-500">
                          Document Preview
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      aadhar && window.open(aadhar, "_blank")
                    }
                    disabled={!aadhar}
                    className="w-full h-11 border-t border-gray-300 text-sm font-bold text-black hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Open full document
                  </button>
                </div>

                {/* License */}
                <div className="border border-gray-300 rounded-2xl overflow-hidden bg-white">
                  <div className="px-4 py-3 border-b border-gray-300">
                    <p className="text-sm font-bold text-black">
                      License
                    </p>
                  </div>

                  <div className="h-[210px] bg-gray-100 flex items-center justify-center overflow-hidden">
                    {license ? (
                      license.toLowerCase().includes(".pdf") ? (
                        <iframe
                          src={license}
                          title="License Document"
                          className="w-full h-full"
                        />
                      ) : (
                        <img
                          src={license}
                          alt="License Document"
                          className="w-full h-full object-contain"
                        />
                      )
                    ) : (
                      <div className="text-center">
                        <FileText
                          size={35}
                          className="mx-auto text-gray-400 mb-2"
                        />

                        <p className="text-xs text-gray-500">
                          Document Preview
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      license && window.open(license, "_blank")
                    }
                    disabled={!license}
                    className="w-full h-11 border-t border-gray-300 text-sm font-bold text-black hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Open full document
                  </button>
                </div>

                {/* RC */}
                <div className="border border-gray-300 rounded-2xl overflow-hidden bg-white">
                  <div className="px-4 py-3 border-b border-gray-300">
                    <p className="text-sm font-bold text-black">
                      RC
                    </p>
                  </div>

                  <div className="h-[210px] bg-gray-100 flex items-center justify-center overflow-hidden">
                    {vehicleRc ? (
                      vehicleRc.toLowerCase().includes(".pdf") ? (
                        <iframe
                          src={vehicleRc}
                          title="Vehicle RC Document"
                          className="w-full h-full"
                        />
                      ) : (
                        <img
                          src={vehicleRc}
                          alt="Vehicle RC Document"
                          className="w-full h-full object-contain"
                        />
                      )
                    ) : (
                      <div className="text-center">
                        <FileText
                          size={35}
                          className="mx-auto text-gray-400 mb-2"
                        />

                        <p className="text-xs text-gray-500">
                          Document Preview
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      vehicleRc &&
                      window.open(vehicleRc, "_blank")
                    }
                    disabled={!vehicleRc}
                    className="w-full h-11 border-t border-gray-300 text-sm font-bold text-black hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Open full document
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Decision Box */}
            <div className="flex-1 min-w-0 bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-2xl px-8 py-8">
              {/* Heading */}
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={18}
                  className="text-black"
                />

                <p className="text-sm font-bold text-black">
                  Admin Decision
                </p>
              </div>

              <p className="text-sm text-gray-400 mt-6">
                Verify documents carefully before approving
              </p>

              {/* Approve */}
              <button
                type="button"
                onClick={() =>
                  handlePartnerStatus("approved","approved","verified","approved")
                }
                className="w-full mt-7 h-14 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-900 transition-all duration-200 shadow-md"
              >
                Approve Vendor
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() =>
                  handlePartnerStatus("rejected","rejected","rejected","rejected")
                }
                className="w-full mt-4 h-14 rounded-xl border border-gray-300 bg-white text-black text-sm font-bold hover:bg-gray-50 transition-all duration-200"
              >
                Reject Vendor
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
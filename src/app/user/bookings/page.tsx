"use client";

import { BookingStatus, paymentStatus } from "@/model/booking.model";
import { Iuser } from "@/model/user.model";
import { IVehicle } from "@/model/vehicle.model";
import axios from "axios";
import { motion } from "framer-motion";

import { Bike, Car, Truck, Loader2, User } from "lucide-react";

import { useEffect, useState } from "react";

const page = () => {
  interface Ibooking {
    _id: string;
    user: Iuser;
    driver: Iuser;
    vehicle: IVehicle;

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

    paymentDeadline: Date;

    pickUpOtp: string;
    pickUpOtpExpires?: Date;
    dropOtp: string;
    dropOtpExpires?: Date;

    createdAt?: Date;
    updatedAt?: Date;
  }
  const [bookings, setBookings] = useState<Ibooking[] | []>([]);
  const [loading, setLoading] = useState(false);

  //ham status ke hisaab se bookings ko filter karayenge
  const [filteredBookings, setFilteredBookings] = useState<Ibooking[]>([]);
  const [selectStatus, setSelectStatus] = useState("All");

  const getVehicleIcon = (vehicleType?: string) => {
    switch (vehicleType?.toLowerCase()) {
      case "bike":
        return Bike;

      case "auto":
        return Car;

      case "car":
        return Car;

      case "loading":
      case "truck":
        return Truck;

      default:
        return Car;
    }
  };

  useEffect(() => {
    const getBookings = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/user/bookings");
        console.log(data);
        setBookings(data.bookings);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    getBookings();
  }, []);

  //logic for filtering out the bookings
  const selectedbookings =
    selectStatus === "All"
      ? bookings
      : bookings.filter((b) => b.bookingStatus == selectStatus.toLowerCase());
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto py-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900 font-semibold">
                  Customer Bookings
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {bookings.length} {bookings.length == 1 ? "ride" : "rides"}{" "}
                  Booked by you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-500">
              Showing {selectedbookings.length} bookings.
            </div>
            <select
              value={selectStatus}
              onChange={(e) => setSelectStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg text-sm px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All</option>
              <option>requested</option>
              <option>awaiting-payment</option>
              <option>confirmed</option>
              <option>started</option>
              <option>completed</option>
              <option>cancelled</option>
              <option>rejected</option>
              <option>expired</option>
            </select>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin w-8 h-8 text-black" />
            </div>
          )}

          {!loading && selectedbookings.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h1 className="text-lg font-medium text-gray-900">
                No bookings yet.
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Your booked rides will appear here.
              </p>
            </div>
          )}

          {!loading && selectedbookings.length > 0 && (
            <div className="space-y-4">
              {selectedbookings.map((b, i) => (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    {/* Customer and Booking Status */}
                    <div className="flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-200 flex-shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>

                        <div>
                          <h2 className="font-semibold text-gray-900">
                            {b.driver?.name || "Driver"}
                          </h2>
                          <p className="text-xs text-gray-500">
                            Mobile No:-{b.driverMobile || "Not available"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          b.bookingStatus === "completed"
                            ? "bg-green-100 text-green-700"
                            : b.bookingStatus === "cancelled" ||
                                b.bookingStatus === "rejected" ||
                                b.bookingStatus === "expired"
                              ? "bg-red-100 text-red-700"
                              : b.bookingStatus === "confirmed" ||
                                  b.bookingStatus === "started"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </div>

                    {/* Vehicle Details */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 rounded-lg p-3">
                          {(() => {
                            const VehicleIcon = getVehicleIcon(b.vehicle?.type);

                            return (
                              <VehicleIcon className="w-6 h-6 text-gray-700" />
                            );
                          })()}
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {b.vehicle?.vehicleModel ||
                              "Vehicle details unavailable"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {b.vehicle?.type || "Vehicle type unavailable"}
                            {b.vehicle?.vehicleNumber
                              ? ` • ${b.vehicle.vehicleNumber}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pickup and Drop Locations */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-3 h-3 rounded-full border-2 border-green-500" />
                          <div className="w-0.5 h-10 bg-gray-300" />
                          <div className="w-3 h-3 rounded-sm bg-red-500" />
                        </div>

                        <div className="flex-1 space-y-5">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              PICKUP LOCATION
                            </p>
                            <p className="text-sm font-medium text-gray-800">
                              {b.pickUpAddress}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              DROP LOCATION
                            </p>
                            <p className="text-sm font-medium text-gray-800">
                              {b.dropAddress}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fare and Payment */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">TOTAL FARE</p>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{b.fare}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">
                          PAYMENT STATUS
                        </p>
                        <span className="text-sm font-medium capitalize text-gray-700">
                          {b.paymentStatus}
                        </span>
                      </div>

                      {b.bookingStatus !== "completed" && (
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = `/user/active-rides/${b._id}`;
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                          Details
                        </button>
                      )}
                    </div>

                    {/* Booking Date */}
                    {b.createdAt && (
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Booked on:{" "}
                          {new Date(b.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;

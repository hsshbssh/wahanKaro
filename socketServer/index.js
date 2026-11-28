import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import User from "./models/user.model.js";

dotenv.config();
const port = process.env.PORT || 5000;
const mongoUrl = process.env.MONGODB_URL;

const connectDb = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("db connected");
  } catch (error) {
    console.log(error);
  }
};

//ab hum apna server banayenge
const app = express();
app.use(express.json()) //abhi destructuring ka error khatam hojaaega

const server = http.createServer(app); //ab app ke saare routes issi server pe listen krenge

//ab hum socket io ko initialise krenge

//hamare paas isme do types hote hai ek hota hai socket.io server aur ek socket io client {frontend site mein use hoga} jisse ye server connect hoga
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
  },
}); //isse hmara node js ka server socket io ke server mein convert hojaaega

const latestDriverLocations = new Map();

//hum yaha pe ek common api bana rahe hai joh real time events handle kregi
app.post("/emit", async (req, res) => {
  const { event, userId, data } = req.body;
  try {
    if (!event || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "event and userId are required" });
    }

    io.to(`user:${userId}`).emit(event, data);
    return res.json({ success: true });
  } catch (error) {
    console.error("SOCKET EMIT ERROR:", error);
    return res.json({ success: false });
  }
});

io.on("connection", (socket) => {
  //ab jaise hi connetion built hota hai toh frontend se yaha server side pe ek socket recieve hota hai joh ki ek type ka object hai aur iske andr hamee joh bhi user connect hua hai uski socket id milti hai

  console.log(socket.id);
  socket.on("identity", async (userId) => {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          socketId: socket.id,
          isOnline: true,
        },
        { new: true },
      );

      if (!user) {
        console.error("SOCKET IDENTITY ERROR: user not found", userId);
        return;
      }

      socket.userId = userId;
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} registered for user ${userId}`);
    } catch (error) {
      console.error("SOCKET IDENTITY ERROR:", error);
    }
  });

  //ye galat hai

  // socket.on("disconnect",async(userId)=>{ yaha userId kaha se milegi kyunki ye thodi geoUpdate se emit horha hai toh iske liye hame upar hi identity event mein joh userId aarhi hai usse socket ke andr ek userId field banake store karani hogi aur fir hum userId ko socket ki help se yaha use Krskte hai

  //     await User.findByIdAndUpdate(userId,{
  //         socketId:null,
  //         isOnline:false
  //     })
  // })

  socket.on("disconnect", async () => {
    if (!socket.userId) return;

    try {
      await User.findOneAndUpdate(
        { _id: socket.userId, socketId: socket.id },
        {
          socketId: null,
          isOnline: false,
        },
      );
    } catch (error) {
      console.error("SOCKET DISCONNECT CLEANUP ERROR:", error);
    }
  });

  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    try {
      await User.findByIdAndUpdate(userId, {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      });
    } catch (error) {
      console.error("SOCKET LOCATION UPDATE ERROR:", error);
    }
  });

  socket.on("join-room", ({ bookingId }) => {
    if (typeof bookingId !== "string" || !bookingId) {
      console.error("SOCKET INVALID RIDE ROOM ID");
      return;
    }

    console.log(`joined room ${bookingId}`);
    socket.join(`ride-${bookingId}`);

    const latestLocation = latestDriverLocations.get(bookingId);
    if (latestLocation) {
      socket.emit("driver-location", latestLocation);
    }
  });

  socket.on("driver-position-update",({bookingId,latitude,longitude,status})=>{
    if (
      typeof bookingId !== "string" ||
      !bookingId ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      console.error("SOCKET INVALID DRIVER POSITION UPDATE");
      return;
    }

    latestDriverLocations.set(bookingId, { latitude, longitude });
    io.to(`ride-${bookingId}`).emit('driver-location',{latitude,longitude}) //io.to(`ride-${bookingId}`) iska  mtlb hai ki iss room ko ek event emit kiya hai yaani iss room mein jitne bhi members joined honge woh isse listen krskenge aur issi wajah se user bhi isse listen krrega aur usse driver ki longitude aur laitude miljaaenge
  })

  socket.on("chat-message", (data) => {
  console.log("CHAT MESSAGE SENT:", data);

  socket
    .to(`ride-${data.bookingId}`)
    .emit("chat-message-update", data);

  console.log("CHAT UPDATE EMITTED");
});
});



server.listen(port, () => {
  console.log("server started");
  connectDb();
});

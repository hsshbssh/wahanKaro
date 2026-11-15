"use client";

import { getSocketIo } from "@/lib/socket";
import { useEffect, useRef } from "react";

const GeoUpdater = ({ userId }: { userId: string | undefined }) => {
  const socketRef = useRef<any>(null); //isme hum socket ka reference rakhenge

  useEffect(() => {
    //ab iss useeffect mein hume krna h ki hume hamari curent location miljaaye page pe aate hi aur jaise hi koi bhi updation ho location men toh woh locatin update hojaaye hamare database mein

    if (!userId) return;
    if (!navigator.geolocation) return;

    //sabse pehle socketRef mein apna socket ka instance stoore krenge
    socketRef.current = getSocketIo();

    socketRef.current.emit("identity", userId);

    // ab location update krni hai databse mein
    const watcher = navigator.geolocation.watchPosition(
      ({ coords }) => {
        //yaha currentPosition nahi use krunga kyunki woh lat aur lng toh deta hai current but jab update krte hai location toh page refresh krna padta hai tab jaake naye lat aur lng store hote hai ab isliye mein use krrha hu watchPosition ka jisse hoga ye ki jaise hi location mein update krunga waise hi databse mein bhi location update hojaaegi bina page refreh kiye

        socketRef.current.emit("update-location", {
          userId,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      (err) => {
        console.log(err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
      },
      //ab return karte time ham iss watcher ko clear krdete hai wrna ye kabhi kabhi dikkt deta hai
    );
    return ()=>{navigator.geolocation.clearWatch(watcher)}
    //ab chalke index.js mein isse listen krte hai
  }, [userId]);

  return null;
};

export default GeoUpdater;

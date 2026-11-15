"use client";

import React, { useEffect, useState } from "react";

type PropsType = {
  pickup: string;
  drop: string;
  onChange: (p: string, d: string) => void;
  onDistance: (d: number) => void;
  onPickupLocationChange: (lat: number, lng: number) => void;
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
};

import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import axios from "axios";
import { color } from "framer-motion";

// ✅ FIX: RedirectCoords ko SearchMap ke bahar rakha hai
// kyunki ye khud ek React component hai aur iske andar useMap/useEffect use ho raha hai
const RedirectCoords = ({
  p1,
  d1,
}: {
  p1: [number, number];
  d1: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    map.fitBounds([p1, d1], {
      padding: [72, 72],
      maxZoom: 15,
      animate: true,
      duration: 1,
    }); //ye useeffect mein isliye hai kyunki jab jab p1 aur d1 mwin change hoga tab tab ye doobara chalega
  }, [p1, d1, map]);

  return null;
};

const SearchMap = ({
  pickup,
  drop,
  onChange,
  onDistance,
  onPickupLocationChange,
  pickupLat,
  pickupLng,
  dropLat,
  dropLng,
}: PropsType) => {
  const pickupIcon = new L.DivIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22))">

    <div style="
      background:#0a0a0a;color:#fff;
      padding:5px 14px;border-radius:100px;
      font-size:10px;font-weight:800;letter-spacing:0.14em;
      text-transform:uppercase;white-space:nowrap;
      font-family:-apple-system,system-ui,sans-serif;
      box-shadow:0 2px 12px rgba(0,0,0,0.25);
    ">PICKUP</div>

    <div style="width:2px;height:10px;background:#0a0a0a;opacity:0.4"></div>

    <div style="
      width:13px;height:13px;background:#0a0a0a;border-radius:50%;
      border:3px solid #fff;
      box-shadow:0 0 0 2px rgba(0,0,0,0.15), 0 3px 10px rgba(0,0,0,0.3);
    "></div>

  </div>`,
    className: "",
    iconSize: [70, 58], //70 w and 58 h,
    iconAnchor: [45, 55],
  });

  const dropIcon = new L.DivIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22))">

    <div style="
      background:#0a0a0a;color:#fff;
      padding:5px 14px;border-radius:100px;
      font-size:10px;font-weight:800;letter-spacing:0.14em;
      text-transform:uppercase;white-space:nowrap;
      font-family:-apple-system,system-ui,sans-serif;
      box-shadow:0 2px 12px rgba(0,0,0,0.25);
    ">Drop</div>

    <div style="width:2px;height:10px;background:#0a0a0a;opacity:0.4"></div>

    <div style="
      width:13px;height:13px;background:#0a0a0a;border-radius:50%;
      border:3px solid #fff;
      box-shadow:0 0 0 2px rgba(0,0,0,0.15), 0 3px 10px rgba(0,0,0,0.3);
    "></div>

  </div>`,
    className: "",
    iconSize: [70, 58], //70 w and 58 h,
    iconAnchor: [45, 55],
  });

  const [route, setRoute] = useState<[number, number][]>([]);
  //since loadroute ke andr hamare paas latitude aur longitude ki bhot saari arraye hai isliye iska ttype ye diya hai

  const [km, setKm] = useState<number | null>(0);
  const [mapLoading, setMapLoading] = useState(false);

  //ye loadRoute function hame path dega pickup se drop location tak ka jisse hum ek black line mark krste hai map mein from pickup to drop location
  //aur iss function ko ha, wahi neeche useffect mein call krdenge jisme ham p1 aur d1 setkrrhe the
  const loadRoute = async (p: [number, number], d: [number, number]) => {
    //is p aur d mein 0th index hai latitude aur 1st index hai longitude
    try {
      setMapLoading(true);

      const { data } = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${p[1]},${p[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`,
      );

      console.log(data);

      if (!data.routes.length) {
        setMapLoading(false);
        return;
      }

      setRoute(
        data.routes[0].geometry.coordinates.map(([lon, lat]: number[]) => [
          lat,
          lon,
        ]),
      ); //since coords ke andr joh array mil rahi thi usme pehle long tha fit lat tha but hame pehle lat chahiye tha fir lng toh isliye humne ye kiya

      const distKm = +(data.routes[0].distance / 1000).toFixed(2); //+ likhne se ye number bngya hai

      setKm(distKm);
      onDistance(distKm);

      setMapLoading(false);
    } catch (error) {
      console.log(error);
      setMapLoading(false);
    }
  };

  const [p1, setP1] = useState<[number, number]>();

  //ye p1 hamara pickup location hai aur ye do number ka array hoga pehle latitude aur doosra longitude

  const [d1, setD1] = useState<[number, number]>();

  // ✅ FIX: coordinates valid hain ya nahi properly check kar rahe hain
  useEffect(() => {
    setMapLoading(true);

    const setCoords = async () => {
      if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
        setMapLoading(false);
        return;
      }

      // setP1([pickupLat, pickupLng]);
      // setD1([dropLat, dropLng]); aise nahi krskte bhai
      // await loadRoute(p1!,d1!)

      const pickupCoords: [number, number] = [pickupLat, pickupLng];

      const dropCoords: [number, number] = [dropLat, dropLng];

      setP1(pickupCoords);
      setD1(dropCoords);

      await loadRoute(pickupCoords, dropCoords);
    };

    setCoords();
  }, [pickupLat, pickupLng, dropLat, dropLng]);

  const findAddressByLatAndLng = async (lat: number, lng: number) => {
    //isse hume drag krne ke baad joh naye lat aur lng aayenge unke basis pe naya address miljayega, abs isko jaake pickupDrag aur dropDrag mein call krde
    const { data } = await axios.get(
      `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`,
    );

    if (!data.features.length) return;
    const p = data.features[0].properties;

    return [p.name, p.street, p.city, p.state, p.country]
      .filter(Boolean)
      .join(",");
  };

  const pickupDrag = async (lat: number, lon: number) => {
    try {
      setMapLoading(true);
      const address = await findAddressByLatAndLng(lat, lon);
      onChange(address!, drop);
      onPickupLocationChange(lat, lon);
      setP1([lat, lon]);

      if (d1) {
        await loadRoute([lat, lon], d1);
      } else {
        setMapLoading(false);
      }
    } catch (error) {
      console.log(error);
      setMapLoading(false);
    }
  };

  const dropDrag = async (lat: number, lon: number) => {
    try {
      setMapLoading(true);
      const address = await findAddressByLatAndLng(lat, lon);
      onChange(pickup, address!);

      setD1([lat, lon]);

      if (p1) {
        await loadRoute(p1, [lat, lon]);
      } else {
        setMapLoading(false);
      }
    } catch (error) {
      console.log(error);
      setMapLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full bg-zinc-100">
      {mapLoading ? (
        <div className="flex h-full w-full items-center justify-center bg-zinc-100">
          <div className="flex min-w-[220px] flex-col items-center rounded-2xl border border-zinc-200 bg-white px-8 py-7 shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
              <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-zinc-200 border-t-zinc-900" />
            </div>

            <p className="text-sm font-semibold tracking-wide text-zinc-900">
              Loading Map
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Calculating route...
            </p>
          </div>
        </div>
      ) : (
        <MapContainer
          style={{ width: "100%", height: "100%" }}
          // center={[0, 0]} yeh map ke initial longitude aur latitude ko set krta hai
          // zoom={13} ye batata hai ki initially map kitna zoomed in hoga
          // ✅ FIX: actual map positioning RedirectCoords ka fitBounds karega
          center={[0, 0]}
          zoom={13}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Distance + Time Card */}
          {km !== null && (
            <div className="absolute bottom-5 left-5 z-[1000] flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white/95 px-5 py-3.5 shadow-xl backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Distance
                </span>

                <span className="mt-0.5 text-base font-bold text-zinc-900">
                  {km} km
                </span>
              </div>

              <div className="h-8 w-px bg-zinc-200" />

              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Est. Time
                </span>

                <span className="mt-0.5 text-base font-bold text-zinc-900">
                  ~{Math.max(3, Math.round(km / 25) * 60)}min
                </span>
              </div>
            </div>
          )}

          {/* ✅ FIX: jab pickup aur drop dono milenge tab map dono locations ko fit karega */}
          {p1 && d1 && <RedirectCoords p1={p1} d1={d1} />}

          <Marker
            position={p1!} //ye pickup ka marker hai
            icon={pickupIcon} //ye icon jaake dekh humne upar design kiya hai
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target.getLatLng();

                pickupDrag(m.lat, m.lng);
              },
            }}
          />

          <Marker
            position={d1!} //ye drop ka marker hai
            icon={dropIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                //iska mtlb hai ki jaha drop ko left kiya hai waha k lat aur lng dedo
                const m = e.target.getLatLng();

                dropDrag(m.lat, m.lng);
              },
            }}
          />

          {/*ab humare ko route milgaya hai jispe hume black line dikhani hai toh ab hum iss line ko dikhayenge */}
          {route?.length > 0 && (
            <>
              <Polyline
                positions={route}
                pathOptions={{
                  color: "#0a0a0a",
                  weight: 4,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </>
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default SearchMap;
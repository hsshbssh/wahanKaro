"use client";
import axios from "axios";
import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";

type Props = {
  driverPos: [number, number] | null;
  pickUp: [number, number] | null;
  drop: [number, number] | null;
  mapStatus: "arriving" | "ongoing" | "completed";
  onStats:(data:{
    distanceToPickUp:number | null,
    etaToPickUp:number | null,
    distanceToDrop:number | null,
    etaToDrop:number | null
  })=>void
};

type OSRMRoute = {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
};

const LiveRideMap = ({ driverPos, pickUp, drop, mapStatus,onStats }: Props) => {
  const [mapLoading, setMapLoading] = useState(false);
  const [routeToPickUp, setRouteToPickUp] = useState<[number, number][]>([]);
  const [routeToDrop, setRouteToDrop] = useState<[number, number][]>([]);
  const pickUpIcon = new L.DivIcon({
    html: `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.28))">
      <div style="background:#0a0a0a;color:#fff;padding:5px 13px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;white-space:nowrap;font-family:system-ui">
        PICKUP
      </div>
      <div style="width:2px;height:9px;background:#0a0a0a"></div>
      <div style="width:10px;height:10px;background:#0a0a0a;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>
    </div>
  `,
    className: "",
    iconSize: [70, 50],
    iconAnchor: [35, 50],
  });

  const dropIcon = new L.DivIcon({
    html: `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.28))">
      <div style="background:#0a0a0a;color:#fff;padding:5px 13px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;white-space:nowrap;font-family:system-ui">
        DROP
      </div>
      <div style="width:2px;height:9px;background:#0a0a0a"></div>
      <div style="width:10px;height:10px;background:#0a0a0a;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>
    </div>
  `,
    className: "",
    iconSize: [80, 50],
    iconAnchor: [40, 50],
  });

  const driverIcon = new L.DivIcon({
    html: `
    <div id="car-marker" style="
      width:52px;
      height:52px;
      display:flex;
      align-items:center;
      justify-content:center;
      transform-origin:center;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
      filter: drop-shadow(0 6px 18px rgba(0,0,0,0.5));
    ">
      <div style="
        background:#0a0a0a;
        width:46px;
        height:46px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 0 0 3px #fff, 0 0 0 5px #0a0a0a, 0 8px 28px rgba(0,0,0,0.5);
      ">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 11L6.5 6.5H17.5L19 11"
            stroke="white"
            stroke-width="1.6"
            stroke-linecap="round"
          />

          <rect
            x="3"
            y="11"
            width="18"
            height="7"
            rx="2"
            stroke="white"
            stroke-width="1.6"
          />

          <path
            d="M5 14H7M17 14H19"
            stroke="white"
            stroke-width="1.6"
            stroke-linecap="round"
          />

          <circle
            cx="7"
            cy="18"
            r="1"
            fill="white"
          />

          <circle
            cx="17"
            cy="18"
            r="1"
            fill="white"
          />
        </svg>
      </div>
    </div>
  `,
    className: "",
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });

  //yaha hum route banayenge ab
  useEffect(() => {
    if (!driverPos || !pickUp || !drop) return;
    const [pLat, pLng] = pickUp;
    const [dLat, dLng] = drop;
    const [drLat, drLng] = driverPos;
    let cancelled = false;

    //ab isme route banane wali api ko fetch krenege ek hi function mein taki isse multiple jagah use krske

    const getRoute = async (
      startLat: number,
      startLng: number,
      endLat: number,
      endLng: number,
    ): Promise<OSRMRoute | undefined> => {
      try {
        //route ko find karo
        const { data } = await axios.get<{ routes?: OSRMRoute[] }>(
          `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`,
        );

        //ab route ko return kardo
        return data.routes?.[0];
      } catch (error) {
        console.error("Failed to calculate ride route", error);
        return undefined;
      }
    };

    //ab routes ko fetch kro based on status
    const fetchRoutes = async () => {
      setMapLoading(true);
      try {
        let pickUpRoute;
        let dropRoute;

        if (mapStatus === "arriving") {
          //sabse pehle pickup route banayenge (driver->customer)
          pickUpRoute = await getRoute(drLat, drLng, pLat, pLng);

          //agla route hoga arriving ke case mien pickup locaton se dropLocation tak ka
          dropRoute = await getRoute(pLat, pLng, dLat, dLng);

          if (!cancelled && pickUpRoute) {
            setRouteToPickUp(
              pickUpRoute.geometry.coordinates.map(([lon, lat]) => [
                lat,
                lon,
              ]),
            );
          }
          if (!cancelled && dropRoute) {
            setRouteToDrop(
              dropRoute.geometry.coordinates.map(([lon, lat]) => [
                lat,
                lon,
              ]),
            );
          }

          if (!cancelled) {
            onStats?.({
              distanceToPickUp:(pickUpRoute?.distance ?? 0)/1000,
              etaToPickUp:(pickUpRoute?.duration ?? 0)/60,
              distanceToDrop:(dropRoute?.distance ?? 0)/1000,
              etaToDrop:(dropRoute?.duration ?? 0)/60
            });
          }
        } else {
          //agr status arriving nahi hai toh tu bas hame dropRoute dikhana hai
          setRouteToPickUp([]);

          dropRoute = await getRoute(drLat, drLng, dLat, dLng);
          if (!cancelled && dropRoute) {
            setRouteToDrop(
              dropRoute.geometry.coordinates.map(([lon, lat]) => [
                lat,
                lon,
              ]),
            );
          }

          if (!cancelled) {
            onStats?.({
              distanceToPickUp:0,
              etaToPickUp:0,
              distanceToDrop:(dropRoute?.distance ?? 0)/1000,
              etaToDrop:(dropRoute?.duration ?? 0)/60
            });
          }
        }
      } finally {
        if (!cancelled) {
          setMapLoading(false);
        }
      }
    };

    fetchRoutes();

    return () => {
      cancelled = true;
    };
  }, [driverPos, pickUp, drop, mapStatus, onStats]);

  //yaha kuch important states manage krni padegi hame ab
  const showPickUpMarker = mapStatus === "arriving";
  const showPickUpRoute = mapStatus === "arriving" && routeToPickUp.length > 0; //tabhi ye route show ho jab status arriving ho aur routeToPickUp ki length 0 se badi ho

  const showDropRoute = mapStatus !== "completed" && routeToDrop.length > 0;

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

            <p className="mt-1 text-xs text-zinc-400">Calculating route...</p>
          </div>
        </div>
      ) : (
        <MapContainer
          style={{ width: "100%", height: "100%" }}
          center={pickUp ?? [0, 0]} //center krdo hume PickUp location pe
          zoom={13}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ab mein chahta hu ki status jab arriving hai tab teeno markers dikhe but jab status kuch aur hai toh pickup marker na show ho */}

          {pickUp && showPickUpMarker && (
            <Marker position={pickUp} icon={pickUpIcon} draggable />
          )}

          {drop && <Marker position={drop} icon={dropIcon} draggable />}
          {driverPos && (
            <Marker position={driverPos} icon={driverIcon} draggable />
          )}

          {showDropRoute && (
            <Polyline
              positions={routeToDrop}
              pathOptions={{
                color: "#0a0a0a",
                weight: 4,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          )}
          {showPickUpRoute && (
            <Polyline
              positions={routeToPickUp}
              className="pickup-route"
              pathOptions={{
                color: "#888",
                weight: 4,
                lineCap: "butt",
                dashArray: "12 16",
              }}
            />
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default LiveRideMap;

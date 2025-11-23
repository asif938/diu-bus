import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

const BACKEND = "http://localhost:5000"; // change to your backend URL in production

const SendLocation = () => {
  const { busId } = useParams();
  const [running, setRunning] = useState(false);
  const [last, setLast] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const sendGPS = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const payload = {
            busId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            // lat: pos.coords.longitude,
            // lng: pos.coords.latitude,
          };
          await fetch(`${BACKEND}/api/update-location`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          setLast(new Date().toLocaleTimeString());
        } catch (err) {
          console.error("Send failed", err);
        }
      },
      (err) => {
        console.error("Position error", err);
      },
      { enableHighAccuracy: true }
    );
  };

  const start = () => {
    if (running) return;
    sendGPS();
    intervalRef.current = setInterval(sendGPS, 5000); // send every 5s
    setRunning(true);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 className="text-2xl font-bold mb-2">Send Location</h2>
      <p className="mb-2">Bus ID: <strong>{busId}</strong></p>

      <div className="flex gap-2">
        <button
          onClick={start}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start
        </button>
        <button
          onClick={stop}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Stop
        </button>
      </div>

      <p className="mt-4 text-gray-600">Keep this page open in the mobile browser. Background/sleep may stop GPS updates.</p>
      <p className="mt-2">Last sent: {last || "Not sent yet"}</p>
    </div>
  );
};

export default SendLocation;

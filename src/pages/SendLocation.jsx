import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// const BACKEND = "http://localhost:5000";
const BACKEND = "https://diu-transport-system-server.vercel.app";

const fetchBusInfo = async (busId) => {
  const res = await axios.get(`${BACKEND}/api/admin/buses/${busId}`);
  return res.data?.data;
};

const SendLocation = () => {
  const { busId } = useParams();
  const [running, setRunning] = useState(false);
  const [last, setLast] = useState(null);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  const { data: busInfo } = useQuery({
    queryKey: ['bus-info', busId],
    queryFn: () => fetchBusInfo(busId),
    enabled: !!busId,
  });

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const sendGPS = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported on this device.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setError(null);
          const payload = {
            busId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          
          const response = await fetch(`${BACKEND}/api/live-location`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to send location");
          }
          
          setLast(new Date().toLocaleTimeString());
          setCount(prev => prev + 1);
        } catch (err) {
          console.error("Send failed", err);
          setError(err.message || "Failed to send location");
        }
      },
      (err) => {
        console.error("Position error", err);
        setError(`GPS Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const start = () => {
    if (running) return;
    setError(null);
    setCount(0);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Bus List
        </Link>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Send Location</h2>
        
        {busInfo && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Bus Name</p>
            <p className="font-semibold text-lg">{busInfo.busName}</p>
            <p className="text-sm text-gray-600 mt-1">Bus Number</p>
            <p className="font-semibold">{busInfo.busNumber}</p>
            {busInfo.route && (
              <>
                <p className="text-sm text-gray-600 mt-1">Route</p>
                <p className="font-semibold">{busInfo.route}</p>
              </>
            )}
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Bus ID</p>
          <p className="font-mono text-lg font-semibold">{busId}</p>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={start}
            disabled={running}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
              running
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {running ? "Running..." : "Start Tracking"}
          </button>
          <button
            onClick={stop}
            disabled={!running}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
              !running
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            Stop
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-semibold ${running ? "text-green-600" : "text-gray-400"}`}>
              {running ? "● Active" : "○ Inactive"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last sent:</span>
            <span className="font-semibold">{last || "Not sent yet"}</span>
          </div>
          {running && (
            <div className="flex justify-between">
              <span className="text-gray-600">Updates sent:</span>
              <span className="font-semibold text-blue-600">{count}</span>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Keep this page open in your mobile browser. 
            Background mode or screen sleep may stop GPS updates. 
            Location is sent every 5 seconds when active.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SendLocation;

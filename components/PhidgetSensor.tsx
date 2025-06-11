// components/Phidget22Sensor.tsx
"use client";

import { useState, useCallback } from "react";
import Script from "next/script";

declare global {
  interface Window {
    phidget22?: any;
  }
}

export default function Phidget22Sensor() {
  const [status, setStatus] = useState<string>("Not connected");
  const [voltageData, setVoltageData] = useState<string>("--");

  // wrap init in useCallback so we can call it from a button
  const initPhidget = useCallback(async () => {
    setStatus("Connecting…");
    if (!window.phidget22) {
      console.warn("Phidget22 library not yet loaded");
      return;
    }

    try {
      // if you were using USBConnection it would be:
      // const conn = new window.phidget22.USBConnection();
      // but here we’ll stick with NetworkConnection
      const conn = new window.phidget22.USBConnection();
      await conn.connect();

      const input = new window.phidget22.VoltageRatioInput();
      input.onVoltageRatioChange = (ratio: number) => {
        setVoltageData(`VoltageRatio: ${ratio}`);
      };

      await input.open(5000);
      setStatus("Connected");
    } catch (err: any) {
      console.error("Phidget error:", err);
      setStatus(`⚠️ ${err.message}`);
    }
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* load the Phidget22 browser bundle */}
      <Script
        src="https://unpkg.com/phidget22@3.x/browser/phidget22.min.js"
        strategy="afterInteractive"
        onLoad={() => console.log("Phidget22 script loaded")}
      />

      <h1 className="text-xl font-bold">Phidget22 DAQ1500 Example</h1>

      <p>
        <strong>Status:</strong> {status}
      </p>

      {status !== "Connected" && (
        <button
          onClick={initPhidget}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Connect USB Device
        </button>
      )}

      <div>
        <strong>VoltageRatioChange Event:</strong>
        <pre className="mt-2 whitespace-pre-wrap">{voltageData}</pre>
      </div>
    </div>
  );
}

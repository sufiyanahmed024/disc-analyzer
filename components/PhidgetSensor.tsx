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

  const initPhidget = useCallback(async () => {
    setStatus("Waiting for USB device…");

    if (!window.phidget22) {
      console.warn("Phidget22 library not loaded yet");
      return;
    }

    try {
      const conn = new window.phidget22.NetworkConnection(8989, "localhost");
      await conn.connect();

      // 3) Now open your channel just like before
      const input = new window.phidget22.VoltageRatioInput();
      input.onVoltageRatioChange = (ratio: number) =>
        setVoltageData(`VoltageRatio: ${ratio}`);
      await input.open(5000);

      setStatus("Connected!");
    } catch (err: any) {
      console.error("USB Error:", err);
      setStatus(`⚠️ ${err.message}`);
    }
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* load the Phidget22 browser bundle */}
      <Script
        src="https://unpkg.com/phidget22@3.x/browser/phidget22.min.js"
        strategy="afterInteractive"
      />

      <h1 className="text-xl font-bold">Phidget22 DAQ1500 Example</h1>
      <p>
        <strong>Status:</strong> {status}
      </p>

      {/* must be a direct user gesture for WebUSB picker */}
      <button
        onClick={initPhidget}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Connect USB Device
      </button>

      <div>
        <strong>VoltageRatioChange Event:</strong>
        <pre className="mt-2 whitespace-pre-wrap">{voltageData}</pre>
      </div>
    </div>
  );
}

// components/Phidget22Sensor.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

// 1) Tell TS about window.phidget22
declare global {
  interface Window {
    phidget22?: any;
  }
}

export default function Phidget22Sensor() {
  const [status, setStatus] = useState<string>("Connecting...");
  const [voltageData, setVoltageData] = useState<string>("--");

  useEffect(() => {
    const initPhidget = async () => {
      if (!window.phidget22) return;

      try {
        const conn = new window.phidget22.NetworkConnection(8989, "localhost");
        await conn.connect();

        const input = new window.phidget22.VoltageRatioInput();

        // 3) Give `ratio` a type
        input.onVoltageRatioChange = (ratio: number) => {
          setVoltageData(`VoltageRatio: ${ratio}`);
        };

        await input.open(5000);
        setStatus("Connected");
      } catch (err: any) {
        // 4) Narrow catch type so you can use err.message
        console.error("Phidget error:", err);
        setStatus(`⚠️ ${err.message}`);
      }
    };

    initPhidget();
  }, []);

  return (
    <div>
      {/* load the Phidget22 browser bundle */}
      <Script
        src="https://unpkg.com/phidget22@3.x/browser/phidget22.min.js"
        strategy="afterInteractive"
      />

      <h1>Phidget22 DAQ1500 Example</h1>
      <p><strong>Status:</strong> {status}</p>
      <p>
        <strong>VoltageRatioChange Event:</strong><br />
        <pre style={{ whiteSpace: "pre-wrap" }}>{voltageData}</pre>
      </p>
    </div>
  );
}

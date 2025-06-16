"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    phidget22?: any;
  }
}

export default function Phidget22Sensor() {
  //Initial State
  const [status, setStatus] = useState<string>("Not connected");
  const [voltageRatio, setVoltageRatio] = useState<number>(0);
  const [weightDisplay, setWeightDisplay] = useState<string>("-- g");

  // Calibration state
  const [tareOffset, setTareOffset] = useState<number>(0);
  const [calibrationFactor, setCalibrationFactor] = useState<number>(1);
  const [knownMass, setKnownMass] = useState<number>(100);
  const [vrAtKnownMass, setVrAtKnownMass] = useState<number>(0);

  //Connection References
  const connRef  = useRef<any>(null);
  const inputRef = useRef<any>(null);

  //Initialize Callback
  const initPhidget = useCallback(async () => {
    setStatus("Requesting USB access…");
    if (!window.phidget22) {
      console.warn("Phidget22 library not loaded yet");
      return;
    }

    try {
      //Create USB connection
      const conn = new window.phidget22.USBConnection();
      connRef.current = conn;

      
      await conn.connect();
      
      //Triggers browser picker
      await conn.requestWebUSBDeviceAccess();

      

      setStatus("Connected, opening channel…");
      const input = new window.phidget22.VoltageRatioInput();
      input.onVoltageRatioChange = (vr: number) => {
        setVoltageRatio(vr);
      };
      inputRef.current = input;

      await input.open(5000);
      setStatus("Channel open — streaming data!");
    } catch (err: any) {
      console.error("Phidget USB error:", err);
      setStatus(`⚠️ ${err.message}`);
    }
  }, []);

  // Convert VR to grams using tareOffset and calibrationFactor
  useEffect(() => {
    const grams = (voltageRatio - tareOffset) * calibrationFactor;
    setWeightDisplay(`${grams.toFixed(1)} g`);
  }, [voltageRatio, tareOffset, calibrationFactor]);

  // Tare handler
  const handleTare = () => {
    setTareOffset(voltageRatio);
  };

  // Calibration handler: assumes user placed knownMass on scale
  const handleCalibrate = () => {
    const span = voltageRatio - tareOffset;
    if (span <= 0) {
      alert("Invalid span. Make sure known mass is on the scale after taring.");
      return;
    }
    setVrAtKnownMass(voltageRatio);
    setCalibrationFactor(knownMass / span);
  };

  return (
    <div className="p-4 space-y-4">
      <Script
        src="https://unpkg.com/phidget22@3.x/browser/phidget22.min.js"
        strategy="afterInteractive"
      />

      <h1 className="text-xl font-bold">Phidget22 Scale with Tare & Calibration</h1>

      <p><strong>Status:</strong> {status}</p>
      {status !== "Connected" && (
        <button
          onClick={initPhidget}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Connect Scale
        </button>
      )}

      <div>
        <strong>Raw VoltageRatio:</strong> {voltageRatio.toFixed(6)}
      </div>
      <div>
        <strong>Weight:</strong> {weightDisplay}
      </div>

      <div className="space-y-2">
        <button
          onClick={handleTare}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Tare (Zero)
        </button>
        <div>
          <label className="block text-sm font-medium">Known Mass (g):</label>
          <input
            type="number"
            value={knownMass}
            onChange={(e) => setKnownMass(parseFloat(e.target.value))}
            className="mt-1 p-2 border rounded w-24"
          />
          <button
            onClick={handleCalibrate}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Calibrate
          </button>
        </div>
        <div>
          <small>
            <strong>Calibration VR at mass:</strong> {vrAtKnownMass.toFixed(6)}
          </small>
        </div>
      </div>
    </div>
  );
}

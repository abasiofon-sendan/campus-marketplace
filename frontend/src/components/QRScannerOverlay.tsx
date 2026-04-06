"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface QRScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  orderData?: { id: string; status: string };
}

export default function QRScannerOverlay({
  isOpen,
  onClose,
  onScanSuccess,
  orderData,
}: QRScannerOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanState, setScanState] = useState<
    "scanning" | "success" | "error" | "no-camera"
  >("scanning");
  const [cameraReady, setCameraReady] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch {
      setScanState("no-camera");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setScanState("scanning");
      setIsClosing(false);
      startCamera();

      // Simulate a successful scan after 4 seconds (demo only — replace with real QR decode)
      const timer = setTimeout(() => {
        setScanState("success");
        const data = orderData
          ? JSON.stringify(orderData)
          : "DEMO_QR_DATA";
        setTimeout(() => {
          onScanSuccess(data);
        }, 1200);
      }, 4000);

      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera, onScanSuccess, orderData]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      stopCamera();
      onClose();
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${isClosing ? "opacity-0" : "animate-scannerFadeIn"}`}
    >
      {/* Camera feed background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />

      {/* Dark overlay with cutout via CSS masks */}
      <div className="absolute inset-0" style={overlayMaskStyle} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-[env(safe-area-inset-top,16px)] pb-4 z-10">
        <div />
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white text-xl hover:bg-white/20 transition-all active:scale-90"
          aria-label="Close scanner"
        >
          ✕
        </button>
      </div>

      {/* Instruction text */}
      <div className="absolute top-[18%] sm:top-[15%] left-0 right-0 flex flex-col items-center z-10 pointer-events-none">
        <p className="text-white/90 text-base sm:text-lg font-medium tracking-wide drop-shadow-lg">
          Point your camera at a QR code
        </p>
        <p className="text-white/50 text-xs sm:text-sm mt-1">
          The code will be scanned automatically
        </p>
      </div>

      {/* Viewfinder */}
      <div className="relative w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] z-10 animate-viewfinderIn">
        {/* Corner brackets */}
        <Corner position="top-left" state={scanState} />
        <Corner position="top-right" state={scanState} />
        <Corner position="bottom-left" state={scanState} />
        <Corner position="bottom-right" state={scanState} />

        {/* Scan line */}
        {scanState === "scanning" && cameraReady && (
          <div className="absolute left-2 right-2 h-[2px] animate-scanLine z-20">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-[#34D399] to-transparent rounded-full shadow-[0_0_12px_2px_rgba(52,211,153,0.5)]" />
          </div>
        )}

        {/* Success overlay */}
        {scanState === "success" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center animate-scannerFadeIn">
            <div className="absolute inset-0 rounded-2xl bg-[#34D399]/15 animate-scanSuccess" />
            <div className="w-16 h-16 rounded-full bg-[#34D399] flex items-center justify-center shadow-[0_0_30px_8px_rgba(52,211,153,0.4)] animate-scannerFadeIn">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-white font-semibold mt-4 text-sm drop-shadow-lg">
              QR Code captured!
            </p>
          </div>
        )}

        {/* No camera fallback */}
        {scanState === "no-camera" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 animate-scannerFadeIn">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16.5 7.5V6a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v1.5" />
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <circle cx="12" cy="14" r="3" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </div>
            <p className="text-white/80 text-sm font-medium">Camera unavailable</p>
            <p className="text-white/40 text-xs text-center px-6">
              Allow camera access or check your device settings
            </p>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-[12%] left-0 right-0 flex justify-center z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md">
          <div className={`w-2 h-2 rounded-full ${scanState === "scanning" ? "bg-[#34D399] animate-pulse" : scanState === "success" ? "bg-[#34D399]" : "bg-red-400"}`} />
          <span className="text-white/70 text-xs font-medium">
            {scanState === "scanning"
              ? "Scanning..."
              : scanState === "success"
                ? "Captured"
                : "No camera"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Corner bracket sub-component ─── */

function Corner({
  position,
  state,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  state: "scanning" | "success" | "error" | "no-camera";
}) {
  const size = 36;
  const thickness = 3;
  const color = state === "success" ? "#34D399" : "#ffffff";

  const positionClasses: Record<string, string> = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  const borderClasses: Record<string, string> = {
    "top-left": "border-t border-l rounded-tl-xl",
    "top-right": "border-t border-r rounded-tr-xl",
    "bottom-left": "border-b border-l rounded-bl-xl",
    "bottom-right": "border-b border-r rounded-br-xl",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} ${borderClasses[position]} animate-cornerPulse transition-colors duration-500`}
      style={{
        width: size,
        height: size,
        borderColor: color,
        borderWidth: thickness,
        filter: state === "success" ? `drop-shadow(0 0 8px ${color})` : `drop-shadow(0 0 4px rgba(255,255,255,0.3))`,
      }}
    />
  );
}

/* ─── Overlay mask style (dark bg with transparent cutout) ─── */

const viewfinderSize = 280;
const overlayMaskStyle: React.CSSProperties = {
  background: "rgba(0, 0, 0, 0.65)",
  maskImage: `
    radial-gradient(
      circle at center,
      transparent ${viewfinderSize / 2 - 20}px,
      black ${viewfinderSize / 2 + 10}px
    )
  `,
  WebkitMaskImage: `
    radial-gradient(
      circle at center,
      transparent ${viewfinderSize / 2 - 20}px,
      black ${viewfinderSize / 2 + 10}px
    )
  `,
};

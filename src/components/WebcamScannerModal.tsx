'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

interface WebcamScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, dataUrl: string) => void;
}

export const WebcamScannerModal: React.FC<WebcamScannerModalProps> = ({
  isOpen,
  onClose,
  onCapture
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  // Stop active video tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Request camera and initialize video stream
  const startCamera = useCallback(async (deviceId?: string) => {
    stopStream();
    setErrorMessage(null);
    setHasPermission(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setErrorMessage('Your browser or operating system does not support webcam video streaming.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Enumerate camera devices for switching
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setAvailableDevices(videoInputs);
      if (!deviceId && videoInputs.length > 0) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (err: any) {
      console.warn('Webcam access error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Camera permission was denied. Please click the camera/lock icon in your browser address bar to allow access.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera or webcam was found on your device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage('Your webcam is currently being used by another application (e.g. Zoom or Teams).');
      } else {
        setErrorMessage(err.message || 'Unable to access your camera.');
      }
    }
  }, [stopStream]);

  // Start on open, stop on close
  useEffect(() => {
    if (isOpen) {
      setCapturedPreview(null);
      startCamera();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Switch between cameras
  const handleSwitchCamera = () => {
    if (availableDevices.length <= 1) return;
    const currentIndex = availableDevices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % availableDevices.length;
    const nextDevice = availableDevices[nextIndex];
    setSelectedDeviceId(nextDevice.deviceId);
    startCamera(nextDevice.deviceId);
  };

  // Take snap frame
  const handleSnap = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw image from video
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedPreview(dataUrl);
    }
    setIsCapturing(false);
  };

  // Confirm capture and pass back
  const handleConfirmCapture = () => {
    if (!capturedPreview) return;

    // Convert dataUrl to File
    const arr = capturedPreview.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], `webcam-scan-${Date.now()}.jpg`, { type: mime });

    stopStream();
    onCapture(file, capturedPreview);
    onClose();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPreview(null);
    if (videoRef.current && streamRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Live Webcam Document Scanner
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  PC & Mobile
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Hold prescription or lab report steady in front of your camera
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[380px]">
          {/* Permission Denied / Error State */}
          {hasPermission === false && (
            <div className="p-8 text-center max-w-md space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Camera Access Blocked</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {errorMessage || 'Camera permission was not granted by your browser.'}
              </p>
              <div className="p-3 bg-slate-800/80 rounded-xl text-xs text-slate-400 text-left border border-slate-700">
                <span className="font-semibold text-teal-400">How to fix in Chrome/Edge:</span>
                <ol className="list-decimal pl-4 mt-1 space-y-1">
                  <li>Click the camera icon on the right or left of the address bar.</li>
                  <li>Select <strong>Always allow team-bread.vercel.app to access your camera</strong>.</li>
                  <li>Click the button below to retry.</li>
                </ol>
              </div>
              <button
                onClick={() => startCamera(selectedDeviceId)}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm transition shadow-xs"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading / Requesting State */}
          {hasPermission === null && (
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-300">
                Requesting camera permission...
              </p>
            </div>
          )}

          {/* Live Video Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full max-h-[500px] object-cover transition-opacity duration-300 ${
              hasPermission && !capturedPreview ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          />

          {/* Captured Image Freeze Frame */}
          {capturedPreview && (
            <img
              src={capturedPreview}
              alt="Captured document"
              className="w-full h-full max-h-[500px] object-contain bg-black"
            />
          )}

          {/* Document Framing Overlay (Only shown during active video) */}
          {hasPermission && !capturedPreview && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              {/* Document Target Border */}
              <div className="relative w-full max-w-md aspect-[4/3] border-2 border-dashed border-teal-500/60 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                {/* Corner markers */}
                <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />

                {/* Central guide watermark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold px-3 py-1 bg-slate-900 text-teal-300 rounded-full border border-slate-700">
                    Align Document Here
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          {/* Switch Camera if multiple */}
          <div className="flex items-center gap-2">
            {availableDevices.length > 1 && !capturedPreview && (
              <button
                onClick={handleSwitchCamera}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
                title="Switch webcam"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Switch Camera ({availableDevices.length})
              </button>
            )}
          </div>

          {/* Capture Controls */}
          {capturedPreview ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition"
              >
                Retake Photo
              </button>
              <button
                onClick={handleConfirmCapture}
                className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition"
              >
                <CheckCircle className="w-4 h-4" />
                Use Document
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSnap}
                disabled={!hasPermission || isCapturing}
                className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2 shadow-xs transition"
              >
                <Camera className="w-4 h-4" />
                Snap Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

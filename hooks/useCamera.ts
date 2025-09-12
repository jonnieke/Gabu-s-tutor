
import { useState, useEffect, useCallback, useRef } from 'react';

type FacingMode = 'environment' | 'user';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [supportsTorch, setSupportsTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number } | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const applyTrackCapabilities = useCallback((mediaStream: MediaStream) => {
    const track = mediaStream.getVideoTracks()[0];
    const capabilities: any = (track as any).getCapabilities ? (track as any).getCapabilities() : {};
    const settings: any = track.getSettings ? track.getSettings() : {};

    if (capabilities && 'torch' in capabilities) {
      setSupportsTorch(true);
      setIsTorchOn(Boolean((settings && settings.torch) || false));
    } else {
      setSupportsTorch(false);
      setIsTorchOn(false);
    }

    if (capabilities && 'zoom' in capabilities) {
      const min = capabilities.zoom?.min ?? 1;
      const max = capabilities.zoom?.max ?? 1;
      const step = capabilities.zoom?.step ?? 0.1;
      setZoomRange({ min, max, step });
      const currentZoom = settings.zoom ?? min;
      setZoom(currentZoom);
    } else {
      setZoomRange(null);
      setZoom(null);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        return;
      }
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      applyTrackCapabilities(mediaStream);
    } catch (err) {
      console.error("Camera access error:", err);
      if (err instanceof Error) {
        if ((err as any).name === 'NotAllowedError' || (err as any).name === 'PermissionDeniedError') {
          setError('Camera permission was denied. Please click the address bar lock icon and allow camera access, then try again.');
        } else if ((err as any).name === 'NotFoundError' || (err as any).name === 'DevicesNotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Could not access the camera.');
        }
      } else {
        setError('An unknown error occurred while accessing the camera.');
      }
    }
  }, [applyTrackCapabilities, facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setSupportsTorch(false);
      setIsTorchOn(false);
      setZoomRange(null);
      setZoom(null);
    }
  }, []);

  const switchCamera = useCallback(async () => {
    const next: FacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    // Restart stream with new facing mode
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStream(null);
    }
    await startCamera();
  }, [facingMode, startCamera]);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current || !supportsTorch) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      // torch is non-standard; use advanced constraints with any cast
      await (track as any).applyConstraints({ advanced: [{ torch: !isTorchOn }] });
      setIsTorchOn((prev) => !prev);
    } catch (e) {
      console.warn('Torch toggle not supported on this device.', e);
    }
  }, [supportsTorch, isTorchOn]);

  const setZoomLevel = useCallback(async (value: number) => {
    if (!streamRef.current || !zoomRange) return;
    const clamped = Math.min(Math.max(value, zoomRange.min), zoomRange.max);
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({ advanced: [{ zoom: clamped }] });
      setZoom(clamped);
    } catch (e) {
      console.warn('Zoom not supported on this device.', e);
    }
  }, [zoomRange]);

  useEffect(() => {
    // Cleanup function to stop the camera when the component unmounts
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stopCamera();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [stopCamera]);

  return {
    stream,
    error,
    startCamera,
    stopCamera,
    switchCamera,
    facingMode,
    supportsTorch,
    isTorchOn,
    toggleTorch,
    zoomRange,
    zoom,
    setZoomLevel,
  };
};

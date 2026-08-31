import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Sparkles,
  UploadCloud,
  Layers,
  Timer,
  AlertCircle,
  HelpCircle,
  Info,
  Maximize2,
  ChevronRight,
  Sun,
  Flame,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import { SAMPLE_MEALS, SampleMeal } from '../data/sampleFoods';
import { MealAnalysisResult } from '../types';
import { voiceService } from '../services/voiceAssistant';

interface WebcamScannerProps {
  onAnalyzeImage: (imageDataUrl: string, notes?: string, referenceScale?: string) => Promise<void>;
  onSelectSample: (sample: SampleMeal) => void;
  isAnalyzing: boolean;
  onOpenVoiceAssist?: () => void;
}

type GuideOverlay = 'plate' | 'quadrant' | 'hand' | 'grid' | 'none';

export const WebcamScanner: React.FC<WebcamScannerProps> = ({
  onAnalyzeImage,
  onSelectSample,
  isAnalyzing,
  onOpenVoiceAssist,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const voiceRecognitionRef = useRef<any>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [guideOverlay, setGuideOverlay] = useState<GuideOverlay>('plate');
  const [timerDuration, setTimerDuration] = useState<number>(0); // 0 = instant, 3 = 3s
  const [countdown, setCountdown] = useState<number | null>(null);
  const [userNotes, setUserNotes] = useState<string>('');
  const [referenceScale, setReferenceScale] = useState<string>('Standard 9-inch Plate');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [brightnessBoost, setBrightnessBoost] = useState<boolean>(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState<boolean>(false);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [isVoiceCaptureActive, setIsVoiceCaptureActive] = useState<boolean>(false);
  const [voiceHeardPrompt, setVoiceHeardPrompt] = useState<string | null>(null);

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Play synthetic camera shutter beep
  const playShutterSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // Audio not permitted or not supported
    }
  }, []);

  // Enumerate video input devices
  const getCameraDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevs);
      if (videoDevs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevs[0].deviceId);
      }
    } catch (err) {
      console.warn('Could not enumerate media devices:', err);
    }
  }, [selectedDeviceId]);

  // Robust multi-tier camera starter
  const startCamera = useCallback(async (deviceId?: string) => {
    setCameraError(null);
    setIsStartingCamera(true);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Webcam API is not supported in this browser environment. You can use the Native Camera Capture button or upload food photos directly.'
      );
      setIsCameraActive(false);
      setIsStartingCamera(false);
      return;
    }

    let newStream: MediaStream | null = null;
    let lastError: any = null;

    // Attempt 1: Target specific selected deviceId if requested
    if (deviceId) {
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err1) {
        console.warn('Attempt 1 (specific deviceId) failed, trying fallback...', err1);
        lastError = err1;
      }
    }

    // Attempt 2: Standard ideal 720p resolution with soft constraints
    if (!newStream) {
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err2) {
        console.warn('Attempt 2 (ideal resolution) failed, trying universal video: true fallback...', err2);
        lastError = err2;
      }
    }

    // Attempt 3: Universal unconstrained video: true (works on any webcam, USB cam, virtual cam)
    if (!newStream) {
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (err3) {
        console.warn('Attempt 3 (unconstrained video: true) failed:', err3);
        lastError = err3;
      }
    }

    setIsStartingCamera(false);

    if (newStream) {
      setStream(newStream);
      setIsCameraActive(true);
      setCameraError(null);

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch((playErr) => {
          console.warn('Video element play error:', playErr);
        });
      }

      await getCameraDevices();
    } else {
      setIsCameraActive(false);
      const isPermissionDenied =
        lastError?.name === 'NotAllowedError' ||
        lastError?.name === 'PermissionDeniedError' ||
        (lastError?.message && lastError.message.toLowerCase().includes('permission denied')) ||
        (lastError?.message && lastError.message.toLowerCase().includes('not allowed'));

      const isNotFound =
        lastError?.name === 'NotFoundError' ||
        lastError?.name === 'DevicesNotFoundError';

      const isNotReadable =
        lastError?.name === 'NotReadableError' ||
        lastError?.name === 'TrackStartError';

      if (isPermissionDenied) {
        setCameraError(
          'Camera access was blocked by browser permissions. Click the lock/camera icon in your address bar to allow camera, or use the Native Camera button / photo upload below.'
        );
      } else if (isNotFound) {
        setCameraError('No webcam hardware detected on this machine. You can upload food pictures or test with demo meals.');
      } else if (isNotReadable) {
        setCameraError('Webcam is currently occupied by another program (like Zoom or Teams) or unavailable. Please close other camera apps and retry.');
      } else {
        setCameraError(
          lastError?.message
            ? `Camera error: ${lastError.message}. You can capture photos using your phone/device camera or upload an image.`
            : 'Unable to start camera stream. Use native camera capture or image upload.'
        );
      }
    }
  }, [stream, getCameraDevices]);

  // Keep video element synchronized with active stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('Auto-play prevented:', err);
      });
    }
  }, [stream, isCameraActive]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  // Auto-initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle device change
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeviceId = e.target.value;
    setSelectedDeviceId(newDeviceId);
    startCamera(newDeviceId);
  };

  // Perform Capture
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    if (brightnessBoost) {
      ctx.filter = 'brightness(1.15) contrast(1.05)';
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    playShutterSound();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onAnalyzeImage(dataUrl, userNotes, referenceScale);
  }, [isMirrored, brightnessBoost, playShutterSound, onAnalyzeImage, userNotes, referenceScale]);

  // Trigger capture with timer
  const handleTriggerCapture = useCallback(() => {
    if (isAnalyzing) return;

    if (timerDuration > 0) {
      setCountdown(timerDuration);
      let count = timerDuration;
      const interval = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(interval);
          setCountdown(null);
          captureFrame();
        } else {
          setCountdown(count);
        }
      }, 1000);
    } else {
      captureFrame();
    }
  }, [isAnalyzing, timerDuration, captureFrame]);

  // Hands-free Voice Capture Listener
  const toggleVoiceCapture = () => {
    if (isVoiceCaptureActive) {
      if (voiceRecognitionRef.current) {
        try {
          voiceRecognitionRef.current.stop();
        } catch (e) {}
        voiceRecognitionRef.current = null;
      }
      setIsVoiceCaptureActive(false);
      setVoiceHeardPrompt(null);
      return;
    }

    if (!voiceService.isSpeechRecognitionAvailable()) {
      alert('Speech recognition is not supported in this browser. Try Chrome/Edge for hands-free voice commands.');
      return;
    }

    try {
      const rec = voiceService.createRecognition(
        (transcript) => {
          setVoiceHeardPrompt(transcript);
          const cmd = voiceService.parseCommand(transcript);
          if (cmd.action === 'capture') {
            setVoiceHeardPrompt('Captured via voice!');
            if (voiceService.isTTSAvailable()) {
              voiceService.speak('Capturing food plate now!');
            }
            handleTriggerCapture();
          }
        },
        (err) => {
          console.warn('Voice capture listener error:', err);
          setIsVoiceCaptureActive(false);
        },
        () => {
          // If ended and still active, restart continuous listening
          if (isVoiceCaptureActive && voiceRecognitionRef.current) {
            try {
              voiceRecognitionRef.current.start();
            } catch (e) {}
          }
        },
        true
      );

      if (rec) {
        voiceRecognitionRef.current = rec;
        rec.start();
        setIsVoiceCaptureActive(true);
        setVoiceHeardPrompt('Listening... Say "Capture" or "Cheese" to snap');
      }
    } catch (e) {
      console.warn('Voice recognition setup error:', e);
      setIsVoiceCaptureActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (voiceRecognitionRef.current) {
        try {
          voiceRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Spacebar keydown to capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isCameraActive && !isAnalyzing && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleTriggerCapture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCameraActive, isAnalyzing, handleTriggerCapture]);

  // File Upload Handlers
  const handleFileUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onAnalyzeImage(dataUrl, userNotes, referenceScale);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Viewport & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Webcam Viewfinder & Framing Overlay (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Viewfinder Container */}
          <div
            className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden group select-none"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {/* Live Video Feed (Always mounted to guarantee reliable stream binding) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-all duration-300 ${
                !isCameraActive ? 'opacity-0 absolute inset-0 pointer-events-none' : 'opacity-100'
              } ${isMirrored ? 'scale-x-[-1]' : ''} ${
                brightnessBoost ? 'brightness-110 contrast-105' : ''
              }`}
            />

            {/* Inactive or Permission Blocked Overlay */}
            {!isCameraActive && (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 backdrop-blur-md z-30">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-1">
                  Camera Feed Not Active
                </h3>
                <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed">
                  {cameraError ||
                    'Click "Start Camera" below and allow camera permissions in your browser prompt.'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-lg mb-3">
                  <button
                    onClick={() => startCamera(selectedDeviceId)}
                    disabled={isStartingCamera}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isStartingCamera ? 'animate-spin' : ''}`} />
                    <span>{isStartingCamera ? 'Starting Camera...' : 'Start / Retry Camera'}</span>
                  </button>

                  <button
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/20 transition cursor-pointer"
                    title="Opens native camera app on phones, tablets, or supported PCs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Photo (Device Camera)</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload Image</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                  <button
                    onClick={() => setShowTroubleshoot(true)}
                    className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Camera Permission Help</span>
                  </button>
                  {isIframe && (
                    <>
                      <span>•</span>
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Open in New Tab</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center z-40 animate-in fade-in duration-200">
                <span className="text-8xl font-black text-emerald-400 font-mono animate-bounce drop-shadow-[0_0_25px_rgba(52,211,153,0.8)]">
                  {countdown}
                </span>
                <span className="text-sm font-semibold text-slate-200 mt-2">
                  Hold food steady in frame...
                </span>
              </div>
            )}

            {/* AI Analyzing Spinner Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center z-40 space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-base font-bold text-white tracking-wide">
                    Gemini AI Vision Analyzing Food...
                  </h4>
                  <p className="text-xs text-emerald-300 font-mono">
                    Segmenting portions • Estimating weights • Calculating macros
                  </p>
                </div>
              </div>
            )}

            {/* Drag and drop hover indicator */}
            {dragActive && (
              <div className="absolute inset-0 bg-emerald-950/90 border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center z-50">
                <UploadCloud className="w-16 h-16 text-emerald-400 animate-bounce mb-2" />
                <span className="text-base font-bold text-white">Drop food photo here to scan</span>
              </div>
            )}

            {/* Camera Overlays */}
            {isCameraActive && guideOverlay === 'plate' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[68%] aspect-square rounded-full border-2 border-dashed border-emerald-400/70 shadow-[0_0_30px_rgba(52,211,153,0.15)] flex flex-col items-center justify-center relative">
                  <div className="absolute top-4 px-2.5 py-0.5 rounded-full bg-slate-950/80 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                    Fit Standard Plate (9-10")
                  </div>
                  <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 absolute top-2 left-2" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 absolute top-2 right-2" />
                  <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 absolute bottom-2 left-2" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 absolute bottom-2 right-2" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
                </div>
              </div>
            )}

            {isCameraActive && guideOverlay === 'quadrant' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="w-[72%] aspect-square rounded-full border-2 border-emerald-400/80 grid grid-cols-2 grid-rows-2 relative bg-slate-950/10">
                  <div className="border-r border-b border-emerald-400/50 p-3 flex flex-col justify-start">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-[10px] font-bold text-emerald-300 w-fit">
                      1/2 Veggies & Salad
                    </span>
                  </div>
                  <div className="border-b border-emerald-400/50 p-3 flex flex-col justify-start">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-[10px] font-bold text-emerald-300 w-fit">
                      1/2 Veggies & Salad
                    </span>
                  </div>
                  <div className="border-r border-emerald-400/50 p-3 flex flex-col justify-end">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/90 text-[10px] font-bold text-cyan-300 w-fit">
                      1/4 Lean Protein
                    </span>
                  </div>
                  <div className="p-3 flex flex-col justify-end">
                    <span className="px-2 py-0.5 rounded bg-amber-950/90 text-[10px] font-bold text-amber-300 w-fit">
                      1/4 Complex Carbs
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isCameraActive && guideOverlay === 'hand' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-around p-6 bg-slate-950/20">
                <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-center">
                  <span className="text-xl">✋</span>
                  <p className="text-[11px] font-bold text-cyan-300">Palm = Protein</p>
                  <p className="text-[9px] text-slate-400">~20-30g protein (100-150g)</p>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-center">
                  <span className="text-xl">✊</span>
                  <p className="text-[11px] font-bold text-emerald-300">Fist = Veggies / Grains</p>
                  <p className="text-[9px] text-slate-400">~1 cup volume (150g)</p>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-center">
                  <span className="text-xl">👍</span>
                  <p className="text-[11px] font-bold text-amber-300">Thumb = Fats/Oils</p>
                  <p className="text-[9px] text-slate-400">~1 tbsp / 14g (120 kcal)</p>
                </div>
              </div>
            )}

            {isCameraActive && guideOverlay === 'grid' && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div />
              </div>
            )}

            {/* Quick Status Bar on Top Left of Camera */}
            <div className="absolute top-3 left-3 flex items-center space-x-2 pointer-events-auto">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300">
                <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="font-semibold">{isCameraActive ? 'Live PC Webcam' : 'Camera Off'}</span>
              </div>
              <span className="hidden sm:inline-block px-2 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-400">
                HotKey: [SPACE]
              </span>
              {isVoiceCaptureActive && (
                <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-rose-950/90 border border-rose-600/60 text-[10px] font-bold text-rose-300 animate-pulse">
                  <Mic className="w-3 h-3 text-rose-400" />
                  <span>Say "Cheese" or "Capture"</span>
                </div>
              )}
            </div>

            {/* Camera Options Bar on Top Right */}
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 pointer-events-auto">
              <button
                onClick={() => setIsMirrored(!isMirrored)}
                className={`p-1.5 rounded-lg text-xs font-semibold backdrop-blur-md border transition ${
                  isMirrored ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
                title="Mirror camera"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBrightnessBoost(!brightnessBoost)}
                className={`p-1.5 rounded-lg text-xs font-semibold backdrop-blur-md border transition ${
                  brightnessBoost ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
                title="Enhance food lighting"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary Viewfinder Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            {/* Guide Selector */}
            <div className="flex items-center space-x-1">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center">
                <Layers className="w-3 h-3 mr-1 text-emerald-400" /> Guide:
              </span>
              {(['plate', 'quadrant', 'hand', 'none'] as GuideOverlay[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setGuideOverlay(mode)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize transition ${
                    guideOverlay === mode
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-950/60'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Timer Toggle */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center">
                <Timer className="w-3 h-3 mr-1 text-teal-400" /> Delay:
              </span>
              <button
                onClick={() => setTimerDuration(0)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                  timerDuration === 0 ? 'bg-slate-700 text-white' : 'text-slate-400 bg-slate-950/60'
                }`}
              >
                Instant
              </button>
              <button
                onClick={() => setTimerDuration(3)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                  timerDuration === 3 ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-950/60'
                }`}
              >
                3s Timer
              </button>
            </div>

            {/* Hands-Free Voice Trigger Toggle */}
            <button
              onClick={toggleVoiceCapture}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                isVoiceCaptureActive
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-950/80 border-slate-700 text-slate-300 hover:text-emerald-300'
              }`}
              title="Speak 'Cheese' or 'Capture' to take a photo without touching keyboard or mouse"
            >
              {isVoiceCaptureActive ? <Mic className="w-3.5 h-3.5 text-rose-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isVoiceCaptureActive ? 'Voice Snap: ON' : 'Hands-Free Voice'}</span>
            </button>

            {/* Big Capture Button or Upload/Demo Button */}
            {isCameraActive ? (
              <button
                onClick={handleTriggerCapture}
                disabled={isAnalyzing}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-slate-950" />
                <span>Capture & Analyze Portion</span>
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all transform active:scale-95 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-slate-950" />
                <span>Upload Food Photo to Scan</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Scan Settings, Context Input & Upload Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Context & Custom Notes */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Portion Scale & Notes
              </h3>
              <span className="text-[10px] text-slate-400">Optional Context</span>
            </div>

            {/* Reference Scale Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Plate / Scale Reference
              </label>
              <select
                value={referenceScale}
                onChange={(e) => setReferenceScale(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="Standard 9-10 inch Dinner Plate">Standard 9-10" Dinner Plate</option>
                <option value="Small 7-inch Salad / Dessert Plate">Small 7" Salad / Dessert Plate</option>
                <option value="Large 12-inch Restaurant Platter">Large 12" Restaurant Platter</option>
                <option value="Soup / Salad Bowl (approx. 500ml)">Soup / Salad Bowl (500ml)</option>
                <option value="Hand Palm Comparison Scale">Hand / Palm in View Scale</option>
                <option value="Takeout Container / Box">Takeout Container / Box</option>
              </select>
            </div>

            {/* Optional notes textarea */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Ingredients or Cooking Notes
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g. 'Cooked with 1 tbsp olive oil', 'Diet beverage', 'Extra cheese on side'"
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>

            {/* Camera device selector if multiple devices */}
            {devices.length > 1 && (
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Camera Input Device
                </label>
                <select
                  value={selectedDeviceId}
                  onChange={handleDeviceChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 truncate"
                >
                  {devices.map((device, idx) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Upload File / Clipboard Zone */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
                <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Upload Food Photo
              </h3>
            </div>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {/* Direct Device/Phone Camera Capture */}
            <input
              type="file"
              ref={nativeCameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-400/60 rounded-xl p-3 text-center cursor-pointer transition bg-slate-950/40 hover:bg-slate-950/80 group"
              >
                <UploadCloud className="w-5 h-5 mx-auto text-slate-500 group-hover:text-emerald-400 transition mb-1" />
                <p className="text-[11px] font-semibold text-slate-300 group-hover:text-white">
                  Upload Photo
                </p>
                <p className="text-[9px] text-slate-500">JPG, PNG, WEBP</p>
              </div>

              <div
                onClick={() => nativeCameraInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-teal-400/60 rounded-xl p-3 text-center cursor-pointer transition bg-slate-950/40 hover:bg-slate-950/80 group"
              >
                <Camera className="w-5 h-5 mx-auto text-teal-400 group-hover:scale-110 transition mb-1" />
                <p className="text-[11px] font-semibold text-slate-300 group-hover:text-white">
                  Device Camera
                </p>
                <p className="text-[9px] text-slate-500">Snap directly</p>
              </div>
            </div>
          </div>

          {/* Quick Voice Assistant Banner Card */}
          {onOpenVoiceAssist && (
            <div
              onClick={onOpenVoiceAssist}
              className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-teal-950/50 to-slate-900 border border-emerald-500/30 text-xs text-slate-300 space-y-1.5 cursor-pointer hover:border-emerald-400/60 transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center text-emerald-300 font-bold space-x-1.5">
                  <Mic className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                  <span>AI Voice Assistant Available</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Hands-Free
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click here to ask anything by voice, or say <strong className="text-white">"Take photo"</strong> to snap your plate hands-free!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Camera Troubleshooting & Permission Help Modal */}
      {showTroubleshoot && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Camera className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  Camera Access Troubleshooting
                </h3>
              </div>
              <button
                onClick={() => setShowTroubleshoot(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-emerald-300 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  1. Allow Browser Permission
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  In Chrome, Edge, or Brave: click the <strong>lock icon 🔒</strong> or <strong>camera icon 📷</strong> in your address bar (top left of URL) and switch <strong>Camera</strong> to <strong>"Allow"</strong>, then click Retry.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-teal-300 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
                  2. Check If Another App Is Using the Webcam
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  If Zoom, Microsoft Teams, Skype, Google Meet, or OBS is open, close them so your browser can access the camera hardware.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-cyan-300 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                  3. Open in a New Full Tab
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  If you are viewing inside an embedded preview or iframe, open the app directly in a full browser tab for direct hardware access.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowTroubleshoot(false);
                  startCamera();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                Retry Camera Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Demo / Sample Meals Gallery */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Instant Demo Gallery: Click Any Dish to Test AI Analysis
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            1-Click Instant Recognition & Low-Calorie Swaps
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {SAMPLE_MEALS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 p-3 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950">
                  <img
                    src={sample.thumbnail}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-rose-300">
                    {sample.calories} kcal
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-emerald-950/90 backdrop-blur-md border border-emerald-600/40 text-[10px] font-bold text-emerald-300">
                    Save -{sample.reductionPotential} kcal
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition line-clamp-1">
                    {sample.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {sample.description}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                <span>Analyze Meal</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


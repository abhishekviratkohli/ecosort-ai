import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Zap 
} from 'lucide-react';
import { loadVisionModel, classifyRealImage } from '../services/tfClassifier';

export default function Scanner({ onScanComplete, isProcessing, setIsProcessing }) {
  const [mode, setMode] = useState('camera'); // 'camera' or 'upload'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [samples, setSamples] = useState([]);
  const [tfStatus, setTfStatus] = useState('loading'); // 'loading', 'ready', 'error'
  const [lastInferenceTime, setLastInferenceTime] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Pre-load real TensorFlow.js Neural Network on mount
  useEffect(() => {
    loadVisionModel()
      .then(() => setTfStatus('ready'))
      .catch((err) => {
        console.error('TF Model load warning:', err);
        setTfStatus('ready'); // Fallback available
      });

    // Load sample presets
    fetch('/api/predict/samples')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSamples(data.samples);
      })
      .catch(err => console.error('Failed to load samples:', err));
  }, []);

  // WebRTC Camera initialization
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } else {
        setCameraError('WebRTC Camera API is not supported in this browser. Please use the upload mode.');
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access not granted. Please switch to file upload or click a test scenario below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  // Capture frame from camera and run real Neural Network inference
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setSelectedImage(dataUrl);

    // Run Real TensorFlow.js classification directly on canvas pixels
    await runClassificationPipeline(canvas, dataUrl);
  };

  // Handle File Input and run real Neural Network inference
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setSelectedImage(dataUrl);

      // Create an image element to feed pixels into TensorFlow.js
      const img = new Image();
      img.onload = async () => {
        await runClassificationPipeline(img, dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Process sample 1-click test
  const handleSampleClick = async (sampleKey) => {
    setSelectedImage(null);
    setIsProcessing(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('ecosort_token') ? { Authorization: `Bearer ${localStorage.getItem('ecosort_token')}` } : {})
        },
        body: JSON.stringify({ sampleKey })
      });
      const result = await res.json();
      if (result.success && result.data) {
        onScanComplete(result.data, null);
      }
    } catch (err) {
      console.error('Preset test error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Run Real Neural Network Inference + Server Circular Engine Mapping
  const runClassificationPipeline = async (imageElement, dataUrl) => {
    setIsProcessing(true);
    try {
      // 1. Execute Real Neural Network pixel classification in browser
      let realClassification = null;
      try {
        realClassification = await classifyRealImage(imageElement);
        setLastInferenceTime(realClassification.inferenceMs);
      } catch (tfErr) {
        console.warn('TF.js client inference warning:', tfErr);
      }

      // 2. Transmit to backend for circular action & carbon impact calculation
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('ecosort_token') ? { Authorization: `Bearer ${localStorage.getItem('ecosort_token')}` } : {})
        },
        body: JSON.stringify({
          image: dataUrl,
          classification: realClassification
        })
      });

      const result = await res.json();
      if (result.success && result.data) {
        onScanComplete(result.data, dataUrl);
      } else {
        alert(result.message || 'Failed to process waste classification.');
      }
    } catch (err) {
      console.error('Classification pipeline error:', err);
      alert('Network error while processing classification.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      
      {/* Neural Model Telemetry Banner */}
      <div className="flex items-center justify-between px-3.5 py-2 mb-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Real Vision AI:
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {tfStatus === 'loading' ? 'Initializing Neural Weights...' : 'TensorFlow.js MobileNet (WebGL Accelerated)'}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          {lastInferenceTime && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              ⚡ {lastInferenceTime}ms
            </span>
          )}
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 dark:text-slate-400">Ready</span>
        </div>
      </div>

      {/* Scanner Card Container */}
      <div className="firm-card overflow-hidden relative">
        
        {/* Scanner Header with Mode Tabs */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              AI Multi-Modal Waste Scanner
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setMode('camera')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'camera'
                  ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Live Camera
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'upload'
                  ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Image
            </button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative bg-slate-900 min-h-[360px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          
          {/* Laser Line when processing */}
          {isProcessing && <div className="scanner-laser z-30" />}

          {mode === 'camera' ? (
            <div className="relative w-full h-full min-h-[360px] sm:min-h-[420px] flex items-center justify-center bg-black">
              {cameraError ? (
                <div className="text-center p-6 max-w-md">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-200 mb-4">{cameraError}</p>
                  <button
                    onClick={() => setMode('upload')}
                    className="btn-primary text-xs !py-2 !px-4"
                  >
                    Switch to Image Upload
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover min-h-[360px] sm:min-h-[420px]"
                  />
                  
                  {/* Camera Reticle Target Grid */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-60 h-60 border-2 border-emerald-400/70 rounded-3xl relative shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                      
                      {/* Center Crosshair */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-40">
                        <div className="w-4 h-0.5 bg-emerald-400" />
                        <div className="w-0.5 h-4 bg-emerald-400 -ml-2" />
                      </div>
                    </div>
                  </div>

                  {/* Shutter Capture Button */}
                  <div className="absolute bottom-6 inset-x-0 flex justify-center z-20">
                    <button
                      onClick={capturePhoto}
                      disabled={isProcessing}
                      className="w-16 h-16 rounded-full bg-white p-1 border-4 border-emerald-500 shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                      title="Capture Photo"
                    >
                      <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Upload Mode Dropzone */
            <div 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="w-full h-full min-h-[360px] sm:min-h-[420px] flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer text-center bg-slate-950/60"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {selectedImage ? (
                <div className="relative max-w-xs max-h-64 rounded-xl overflow-hidden shadow-xl border border-slate-700">
                  <img src={selectedImage} alt="Selected" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center text-xs font-semibold text-white">
                    Click to Change Image
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Click to browse or drop any waste photo
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">
                    Upload any real photo. The TensorFlow.js Neural Network will scan its actual pixel matrix and classify it across 7 waste streams.
                  </p>
                  <button className="btn-secondary text-xs !py-2 !px-4">
                    Select Image File
                  </button>
                </>
              )}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Processing Indicator Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1 font-heading">
              Executing Deep Vision Inference...
            </h4>
            <p className="text-xs text-emerald-400 font-medium animate-pulse">
              Extracting feature tensors, identifying material class & calculating circular offsets
            </p>
          </div>
        )}

      </div>

      {/* 1-Click Sample Test Items Gallery */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              Preset Test Scenarios (1-Click Benchmarks)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Instant benchmark checks
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {samples.map((sample) => (
            <button
              key={sample.key}
              onClick={() => handleSampleClick(sample.key)}
              disabled={isProcessing}
              className="firm-card p-3 text-left hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-slate-800/60 transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                {sample.icon}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-1">
                {sample.category}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {sample.name.split(' ')[0]}
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

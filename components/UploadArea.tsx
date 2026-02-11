import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Button } from './Button';

interface UploadAreaProps {
  onImageSelected: (base64: string) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach stream to video element when camera is open
  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      // Set canvas dimensions to match video stream dimensions
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Horizontal flip for selfie consistency with preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onImageSelected(dataUrl);
        stopCamera();
      }
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onImageSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  if (isCameraOpen) {
    return (
      <div className="relative border-2 border-slate-300 rounded-2xl bg-black overflow-hidden aspect-[4/3] md:aspect-video flex flex-col shadow-lg">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform -scale-x-100" 
        />
        
        <div className="absolute top-4 right-4 z-10">
           <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded animate-pulse">LIVE</span>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center space-x-8">
          <Button variant="secondary" onClick={stopCamera} className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-0">
            Cancel
          </Button>
          <button 
            onClick={capturePhoto} 
            className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 shadow-lg flex items-center justify-center hover:scale-105 transition-transform active:scale-95 group"
            aria-label="Capture photo"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 group-hover:bg-indigo-500 transition-colors"></div>
          </button>
          {/* Spacer to balance the layout centered on the capture button */}
          <div className="w-[88px] hidden sm:block"></div> 
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 ease-in-out ${
        dragActive 
          ? "border-indigo-500 bg-indigo-50 scale-[1.02]" 
          : "border-slate-300 hover:border-indigo-400 bg-white"
      }`}
      onDragEnter={handleDrag} 
      onDragLeave={handleDrag} 
      onDragOver={handleDrag} 
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-indigo-50 rounded-full animate-fade-in">
          <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        {cameraError && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-100 mb-2">
            {cameraError}
          </div>
        )}

        <div>
          <h3 className="text-xl font-semibold text-slate-800">Upload your selfie</h3>
          <p className="text-slate-500 mt-2 text-sm">Drag and drop, upload, or take a photo</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center max-w-md mx-auto">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
            />
            <label htmlFor="file-upload" className="w-full sm:w-auto">
              <Button variant="outline" as="span" className="cursor-pointer w-full justify-center">
                <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Select File
              </Button>
            </label>
            
            <Button variant="primary" onClick={startCamera} className="w-full sm:w-auto justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Use Camera
            </Button>
        </div>

        <p className="text-xs text-slate-400 mt-2">Recommended: Good lighting, looking at camera</p>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface Props {
  onScan: (id: string) => void;
}

const Scanner: React.FC<Props> = ({ onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
        }
        requestAnimationFrame(tick);
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Camera permission denied or not available.");
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.height = videoRef.current.videoHeight;
            canvas.width = videoRef.current.videoWidth;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code) {
              if (code.data.startsWith('qr-audio:')) {
                const id = code.data.split(':')[1];
                onScan(id);
                setScanning(false);
                return; // Stop animation loop
              }
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [onScan]);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <i className="fa-solid fa-camera-slash text-red-500 text-3xl"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Camera Access Denied</h2>
        <p className="text-gray-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden flex flex-col items-center">
      <div className="flex-1 w-full relative">
        <video 
          ref={videoRef} 
          className="h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlay Scanner Frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-indigo-400 rounded-3xl relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white -translate-x-1 -translate-y-1 rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white translate-x-1 -translate-y-1 rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white -translate-x-1 translate-y-1 rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white translate-x-1 translate-y-1 rounded-br-xl"></div>
            
            {/* Scanning line animation */}
            <div className="absolute top-0 left-2 right-2 h-1 bg-indigo-400/50 shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-bounce mt-4"></div>
          </div>
        </div>
        
        <div className="absolute bottom-12 left-0 right-0 text-center px-10">
          <div className="bg-black/40 backdrop-blur-md text-white py-4 px-6 rounded-2xl border border-white/20">
            <p className="text-sm font-medium">Position the QR code inside the frame to play audio automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;

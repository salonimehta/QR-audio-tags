
import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AudioMessage } from '../types';
import { analyzeAudioContent } from '../services/geminiService';

interface Props {
  onSave: (message: AudioMessage) => void;
  onComplete: () => void;
  editMode?: AudioMessage | null;
}

const Creator: React.FC<Props> = ({ onSave, onComplete, editMode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState<AudioMessage | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const qrRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (editMode) {
      setAudioBase64(editMode.audioData);
      setAudioUrl(`data:audio/webm;base64,${editMode.audioData}`);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [editMode]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setAudioBase64(base64String);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      alert("Microphone permission denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAudioBase64(base64String);
      };
    }
  };

  const processAndCreate = async () => {
    if (!audioBase64) return;
    setIsProcessing(true);
    
    // Only analyze if audio changed or if it's new
    let analysis = { title: "Voice Message", description: "Audio content", emoji: "🎙️" };
    if (!editMode || audioBase64 !== editMode.audioData) {
      analysis = await analyzeAudioContent(audioBase64, 'audio/webm');
    } else {
      analysis = { title: editMode.title, description: editMode.description || "", emoji: editMode.emoji || "🎙️" };
    }
    
    const newMessage: AudioMessage = {
      id: editMode?.id || Math.random().toString(36).substring(2, 9),
      title: analysis.title,
      description: analysis.description,
      emoji: analysis.emoji,
      audioData: audioBase64,
      createdAt: editMode?.createdAt || Date.now(),
    };

    setGeneratedMsg(newMessage);
    onSave(newMessage);
    setIsProcessing(false);
  };

  const downloadQR = () => {
    if (!qrRef.current || !generatedMsg) return;
    
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 100;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(generatedMsg.title, canvas.width / 2, img.height + 60);
        
        ctx.font = "14px Inter, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Scan with QR-Audio Messenger", canvas.width / 2, img.height + 85);

        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR-${generatedMsg.title.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (generatedMsg) {
    return (
      <div className="p-8 flex flex-col items-center animate-in slide-in-from-bottom duration-500">
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full flex items-center gap-2 mb-8">
          <i className="fa-solid fa-circle-check"></i>
          <span className="text-sm font-semibold">{editMode ? 'Audio Updated!' : 'QR Code Ready!'}</span>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center w-full">
          <div className="mb-4 text-center">
            <h3 className="text-xl font-bold text-gray-800">{generatedMsg.title}</h3>
            <p className="text-gray-500 text-sm">{generatedMsg.description}</p>
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-2xl">
            <QRCodeSVG 
              ref={qrRef}
              value={`qr-audio:${generatedMsg.id}`} 
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="mt-6 flex flex-col gap-3 w-full">
            <button 
              onClick={downloadQR}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
              <i className="fa-solid fa-download"></i> Save QR Image
            </button>
            <button 
              onClick={onComplete}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{editMode ? 'Update Audio' : 'Create Audio QR'}</h2>
      <p className="text-gray-500 mb-8">
        {editMode 
          ? `Replacing audio for "${editMode.title}". The QR code remains the same.` 
          : 'Record or upload an audio file to link it to a dynamic QR code.'}
      </p>

      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        {!audioUrl || (isRecording) ? (
          <>
            <div className="relative">
              {isRecording && <div className="absolute -inset-8 bg-red-100 rounded-full animate-ping opacity-75"></div>}
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative h-32 w-32 rounded-full flex flex-col items-center justify-center shadow-xl transition-all active:scale-90 ${isRecording ? 'bg-red-500 text-white' : 'bg-white text-indigo-600 border-2 border-indigo-100'}`}
              >
                <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'} text-4xl mb-2`}></i>
                <span className="text-xs font-bold uppercase tracking-widest">{isRecording ? 'Stop' : 'Record'}</span>
              </button>
            </div>
            
            {isRecording ? (
              <div className="text-center">
                <p className="text-3xl font-mono font-bold text-gray-800">{formatTime(recordingTime)}</p>
                <p className="text-red-500 text-sm font-medium animate-pulse mt-1 uppercase">Recording...</p>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-gray-400 text-xs font-bold uppercase">OR</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <label className="w-full flex items-center justify-center gap-3 py-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-all text-gray-500 font-medium">
                  <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
                  Upload New File
                  <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            )}
          </>
        ) : (
          <div className="w-full bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-3xl mb-6">
              <i className="fa-solid fa-file-audio"></i>
            </div>
            <audio src={audioUrl} controls className="w-full mb-8" />
            <div className="flex gap-3 w-full">
              <button onClick={() => { setAudioUrl(null); setAudioBase64(null); }} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl">Discard</button>
              <button onClick={processAndCreate} disabled={isProcessing} className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
                {isProcessing ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Analyzing...</> : <>{editMode ? 'Update Message' : 'Generate QR'}</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Creator;

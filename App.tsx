
import React, { useState, useEffect } from 'react';
import { AppView, AudioMessage } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Scanner from './components/Scanner';
import Creator from './components/Creator';
import Library from './components/Library';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SCANNER);
  const [messages, setMessages] = useState<AudioMessage[]>([]);
  const [activeMessage, setActiveMessage] = useState<AudioMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<AudioMessage | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('qr_audio_messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    }
  }, []);

  const saveMessage = (newMessage: AudioMessage) => {
    const exists = messages.find(m => m.id === newMessage.id);
    let updated;
    if (exists) {
      updated = messages.map(m => m.id === newMessage.id ? newMessage : m);
    } else {
      updated = [newMessage, ...messages];
    }
    setMessages(updated);
    localStorage.setItem('qr_audio_messages', JSON.stringify(updated));
    setEditingMessage(null);
  };

  const deleteMessage = (id: string) => {
    if (window.confirm("Are you sure you want to delete this QR audio message?")) {
      const updated = messages.filter(m => m.id !== id);
      setMessages(updated);
      localStorage.setItem('qr_audio_messages', JSON.stringify(updated));
    }
  };

  const handleEdit = (msg: AudioMessage) => {
    setEditingMessage(msg);
    setCurrentView(AppView.CREATOR);
  };

  const handleScanSuccess = (id: string) => {
    const found = messages.find(m => m.id === id);
    if (found) {
      setActiveMessage(found);
    } else {
      alert("Message not found! This QR code might belong to a different device or has been deleted.");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden relative">
      <Header />

      <main className="flex-1 overflow-y-auto pb-24">
        {currentView === AppView.SCANNER && (
          <Scanner onScan={handleScanSuccess} />
        )}
        
        {currentView === AppView.CREATOR && (
          <Creator 
            onSave={saveMessage} 
            onComplete={() => setCurrentView(AppView.LIBRARY)} 
            editMode={editingMessage}
          />
        )}
        
        {currentView === AppView.LIBRARY && (
          <Library 
            messages={messages} 
            onDelete={deleteMessage} 
            onEdit={handleEdit}
            onPlay={(msg) => setActiveMessage(msg)} 
          />
        )}
      </main>

      {activeMessage && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full p-8 shadow-2xl flex flex-col items-center gap-6">
            <div className="text-6xl">{activeMessage.emoji || '🎙️'}</div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800">{activeMessage.title}</h3>
              <p className="text-gray-500 mt-2">{activeMessage.description}</p>
            </div>
            
            <audio 
              src={`data:audio/webm;base64,${activeMessage.audioData}`} 
              controls 
              autoPlay 
              className="w-full mt-4"
            />

            <button 
              onClick={() => setActiveMessage(null)}
              className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <BottomNav activeView={currentView} setView={(v) => {
        if (v !== AppView.CREATOR) setEditingMessage(null);
        setCurrentView(v);
      }} />
    </div>
  );
};

export default App;

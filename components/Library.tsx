
import React from 'react';
import { AudioMessage } from '../types';

interface Props {
  messages: AudioMessage[];
  onDelete: (id: string) => void;
  onEdit: (msg: AudioMessage) => void;
  onPlay: (msg: AudioMessage) => void;
}

const Library: React.FC<Props> = ({ messages, onDelete, onEdit, onPlay }) => {
  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your QR Messages</h2>
        <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
          {messages.length} Total
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <i className="fa-solid fa-box-open text-6xl mb-4 text-gray-300"></i>
          <p className="text-gray-500 font-medium">No messages created yet.</p>
          <p className="text-xs mt-1">Tap the plus icon to start recording.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className="group bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
            >
              <div 
                onClick={() => onPlay(msg)}
                className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-3xl cursor-pointer hover:scale-105 transition-transform shrink-0"
              >
                {msg.emoji || '🎙️'}
              </div>
              
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPlay(msg)}>
                <h4 className="font-bold text-gray-800 truncate">{msg.title}</h4>
                <p className="text-xs text-gray-500 truncate">{msg.description}</p>
                <span className="text-[10px] text-gray-300 font-medium uppercase mt-1 block">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(msg); }}
                  className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Edit Audio"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(msg.id); }}
                  className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
        <h5 className="text-sm font-bold text-indigo-700 mb-2 flex items-center gap-2">
          <i className="fa-solid fa-bolt-lightning"></i>
          Dynamic QR Codes
        </h5>
        <p className="text-xs text-indigo-600 leading-relaxed">
          The QR codes are permanent. You can edit the audio at any time by clicking the edit icon, and the printed code will automatically play the new message!
        </p>
      </div>
    </div>
  );
};

export default Library;


import React from 'react';
import { AppView } from '../types';

interface Props {
  activeView: AppView;
  setView: (view: AppView) => void;
}

const BottomNav: React.FC<Props> = ({ activeView, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-effect border-t border-gray-100 px-8 py-4 flex justify-between items-center z-10">
      <button 
        onClick={() => setView(AppView.SCANNER)}
        className={`flex flex-col items-center gap-1 transition-all ${activeView === AppView.SCANNER ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}
      >
        <i className={`fa-solid fa-expand text-xl ${activeView === AppView.SCANNER ? 'text-indigo-600' : 'text-gray-400'}`}></i>
        <span className="text-[10px] font-medium uppercase tracking-wider">Scan</span>
      </button>

      <div className="relative -top-10">
        <button 
          onClick={() => setView(AppView.CREATOR)}
          className={`h-16 w-16 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 border-4 border-white transform transition-transform active:scale-95 ${activeView === AppView.CREATOR ? 'scale-110' : ''}`}
        >
          <i className="fa-solid fa-plus text-white text-2xl"></i>
        </button>
      </div>

      <button 
        onClick={() => setView(AppView.LIBRARY)}
        className={`flex flex-col items-center gap-1 transition-all ${activeView === AppView.LIBRARY ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}
      >
        <i className={`fa-solid fa-box-archive text-xl ${activeView === AppView.LIBRARY ? 'text-indigo-600' : 'text-gray-400'}`}></i>
        <span className="text-[10px] font-medium uppercase tracking-wider">Library</span>
      </button>
    </nav>
  );
};

export default BottomNav;

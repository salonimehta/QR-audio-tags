
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="px-6 py-4 flex items-center justify-between glass-effect border-b border-gray-100 z-10">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-xl">
          <i className="fa-solid fa-qrcode text-white text-lg"></i>
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          QR-Audio
        </h1>
      </div>
      <div className="flex gap-4 text-gray-400">
        <i className="fa-solid fa-circle-info cursor-pointer hover:text-indigo-600 transition-colors"></i>
      </div>
    </header>
  );
};

export default Header;

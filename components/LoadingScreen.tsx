import React from 'react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          ✏️
        </div>
      </div>
      <h2 className="text-2xl font-bold text-blue-800 mb-2">Sabar ya...</h2>
      <p className="text-gray-600 animate-pulse">{message}</p>
    </div>
  );
};
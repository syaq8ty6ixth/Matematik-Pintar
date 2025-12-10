import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation after 2.5 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // Unmount after exit animation (0.5s) completes
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center 
        bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600
        text-white overflow-hidden
        ${isExiting ? 'animate-slide-out' : ''}
      `}
    >
      {/* Floating Background Icons */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float" style={{ animationDelay: '0s' }}>➕</div>
      <div className="absolute top-20 right-20 text-7xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>➗</div>
      <div className="absolute bottom-32 left-20 text-8xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>📐</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>✖️</div>
      <div className="absolute top-1/2 left-10 text-5xl opacity-10 animate-pulse">123</div>
      <div className="absolute top-1/3 right-5 text-5xl opacity-10 animate-pulse">%</div>

      {/* Main Content */}
      <div className="relative z-10 text-center p-6">
        <div className="mb-4 inline-block bg-white p-6 rounded-full shadow-xl animate-pop-in">
          <span className="text-6xl">🚀</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-2 drop-shadow-md animate-pop-in" style={{ animationDelay: '0.2s' }}>
          Matematik<br/>Pintar
        </h1>
        
        <p className="text-xl md:text-2xl font-medium text-blue-100 italic animate-pop-in" style={{ animationDelay: '0.4s' }}>
          by Cikgu Syafiq Johar
        </p>

        <div className="mt-12 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="mt-4 text-sm opacity-80">Memuatkan Latih Tubi...</p>
      </div>
    </div>
  );
};
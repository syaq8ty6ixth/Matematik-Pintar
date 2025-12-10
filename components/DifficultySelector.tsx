
import React from 'react';
import { DifficultyMode, Grade, Topic } from '../types';
import { playClickSound } from '../services/soundEffects';

interface DifficultySelectorProps {
  grade: Grade;
  topic: Topic;
  onSelectDifficulty: (mode: DifficultyMode) => void;
  onBack: () => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ grade, topic, onSelectDifficulty, onBack }) => {
  
  const difficulties: { mode: DifficultyMode; count: number; color: string; desc: string; icon: string }[] = [
    { 
      mode: 'Mudah', 
      count: 10, 
      color: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200', 
      desc: 'Soalan asas untuk pemanasan badan.',
      icon: '🌱'
    },
    { 
      mode: 'Sederhana', 
      count: 30, 
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200', 
      desc: 'Campuran soalan untuk menguji kefahaman.',
      icon: '🔥'
    },
    { 
      mode: 'Sukar', 
      count: 50, 
      color: 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200', 
      desc: 'Cabar diri dengan soalan KBAT dan banyak!',
      icon: '💪'
    }
  ];

  const handleSelect = (mode: DifficultyMode) => {
    playClickSound();
    onSelectDifficulty(mode);
  };

  const handleBack = () => {
    playClickSound();
    onBack();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in-up">
      <div className="mb-8">
         <button 
          onClick={handleBack}
          className="flex items-center text-gray-500 hover:text-blue-600 font-bold transition-colors mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Tukar Topik
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Pilih Tahap Cabaran
          </h1>
          <p className="text-lg text-gray-600">
            {topic} (Tahun {grade})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficulties.map((item) => (
          <button
            key={item.mode}
            onClick={() => handleSelect(item.mode)}
            className={`
              relative flex flex-col items-center justify-center p-8 rounded-3xl border-4 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300
              ${item.color}
            `}
          >
            <div className="text-6xl mb-4">{item.icon}</div>
            <h3 className="text-2xl font-bold mb-1">{item.mode}</h3>
            <span className="bg-white bg-opacity-60 px-3 py-1 rounded-full text-sm font-bold mb-4 border border-current">
              {item.count} Soalan
            </span>
            <p className="text-center font-medium opacity-80 text-sm">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

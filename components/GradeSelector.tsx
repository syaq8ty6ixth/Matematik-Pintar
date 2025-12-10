
import React, { useState } from 'react';
import { Grade } from '../types';
import { playClickSound } from '../services/soundEffects';

interface GradeSelectorProps {
  onSelectGrade: (grade: Grade, name: string) => void;
}

export const GradeSelector: React.FC<GradeSelectorProps> = ({ onSelectGrade }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const grades: Grade[] = [1, 2, 3, 4, 5, 6];

  const handleGradeClick = (grade: Grade) => {
    playClickSound();
    if (!name.trim()) {
      setError('Sila masukkan nama adik dahulu ya! 😊');
      return;
    }
    onSelectGrade(grade, name);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-2 drop-shadow-sm">
          Matematik Pintar 🇲🇾
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-6 italic">
          by Syafiq Johar
        </h2>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-blue-100">
        <label className="block text-gray-700 font-bold mb-2 text-lg">
          Nama Pelajar:
        </label>
        <input 
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value) setError('');
          }}
          placeholder="Taip nama anda di sini..."
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-lg transition-colors"
        />
        {error && (
          <p className="text-red-500 mt-2 font-medium animate-bounce">
            {error}
          </p>
        )}
      </div>

      <div className="text-center mb-4">
        <p className="text-lg text-gray-600 bg-white inline-block px-6 py-2 rounded-full shadow-sm">
          Sila pilih <strong>Tahun / Darjah</strong>:
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        {grades.map((grade) => (
          <button
            key={grade}
            onClick={() => handleGradeClick(grade)}
            className={`
              group relative border-b-4 rounded-2xl p-6 transition-all duration-200 shadow-lg flex flex-col items-center justify-center aspect-square
              ${name.trim() 
                ? 'bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-500 hover:shadow-xl active:border-b-0 active:translate-y-1 cursor-pointer' 
                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-70'}
            `}
          >
            <span className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">
               {grade === 1 ? '🎒' : 
                grade === 2 ? '✏️' : 
                grade === 3 ? '📐' : 
                grade === 4 ? '🔬' : 
                grade === 5 ? '💡' : '🎓'}
            </span>
            <span className={`text-2xl font-bold ${name.trim() ? 'text-blue-900' : 'text-gray-400'}`}>
              Tahun {grade}
            </span>
            {name.trim() && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">Pilih</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { QuizState, ScoreRecord } from '../types';
import { saveScore, getLeaderboard } from '../services/storageService';
import { playClickSound } from '../services/soundEffects';

interface ResultsViewProps {
  state: QuizState;
  onRestart: () => void;
  onHome: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ state, onRestart, onHome }) => {
  const [leaderboard, setLeaderboard] = useState<ScoreRecord[]>([]);
  const percentage = Math.round((state.score / state.questions.length) * 100);
  
  useEffect(() => {
    // Save score only once when component mounts
    if (state.currentTopic && state.grade && state.difficultyMode) {
      saveScore({
        name: state.studentName || 'Pelajar Misteri',
        grade: state.grade,
        topic: state.currentTopic,
        difficulty: state.difficultyMode,
        score: state.score,
        totalQuestions: state.questions.length
      });

      // Fetch leaderboard
      const data = getLeaderboard(state.grade, state.currentTopic);
      setLeaderboard(data);
    }
  }, []); // Empty dependency array ensures it runs once

  const handleRestart = () => {
    playClickSound();
    onRestart();
  };

  const handleHome = () => {
    playClickSound();
    onHome();
  };

  let message = "";
  let emoji = "";
  
  if (percentage === 100) {
    message = "Hebat! Pemenang Matematik Sejati! 🌟";
    emoji = "🏆";
  } else if (percentage >= 80) {
    message = "Syabas! Usaha yang sangat baik!";
    emoji = "🥇";
  } else if (percentage >= 50) {
    message = "Boleh tahan! Cuba lagi untuk cemerlang.";
    emoji = "👍";
  } else {
    message = "Jangan putus asa, belajar dari kesilapan!";
    emoji = "🌱";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 py-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Score Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden flex flex-col items-center">
          {/* Decorative Background Circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-full -ml-16 -mt-16 opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-100 rounded-full -mr-20 -mb-20 opacity-50"></div>

          <div className="relative z-10 w-full">
            <h2 className="text-2xl font-bold text-blue-900 mb-1">Keputusan</h2>
            <p className="text-lg text-blue-600 font-semibold mb-6">
              {state.studentName} • Tahun {state.grade}
            </p>

            <div className="text-6xl mb-4 animate-bounce-slow">
              {emoji}
            </div>
            
            <p className="text-gray-500 mb-1 font-medium uppercase tracking-wide text-sm">
              {state.currentTopic}
            </p>
            <p className="text-gray-400 mb-4 text-xs font-bold uppercase tracking-widest bg-gray-100 inline-block px-2 py-1 rounded">
              Mod: {state.difficultyMode}
            </p>

            <div className="flex justify-center items-center mb-6">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    className="text-gray-200"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                  />
                  <circle
                    className={`${percentage >= 50 ? 'text-green-500' : 'text-orange-500'} transition-all duration-1000 ease-out`}
                    strokeWidth="12"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * percentage) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                  />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-800">{state.score}</span>
                  <span className="text-gray-500 text-sm">daripada {state.questions.length}</span>
                </div>
              </div>
            </div>

            <p className="text-xl font-medium text-blue-800 mb-8 px-4">
              {message}
            </p>

            <div className="space-y-3 w-full">
              <button
                onClick={handleRestart}
                className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg shadow-blue-200"
              >
                Cuba Lagi (Set Baru)
              </button>
              <button
                onClick={handleHome}
                className="w-full py-3 px-6 rounded-xl bg-white text-gray-700 border-2 border-gray-200 font-bold hover:bg-gray-50 transition-colors"
              >
                Menu Utama
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col h-full border border-blue-50">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <span className="text-2xl">🏆</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Papan Pendahulu</h3>
              <p className="text-xs text-gray-500">Ranking untuk Tahun {state.grade} - {state.currentTopic}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {leaderboard.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                Belum ada rekod. Anda yang pertama!
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase rounded-l-lg">#</th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase">Nama</th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase text-right rounded-r-lg">Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboard.map((record, index) => (
                    <tr key={record.id} className={`${record.name === state.studentName && record.timestamp > Date.now() - 5000 ? 'bg-yellow-50 animate-pulse' : 'hover:bg-gray-50'}`}>
                      <td className="p-3 font-bold text-gray-400">
                        {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : index + 1}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-gray-800">{record.name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${record.difficulty === 'Mudah' ? 'bg-green-400' : record.difficulty === 'Sederhana' ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
                          {record.difficulty}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="font-bold text-blue-900">{record.score}/{record.totalQuestions}</div>
                        <div className="text-[10px] text-gray-400">
                          {Math.round((record.score / record.totalQuestions) * 100)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

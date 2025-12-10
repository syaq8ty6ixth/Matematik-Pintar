
import React, { useState } from 'react';
import { Question, Topic, Grade } from '../types';
import { getExplanation } from '../services/geminiService';
import { playCorrectSound, playWrongSound, playClickSound } from '../services/soundEffects';

interface QuizViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (index: number) => void;
  onNext: () => void;
  topic: Topic;
  grade: Grade;
}

export const QuizView: React.FC<QuizViewProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  topic,
  grade
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState<string>('');
  const [isExplaining, setIsExplaining] = useState(false);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return; // Prevent changing answer
    
    setSelectedOption(index);
    onAnswer(index);

    if (index === question.correctAnswerIndex) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  const handleRequestExplanation = async () => {
    playClickSound();
    if (explanationText) {
      setShowExplanation(true);
      return;
    }
    
    setIsExplaining(true);
    setShowExplanation(true);
    const text = await getExplanation(
      question.questionText,
      question.options[question.correctAnswerIndex],
      grade
    );
    setExplanationText(text);
    setIsExplaining(false);
  };

  const handleNextClick = () => {
    playClickSound();
    onNext();
  };

  const isCorrect = selectedOption === question.correctAnswerIndex;
  const hasAnswered = selectedOption !== null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
          <span>Soalan {questionNumber} / {totalQuestions}</span>
          <span className="uppercase tracking-wider text-blue-600">{topic} • TAHUN {grade}</span>
        </div>
        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6 border-b-8 border-blue-100">
        <span className={`
          inline-block px-3 py-1 rounded-full text-xs font-bold mb-4
          ${question.difficulty === 'Mudah' ? 'bg-green-100 text-green-700' : 
            question.difficulty === 'Sederhana' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'}
        `}>
          Aras: {question.difficulty}
        </span>
        
        {/* SVG Diagram Area */}
        {question.svg && (
          <div 
            className="mb-6 flex justify-center bg-gray-50 p-4 rounded-xl border-2 border-dashed border-blue-100 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: question.svg }}
          />
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mb-8 leading-snug">
          {question.questionText}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, idx) => {
            let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium text-lg ";
            
            if (!hasAnswered) {
              btnClass += "border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700";
            } else {
              if (idx === question.correctAnswerIndex) {
                btnClass += "border-green-500 bg-green-50 text-green-800 shadow-md"; // Correct answer always green
              } else if (idx === selectedOption) {
                btnClass += "border-red-500 bg-red-50 text-red-800"; // Wrong selection red
              } else {
                btnClass += "border-gray-100 text-gray-400 opacity-50"; // Others faded
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={hasAnswered}
                className={btnClass}
              >
                <span className="inline-block w-8 h-8 rounded-full bg-white border border-current text-center leading-7 text-sm mr-3 font-bold opacity-70">
                  {['A', 'B', 'C', 'D'][idx]}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback & Controls */}
      {hasAnswered && (
        <div className="space-y-4 animate-fade-in-up">
          <div className={`p-4 rounded-xl flex items-center ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="text-3xl mr-4">
              {isCorrect ? '🎉' : '🤔'}
            </div>
            <div>
              <p className="font-bold text-lg">
                {isCorrect ? 'Syabas! Jawapan tepat.' : 'Alamak, kurang tepat.'}
              </p>
              {!isCorrect && (
                <p className="text-sm opacity-90">
                  Jawapan betul ialah <span className="font-bold">{['A', 'B', 'C', 'D'][question.correctAnswerIndex]}</span>.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {!isCorrect && (
              <button
                onClick={handleRequestExplanation}
                className="flex-1 py-3 px-6 rounded-xl bg-purple-100 text-purple-700 font-bold hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
              >
                {isExplaining ? (
                  <svg className="animate-spin h-5 w-5 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Jelaskan (Cikgu Syafiq)
              </button>
            )}
            
            <button
              onClick={handleNextClick}
              className="flex-1 py-3 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Soalan Seterusnya &rarr;
            </button>
          </div>
          
          {/* AI Explanation Box */}
          {showExplanation && (
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200 mt-4">
               <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                 👨‍🏫 Cikgu Syafiq Berkata:
               </h4>
               {isExplaining ? (
                 <div className="h-16 flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                 </div>
               ) : (
                 <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                   {explanationText}
                 </p>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

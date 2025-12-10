
import React, { useState } from 'react';
import { Topic, QuizState, Grade, DifficultyMode } from './types';
import { generateQuestionsForTopic } from './services/geminiService';
import { TopicSelector } from './components/TopicSelector';
import { GradeSelector } from './components/GradeSelector';
import { DifficultySelector } from './components/DifficultySelector';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { LoadingScreen } from './components/LoadingScreen';
import { SplashScreen } from './components/SplashScreen';
import { AudioControl } from './components/AudioControl';
import { playClickSound } from './services/soundEffects';

const initialState: QuizState = {
  studentName: '',
  grade: null,
  currentTopic: null,
  difficultyMode: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  answers: [],
  isFinished: false,
  isLoading: false,
  loadingMessage: ''
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [gameState, setGameState] = useState<QuizState>(initialState);

  const handleSelectGrade = (grade: Grade, name: string) => {
    setGameState(prev => ({
      ...prev,
      grade: grade,
      studentName: name
    }));
  };

  const handleBackToGrade = () => {
    playClickSound();
    // We keep the name, but allow re-selecting grade
    setGameState(prev => ({
      ...prev,
      grade: null,
      currentTopic: null,
      difficultyMode: null
    }));
  };

  const handleSelectTopic = (topic: Topic) => {
    setGameState(prev => ({
      ...prev,
      currentTopic: topic,
      difficultyMode: null // Reset difficulty if topic changes
    }));
  };

  const handleBackToTopic = () => {
    // Sound is handled in DifficultySelector before calling this
    setGameState(prev => ({
      ...prev,
      currentTopic: null,
      difficultyMode: null
    }));
  };

  const startQuiz = async (mode: DifficultyMode) => {
    if (!gameState.grade || !gameState.currentTopic) return;

    // Determine question count based on difficulty
    let questionCount = 10;
    if (mode === 'Sederhana') questionCount = 30;
    if (mode === 'Sukar') questionCount = 50;

    setGameState(prev => ({
      ...prev,
      difficultyMode: mode,
      isLoading: true,
      loadingMessage: `Sedang menjana ${questionCount} soalan ${mode} untuk topik ${prev.currentTopic}... (Sila tunggu sebentar)`
    }));

    try {
      const questions = await generateQuestionsForTopic(gameState.currentTopic, gameState.grade, questionCount, mode);
      setGameState(prev => ({
        ...prev,
        questions,
        currentIndex: 0,
        score: 0,
        answers: [],
        isFinished: false,
        isLoading: false,
        loadingMessage: ''
      }));
    } catch (error) {
      console.error("Failed to load questions", error);
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        loadingMessage: "Gagal memuatkan soalan. Sila cuba lagi."
      }));
      // Reset after a delay
      setTimeout(() => {
         setGameState(prev => ({...prev, isLoading: false, difficultyMode: null}));
      }, 2000);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const currentQ = gameState.questions[gameState.currentIndex];
    const isCorrect = optionIndex === currentQ.correctAnswerIndex;

    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      answers: [...prev.answers, optionIndex]
    }));
  };

  const handleNext = () => {
    if (gameState.currentIndex + 1 < gameState.questions.length) {
      setGameState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        isFinished: true
      }));
    }
  };

  const handleHome = () => {
    playClickSound();
    setGameState(initialState);
  };

  const handleRestartTopic = () => {
    if (gameState.difficultyMode) {
      startQuiz(gameState.difficultyMode);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff]">
      {/* Background Music Player - Persistent across screens */}
      <AudioControl />

      {/* 1. Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Main Content Area - Only shown if not splashing or renders underneath if needed */}
      {!showSplash && (
        <>
          {/* 2. Loading Screen */}
          {gameState.isLoading && (
            <div className="min-h-screen flex items-center justify-center">
              <LoadingScreen message={gameState.loadingMessage} />
            </div>
          )}

          {/* 3. Results View */}
          {!gameState.isLoading && gameState.isFinished && (
            <ResultsView 
              state={gameState} 
              onRestart={handleRestartTopic} 
              onHome={handleHome} 
            />
          )}

          {/* 4. Active Quiz View */}
          {!gameState.isLoading && !gameState.isFinished && gameState.currentTopic && gameState.difficultyMode && gameState.questions.length > 0 && gameState.grade && (
            <>
              <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                  <button 
                    onClick={handleHome}
                    className="text-gray-500 hover:text-blue-600 font-bold flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Menu
                  </button>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 font-bold uppercase">Pelajar</div>
                    <div className="text-sm font-bold text-blue-900 truncate max-w-[150px]">
                      {gameState.studentName}
                    </div>
                  </div>
                </div>
              </header>
              
              <QuizView 
                key={gameState.currentIndex}
                question={gameState.questions[gameState.currentIndex]}
                questionNumber={gameState.currentIndex + 1}
                totalQuestions={gameState.questions.length}
                onAnswer={handleAnswer}
                onNext={handleNext}
                topic={gameState.currentTopic}
                grade={gameState.grade}
              />
            </>
          )}

          {/* 5. Difficulty Selection */}
          {!gameState.isLoading && !gameState.isFinished && gameState.currentTopic && gameState.grade && !gameState.difficultyMode && (
             <>
               <header className="bg-white shadow-sm px-4 py-2 sticky top-0 z-20 md:hidden">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 mr-1">Hai,</span>
                    <span className="font-bold text-blue-900">{gameState.studentName}</span>
                  </div>
               </header>
               <DifficultySelector 
                 grade={gameState.grade}
                 topic={gameState.currentTopic}
                 onSelectDifficulty={startQuiz}
                 onBack={handleBackToTopic}
               />
               <footer className="text-center p-8 text-gray-400 text-sm">
                 Dikuasakan oleh Google Gemini AI 🚀
               </footer>
            </>
          )}

          {/* 6. Topic Selection */}
          {!gameState.isLoading && !gameState.isFinished && gameState.grade && !gameState.currentTopic && (
             <>
               <header className="bg-white shadow-sm px-4 py-2 sticky top-0 z-20 md:hidden">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 mr-1">Hai,</span>
                    <span className="font-bold text-blue-900">{gameState.studentName}</span>
                  </div>
               </header>
               <TopicSelector 
                  onSelectTopic={handleSelectTopic} 
                  selectedGrade={gameState.grade}
                  onBack={handleBackToGrade}
               />
               <footer className="text-center p-8 text-gray-400 text-sm">
                 Dikuasakan oleh Google Gemini AI 🚀
               </footer>
             </>
          )}

          {/* 7. Initial Screen: Grade Selection */}
          {!gameState.isLoading && !gameState.isFinished && !gameState.grade && (
            <>
              <GradeSelector onSelectGrade={handleSelectGrade} />
              <footer className="text-center p-8 text-gray-400 text-sm">
                Dikuasakan oleh Google Gemini AI 🚀
              </footer>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;

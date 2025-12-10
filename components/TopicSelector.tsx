
import React from 'react';
import { Topic, Grade, TOPIC_COLORS, TOPIC_ICONS } from '../types';
import { playClickSound } from '../services/soundEffects';

interface TopicSelectorProps {
  onSelectTopic: (topic: Topic) => void;
  selectedGrade: Grade;
  onBack: () => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic, selectedGrade, onBack }) => {
  
  // Filter topics based on Syllabus (KSSR Semakan)
  const availableTopics = Object.values(Topic).filter(topic => {
    // Koordinat & Nisbah only starts at Year 4
    if (topic === Topic.KOORDINAT && selectedGrade < 4) {
      return false;
    }
    return true;
  });

  const handleTopicClick = (topic: Topic) => {
    playClickSound();
    onSelectTopic(topic);
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
          Tukar Tahun
        </button>

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
            Topik Tahun {selectedGrade}
          </h1>
          <p className="text-lg text-gray-600">
            Pilih topik untuk mula belajar dengan Cikgu Syafiq!
          </p>
          <p className="text-sm text-blue-500 mt-2 font-medium bg-blue-50 inline-block px-3 py-1 rounded-full">
            ✨ Menepati Silibus KSSR Semakan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => handleTopicClick(topic)}
            className={`
              relative overflow-hidden rounded-2xl p-6 h-40 shadow-lg hover:shadow-xl 
              transform hover:-translate-y-1 transition-all duration-300 text-left group
              bg-white border-2 border-transparent hover:border-blue-300
            `}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500 ${TOPIC_COLORS[topic]}`}></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="text-4xl mb-2">{TOPIC_ICONS[topic]}</div>
              <h3 className="text-xl font-bold text-gray-800 leading-tight">
                {topic}
              </h3>
            </div>
            
            <div className="absolute bottom-4 right-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

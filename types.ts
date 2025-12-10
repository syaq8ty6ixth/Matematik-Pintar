export enum Topic {
  NOMBOR = 'Nombor dan Operasi',
  PECAHAN = 'Pecahan dan Perpuluhan',
  WANG = 'Wang dan Kewangan',
  MASA = 'Masa dan Waktu',
  UKURAN = 'Panjang, Jisim dan Isi Padu',
  RUANG = 'Ruang, Bentuk dan Geometri',
  KOORDINAT = 'Koordinat, Nisbah dan Kadaran',
  DATA = 'Pengurusan Data'
}

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

export type DifficultyMode = 'Mudah' | 'Sederhana' | 'Sukar';

export interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  difficulty: 'Mudah' | 'Sederhana' | 'Sukar';
  svg?: string; // Optional SVG string for diagrams
}

export interface ScoreRecord {
  id: string;
  name: string;
  grade: Grade;
  topic: Topic;
  difficulty: DifficultyMode;
  score: number;
  totalQuestions: number;
  timestamp: number;
}

export interface QuizState {
  studentName: string;
  grade: Grade | null;
  currentTopic: Topic | null;
  difficultyMode: DifficultyMode | null;
  questions: Question[];
  currentIndex: number;
  score: number;
  answers: (number | null)[]; // Stores index of selected answer, null if skipped
  isFinished: boolean;
  isLoading: boolean;
  loadingMessage: string;
}

export const TOPIC_COLORS: Record<Topic, string> = {
  [Topic.NOMBOR]: 'bg-blue-500',
  [Topic.PECAHAN]: 'bg-green-500',
  [Topic.WANG]: 'bg-yellow-500',
  [Topic.MASA]: 'bg-purple-500',
  [Topic.UKURAN]: 'bg-pink-500',
  [Topic.RUANG]: 'bg-indigo-500',
  [Topic.KOORDINAT]: 'bg-orange-500',
  [Topic.DATA]: 'bg-teal-500',
};

export const TOPIC_ICONS: Record<Topic, string> = {
  [Topic.NOMBOR]: '🔢',
  [Topic.PECAHAN]: '🍰',
  [Topic.WANG]: '💰',
  [Topic.MASA]: '⏰',
  [Topic.UKURAN]: '📏',
  [Topic.RUANG]: '🔺',
  [Topic.KOORDINAT]: '🗺️',
  [Topic.DATA]: '📊',
};
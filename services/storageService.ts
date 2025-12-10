import { ScoreRecord, Grade, Topic } from "../types";

const STORAGE_KEY = 'matematik_pintar_leaderboard';

export const saveScore = (record: Omit<ScoreRecord, 'id' | 'timestamp'>) => {
  const existingDataString = localStorage.getItem(STORAGE_KEY);
  let records: ScoreRecord[] = existingDataString ? JSON.parse(existingDataString) : [];

  const newRecord: ScoreRecord = {
    ...record,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };

  records.push(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const getLeaderboard = (grade: Grade, topic: Topic): ScoreRecord[] => {
  const existingDataString = localStorage.getItem(STORAGE_KEY);
  if (!existingDataString) return [];

  const records: ScoreRecord[] = JSON.parse(existingDataString);

  // Filter by grade and topic, then sort by score (desc) then by total questions (desc)
  return records
    .filter(r => r.grade === grade && r.topic === topic)
    .sort((a, b) => {
      // Calculate percentage
      const percentA = a.score / a.totalQuestions;
      const percentB = b.score / b.totalQuestions;
      
      if (percentB !== percentA) {
        return percentB - percentA; // Higher percentage first
      }
      return b.timestamp - a.timestamp; // If same score, latest one first (or handle as preferred)
    })
    .slice(0, 10); // Return top 10
};
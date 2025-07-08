
import React, { createContext, useContext, useState, useEffect } from 'react';

interface StudentProgress {
  totalProblems: number;
  correctAnswers: number;
  currentLevel: number;
  topicsCompleted: string[];
  streakCount: number;
  lastPracticeDate: string;
}

interface StudentContextType {
  progress: StudentProgress;
  updateProgress: (correct: boolean, topic: string) => void;
  setLevel: (level: number) => void;
  resetProgress: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const initialProgress: StudentProgress = {
  totalProblems: 0,
  correctAnswers: 0,
  currentLevel: 1,
  topicsCompleted: [],
  streakCount: 0,
  lastPracticeDate: ''
};

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<StudentProgress>(initialProgress);

  useEffect(() => {
    const storedProgress = localStorage.getItem('student_data');
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('student_data', JSON.stringify(progress));
  }, [progress]);

  const updateProgress = (correct: boolean, topic: string) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        totalProblems: prev.totalProblems + 1,
        correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
        streakCount: correct ? prev.streakCount + 1 : 0,
        lastPracticeDate: new Date().toISOString(),
        topicsCompleted: prev.topicsCompleted.includes(topic) 
          ? prev.topicsCompleted 
          : [...prev.topicsCompleted, topic]
      };

      // Adaptive difficulty adjustment
      const accuracy = newProgress.correctAnswers / newProgress.totalProblems;
      if (accuracy > 0.8 && prev.streakCount >= 5) {
        newProgress.currentLevel = Math.min(prev.currentLevel + 1, 10);
      } else if (accuracy < 0.5 && prev.totalProblems > 5) {
        newProgress.currentLevel = Math.max(prev.currentLevel - 1, 1);
      }

      return newProgress;
    });
  };

  const setLevel = (level: number) => {
    setProgress(prev => ({ ...prev, currentLevel: level }));
  };

  const resetProgress = () => {
    setProgress(initialProgress);
  };

  return (
    <StudentContext.Provider value={{ progress, updateProgress, setLevel, resetProgress }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

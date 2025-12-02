import React, { useState, useEffect } from 'react';
import { Trophy, Flame, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';
import { QuizQuestion, UserProfile } from '../types';
import { generateDailyQuiz } from '../services/geminiService';

interface DailyChallengeProps {
  userProfile: UserProfile;
  onComplete: (points: number) => void;
  t: any;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ userProfile, onComplete, t }) => {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const today = new Date().toDateString();
      if (userProfile.lastQuizDate && new Date(userProfile.lastQuizDate).toDateString() === today) {
        setCompletedToday(true);
      } else {
        setCompletedToday(false);
        loadQuiz();
      }
    };
    checkStatus();
  }, [userProfile.lastQuizDate]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const q = await generateDailyQuiz();
      setQuiz(q);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (isAnswered || !quiz) return;
    
    setSelectedOption(index);
    setIsAnswered(true);
    
    const correct = index === quiz.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      // Award 50 points for correct answer
      onComplete(50);
    } else {
        // Award 10 points for participation
        onComplete(10);
    }
  };

  if (completedToday) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="text-green-600 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.quizAlreadyDone}</h3>
        <p className="text-gray-500">{t.comeBackTomorrow}</p>
        <div className="mt-6 flex gap-8">
            <div className="text-center">
                <p className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                    <Flame size={24} className="fill-orange-500" /> {userProfile.streak}
                </p>
                <p className="text-xs text-gray-400 uppercase font-bold">{t.streak}</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-blue-500 flex items-center justify-center gap-1">
                    <Trophy size={24} className="fill-blue-500" /> {userProfile.points}
                </p>
                <p className="text-xs text-gray-400 uppercase font-bold">{t.points}</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg h-full flex flex-col relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
           <h3 className="text-xl font-bold flex items-center gap-2">
             <BrainCircuit size={24} className="text-yellow-300" />
             {t.dailyChallenge}
           </h3>
           <p className="text-indigo-200 text-sm mt-1">{t.completeQuiz}</p>
        </div>
        <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm font-medium">
             <Flame size={16} className="text-orange-400 fill-orange-400" />
             <span>{userProfile.streak}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        {loading ? (
           <div className="text-center py-8">
             <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
             <p className="text-indigo-200">{t.quizLoading}</p>
           </div>
        ) : quiz ? (
            <div className="space-y-3">
                <p className="text-lg font-medium mb-4">{quiz.question}</p>
                <div className="grid grid-cols-1 gap-2">
                    {quiz.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={isAnswered}
                            className={`p-3 rounded-xl text-left text-sm font-medium transition-all ${
                                isAnswered
                                    ? idx === quiz.correctAnswer
                                        ? 'bg-green-500 text-white border-green-400'
                                        : idx === selectedOption
                                            ? 'bg-red-500 text-white border-red-400'
                                            : 'bg-white/10 text-indigo-100 opacity-50'
                                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span>{option}</span>
                                {isAnswered && idx === quiz.correctAnswer && <CheckCircle2 size={16} />}
                                {isAnswered && idx === selectedOption && idx !== quiz.correctAnswer && <XCircle size={16} />}
                            </div>
                        </button>
                    ))}
                </div>
                {isAnswered && (
                    <div className="mt-4 p-3 bg-white/10 rounded-xl text-sm animate-fade-in">
                        <p className="font-bold mb-1">{isCorrect ? t.correct : t.wrong}</p>
                        <p className="opacity-90">{quiz.explanation}</p>
                    </div>
                )}
            </div>
        ) : (
            <div className="text-center text-indigo-200">Failed to load quiz.</div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
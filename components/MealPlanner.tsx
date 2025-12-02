import React, { useState } from 'react';
import { UserProfile, WeeklyPlan, DailyPlan } from '../types';
import { generatePersonalizedPlan } from '../services/geminiService';
import { Sparkles, Loader2, Clock, Calculator, Scale, Activity } from 'lucide-react';

interface MealPlannerProps {
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  t: any;
}

const MealPlanner: React.FC<MealPlannerProps> = ({ userProfile, onUpdateProfile, t }) => {
  const [loading, setLoading] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [bmiResult, setBmiResult] = useState<{ value: number; status: string } | null>(null);

  // BMI Calculation Logic
  // Formula: Weight (kg) / (Height (m))^2
  // Prompt requirement: < 18 Muscle Gain, > 20 Weight Loss.
  const calculateBMI = () => {
    if (userProfile.height && userProfile.weight) {
      const heightInMeters = userProfile.height / 100;
      const bmi = userProfile.weight / (heightInMeters * heightInMeters);
      const roundedBMI = parseFloat(bmi.toFixed(1));

      let goal: 'weight_loss' | 'maintenance' | 'muscle_gain' = 'maintenance';
      let status = t.normalWeight;

      if (roundedBMI < 18) {
        goal = 'muscle_gain';
        status = t.underweight;
      } else if (roundedBMI > 20) {
        // User specified > 20 is "obese/weight loss"
        goal = 'weight_loss';
        status = t.overweight;
      }

      setBmiResult({ value: roundedBMI, status });
      onUpdateProfile({ ...userProfile, goal });
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generated = await generatePersonalizedPlan(userProfile);
      setWeeklyPlan(generated);
      setSelectedDayIndex(0); // Reset to first day
    } catch (error) {
      console.error(error);
      alert("Could not generate plan. Check API key.");
    } finally {
      setLoading(false);
    }
  };

  const currentDailyPlan: DailyPlan | undefined = weeklyPlan?.week?.[selectedDayIndex];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{t.mealPlanner}</h2>
          <p className="text-gray-500">{t.weekPlan}</p>
        </div>
      </div>

      {/* BMI Calculator Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Calculator size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t.bmiCalculator}</h3>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Inputs */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile} Weight (kg)</label>
                    <div className="relative">
                        <Scale className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="number" 
                            value={userProfile.weight || ''}
                            onChange={(e) => onUpdateProfile({...userProfile, weight: Number(e.target.value)})}
                            className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="70"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile} Height (cm)</label>
                    <div className="relative">
                        <Activity className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="number" 
                            value={userProfile.height || ''}
                            onChange={(e) => onUpdateProfile({...userProfile, height: Number(e.target.value)})}
                            className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="175"
                        />
                    </div>
                </div>
                <button 
                    onClick={calculateBMI}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    {t.calculateBMI}
                </button>
            </div>

            {/* Result Visual */}
            <div className="md:col-span-2 flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-2xl border border-gray-100 min-h-[180px]">
                {bmiResult ? (
                    <div className="animate-fade-in space-y-3">
                        <p className="text-gray-500 font-medium uppercase tracking-wide text-xs">{t.yourBMI}</p>
                        <div className={`text-5xl font-extrabold ${
                            bmiResult.value < 18.5 ? 'text-blue-500' : 
                            bmiResult.value > 20 ? 'text-orange-500' : 'text-green-500'
                        }`}>
                            {bmiResult.value}
                        </div>
                        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                            bmiResult.value < 18.5 ? 'bg-blue-100 text-blue-700' : 
                            bmiResult.value > 20 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                            {bmiResult.status}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {t.bmiAdvice} <span className="font-bold text-gray-900">{userProfile.goal.replace('_', ' ').toUpperCase()}</span>
                        </p>
                    </div>
                ) : (
                    <div className="text-gray-400 text-sm">
                        Enter your weight and height to calculate BMI and set your goal automatically.
                    </div>
                )}
            </div>
        </div>
    </div>

      {/* Generate Button Area */}
      {!weeklyPlan && !loading && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white text-center shadow-xl">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Sparkles size={32} className="text-yellow-300" />
          </div>
          <h3 className="text-2xl font-bold mb-2">{t.weekPlan}</h3>
          <p className="text-emerald-100 mb-8 max-w-lg mx-auto">
            AI will generate a complete 7-day plan optimized for {userProfile.goal.replace('_', ' ')} based on your stats.
          </p>
          <button
            onClick={handleGenerate}
            disabled={!userProfile.weight || !userProfile.height}
            className={`bg-white text-emerald-700 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg ${
                (!userProfile.weight || !userProfile.height) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {t.generateWeek}
          </button>
        </div>
      )}

      {loading && (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Generating 7-Day Plan...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
        </div>
      )}

      {/* Results */}
      {weeklyPlan && weeklyPlan.week && (
        <div className="space-y-6">
            
            {/* Day Selector */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {weeklyPlan.week.map((dayPlan, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedDayIndex(index)}
                        className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                            selectedDayIndex === index
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {dayPlan.day || `Day ${index + 1}`}
                    </button>
                ))}
            </div>

            {/* Daily View */}
            {currentDailyPlan ? (
                <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    {currentDailyPlan.meals.map((meal, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${
                                meal.mealType === 'Breakfast' ? 'bg-orange-400' :
                                meal.mealType === 'Lunch' ? 'bg-green-500' :
                                meal.mealType === 'Dinner' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}>
                                {meal.mealType[0]}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">{meal.name}</h4>
                                <p className="text-sm text-gray-500 mb-2">{meal.description}</p>
                                <div className="flex gap-3 text-xs font-medium text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={12} /> 
                                    {meal.mealType === 'Breakfast' ? '8:00 AM' :
                                    meal.mealType === 'Lunch' ? '1:00 PM' :
                                    meal.mealType === 'Dinner' ? '7:00 PM' : '4:00 PM'}
                                    </span>
                                </div>
                            </div>
                            </div>

                            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="text-center min-w-[3rem]">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cals</p>
                                <p className="font-bold text-gray-900">{meal.nutrients.calories}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-200"></div>
                                <div className="text-center min-w-[3rem]">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Prot</p>
                                <p className="font-bold text-blue-600">{meal.nutrients.protein}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-200"></div>
                                <div className="text-center min-w-[3rem]">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Carbs</p>
                                <p className="font-bold text-orange-600">{meal.nutrients.carbs}</p>
                                </div>
                            </div>
                        </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">No data for this day.</div>
            )}
            
            <button onClick={() => setWeeklyPlan(null)} className="mt-8 text-center text-gray-500 hover:text-primary text-sm font-medium w-full underline">
                Regenerate Plan
            </button>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
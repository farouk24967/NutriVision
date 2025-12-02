import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FoodScanner from './components/FoodScanner';
import MealPlanner from './components/MealPlanner';
import AuthScreen from './components/AuthScreen';
import ChatWidget from './components/ChatWidget';
import Premium from './components/Premium';
import { ViewState, FoodItem, UserProfile, NutrientInfo, Language, SubscriptionTier } from './types';
import { Menu, Scale, Activity, Ruler } from 'lucide-react';
import { translations } from './translations';
import { resetChatSession } from './services/geminiService';

// Mock Initial Data
const INITIAL_PROFILE_TEMPLATE: UserProfile = {
  name: 'User',
  gender: 'male',
  age: 28,
  weight: 75,
  height: 180,
  goal: 'muscle_gain',
  activityLevel: 'active',
  streak: 0,
  lastActiveDate: new Date().toISOString(),
  points: 0,
  subscription: 'free'
};

const App: React.FC = () => {
  // Auth & Settings State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  // App State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dailyLog, setDailyLog] = useState<FoodItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE_TEMPLATE);

  const t = translations[language];

  // Update document direction based on language
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // 1. Persist User Profile Changes
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const storageKey = `nutrivision_profile_${user.email}`;
      localStorage.setItem(storageKey, JSON.stringify(userProfile));
    }
  }, [userProfile, isAuthenticated, user]);

  // 2. Persist Daily Log Changes (Data Isolation)
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const storageKey = `nutrivision_log_${user.email}`;
      localStorage.setItem(storageKey, JSON.stringify(dailyLog));
    }
  }, [dailyLog, isAuthenticated, user]);

  const handleLogin = (email: string, name: string) => {
    setIsAuthenticated(true);
    setUser({ email, name });
    setCurrentView('dashboard');
    resetChatSession(); // Reset chat for new user

    // --- DATA ISOLATION LOGIC ---
    
    // 1. Load Profile
    const profileKey = `nutrivision_profile_${email}`;
    const savedProfileStr = localStorage.getItem(profileKey);
    let loadedProfile = { ...INITIAL_PROFILE_TEMPLATE, name: name };

    if (savedProfileStr) {
      try {
        const savedProfile = JSON.parse(savedProfileStr);
        // Ensure new fields exist if loading old data
        loadedProfile = {
            ...INITIAL_PROFILE_TEMPLATE,
            ...savedProfile,
            name: name
        };
      } catch (e) {
        // Fallback
      }
    }

    // --- STREAK RESET LOGIC ---
    const now = new Date();
    const lastActive = new Date(loadedProfile.lastActiveDate);
    
    // Reset time to compare dates only
    const todayStr = now.toDateString();
    const lastActiveStr = lastActive.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    // If last active was not today and not yesterday, reset streak
    if (lastActiveStr !== todayStr && lastActiveStr !== yesterdayStr) {
        loadedProfile.streak = 0;
    }

    // Update last active date to now
    loadedProfile.lastActiveDate = now.toISOString();
    setUserProfile(loadedProfile);

    // 2. Load Food Logs (Or reset to empty if new user)
    const logKey = `nutrivision_log_${email}`;
    const savedLogStr = localStorage.getItem(logKey);
    if (savedLogStr) {
      try {
        setDailyLog(JSON.parse(savedLogStr));
      } catch (e) {
        setDailyLog([]);
      }
    } else {
      // New User: Reset Log to Empty
      setDailyLog([]);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setDailyLog([]); // Clear current state
    setUserProfile(INITIAL_PROFILE_TEMPLATE); // Reset current state
    setCurrentView('dashboard');
    setIsSidebarOpen(false);
    resetChatSession();
  };

  const handleAddFood = (food: FoodItem) => {
    setDailyLog((prev) => [food, ...prev]);
    setCurrentView('dashboard');
  };

  const updateSubscription = (tier: SubscriptionTier) => {
      setUserProfile(prev => ({
          ...prev,
          subscription: tier
      }));
  };

  const handleChallengeComplete = (pointsEarned: number) => {
    setUserProfile(prev => ({
        ...prev,
        points: prev.points + pointsEarned,
        streak: prev.streak + 1,
        lastQuizDate: new Date().toISOString()
    }));
  };

  // --- DYNAMIC TARGET CALCULATION ---
  const calculatedTargets = useMemo(() => {
    // Mifflin-St Jeor Equation
    const isMale = userProfile.gender === 'male';
    const bmr = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age) + (isMale ? 5 : -161);
    
    const activityMultipliers: Record<string, number> = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'athlete': 1.9
    };
    
    const tdee = bmr * (activityMultipliers[userProfile.activityLevel] || 1.2);
    
    let targetCalories = tdee;
    if (userProfile.goal === 'weight_loss') targetCalories = tdee - 500;
    else if (userProfile.goal === 'muscle_gain') targetCalories = tdee + 400;
    
    // Ensure safety minimum
    targetCalories = Math.max(targetCalories, 1200);

    // Macros
    // Protein: 2g/kg (High for app focus)
    const protein = userProfile.weight * 2;
    // Fat: 0.9g/kg
    const fats = userProfile.weight * 0.9;
    // Carbs: Remainder of calories
    const carbs = Math.max(0, (targetCalories - (protein * 4) - (fats * 9)) / 4);
    
    return {
        calories: Math.round(targetCalories),
        protein: Math.round(protein),
        fats: Math.round(fats),
        carbs: Math.round(carbs)
    };
  }, [userProfile]);

  // --- BMI CALCULATION ---
  const bmiData = useMemo(() => {
      const hM = userProfile.height / 100;
      const bmi = parseFloat((userProfile.weight / (hM * hM)).toFixed(1));
      
      let status = '';
      let color = '';
      let bg = '';
      
      if (bmi < 18.5) {
          status = t.underweight;
          color = 'text-blue-600';
          bg = 'bg-blue-100';
      } else if (bmi >= 18.5 && bmi < 25) {
          status = t.normalWeight;
          color = 'text-green-600';
          bg = 'bg-green-100';
      } else if (bmi >= 25 && bmi < 30) {
          status = t.overweight;
          color = 'text-orange-600';
          bg = 'bg-orange-100';
      } else {
          status = t.obese;
          color = 'text-red-600';
          bg = 'bg-red-100';
      }

      return { bmi, status, color, bg };
  }, [userProfile.weight, userProfile.height, t]);


  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} language={language} setLanguage={setLanguage} t={t} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans relative">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        user={user}
        onLogout={handleLogout}
        userSubscription={userProfile.subscription}
        t={t}
      />

      {/* Main Content */}
      <div className="lg:ml-64 lg:rtl:ml-0 lg:rtl:mr-64 min-h-screen transition-all duration-300">
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="font-bold text-lg text-gray-900">NutriVision</div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
        </div>

        <main className="p-6 lg:p-10 max-w-7xl mx-auto animate-fade-in pb-24">
          {currentView === 'dashboard' && (
            <Dashboard 
              dailyLog={dailyLog} 
              userTarget={calculatedTargets} 
              userName={user?.name}
              userProfile={userProfile}
              onUpdateProfile={setUserProfile}
              onChallengeComplete={handleChallengeComplete}
              t={t}
            />
          )}
          
          {currentView === 'scanner' && (
            <FoodScanner onAddFood={handleAddFood} t={t} />
          )}

          {currentView === 'planner' && (
             <MealPlanner userProfile={userProfile} onUpdateProfile={setUserProfile} t={t} />
          )}

          {currentView === 'premium' && (
              <Premium userProfile={userProfile} onUpdateSubscription={updateSubscription} t={t} />
          )}

          {currentView === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
               
               {/* User Header */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-6">
                   <div className="w-20 h-20 bg-gradient-to-br from-primary to-emerald-700 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                      {user?.name.charAt(0)}
                   </div>
                   <div className="text-center md:text-left md:flex-1">
                      <h3 className="text-2xl font-bold">{user?.name}</h3>
                      <p className="text-gray-500">{user?.email}</p>
                      <div className="flex justify-center md:justify-start gap-2 mt-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                              userProfile.subscription === 'elite' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              userProfile.subscription === 'pro' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                              {userProfile.subscription}
                          </span>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="text-center">
                          <div className="text-2xl font-bold text-orange-500">{userProfile.streak}</div>
                          <div className="text-xs text-gray-400 uppercase font-bold">{t.streak}</div>
                      </div>
                      <div className="w-px bg-gray-200"></div>
                      <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">{userProfile.points}</div>
                          <div className="text-xs text-gray-400 uppercase font-bold">{t.points}</div>
                      </div>
                   </div>
               </div>

               {/* BMI Card */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                         <Activity size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{t.healthStatus}</h3>
                  </div>

                  <div className="flex items-center gap-8">
                     <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Circular Progress (Visual only) */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                className={bmiData.color}
                                strokeDasharray={351.86}
                                strokeDashoffset={351.86 - (351.86 * Math.min(bmiData.bmi / 40, 1))}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-bold ${bmiData.color}`}>{bmiData.bmi}</span>
                            <span className="text-xs text-gray-400">BMI</span>
                        </div>
                     </div>
                     <div className="flex-1 space-y-2">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${bmiData.bg} ${bmiData.color}`}>
                            {bmiData.status}
                        </div>
                        <p className="text-gray-500 text-sm">
                            {t.bmiAdvice} <strong className="text-gray-900">{userProfile.goal.replace('_', ' ').toUpperCase()}</strong>.
                            We have adjusted your daily targets to <strong>{calculatedTargets.calories} kcal</strong>.
                        </p>
                     </div>
                  </div>
               </div>

               {/* Stats Form */}
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                 <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                         <Scale size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{t.personalStats}</h3>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.gender}</label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setUserProfile({...userProfile, gender: 'male'})}
                                className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${
                                    userProfile.gender === 'male' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {t.male}
                            </button>
                            <button 
                                onClick={() => setUserProfile({...userProfile, gender: 'female'})}
                                className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${
                                    userProfile.gender === 'female' ? 'bg-pink-50 border-pink-200 text-pink-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {t.female}
                            </button>
                        </div>
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">{t.activityLevel}</label>
                       <select 
                          value={userProfile.activityLevel}
                          onChange={(e) => setUserProfile({...userProfile, activityLevel: e.target.value as any})}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
                        >
                          <option value="sedentary">{t.sedentary}</option>
                          <option value="light">{t.lightActivity}</option>
                          <option value="moderate">{t.moderateActivity}</option>
                          <option value="active">{t.active}</option>
                          <option value="athlete">{t.athlete}</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile} Weight (kg)</label>
                        <div className="relative">
                            <Scale className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="number" 
                                value={userProfile.weight} 
                                onChange={(e) => setUserProfile({...userProfile, weight: Number(e.target.value)})}
                                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.height} (cm)</label>
                        <div className="relative">
                            <Ruler className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="number" 
                                value={userProfile.height} 
                                onChange={(e) => setUserProfile({...userProfile, height: Number(e.target.value)})}
                                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                        <input 
                          type="number" 
                          value={userProfile.age} 
                          onChange={(e) => setUserProfile({...userProfile, age: Number(e.target.value)})}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goal</label>
                        <select 
                          value={userProfile.goal}
                          onChange={(e) => setUserProfile({...userProfile, goal: e.target.value as any})}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
                        >
                          <option value="weight_loss">Weight Loss</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="muscle_gain">Muscle Gain</option>
                        </select>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Chat Bot */}
      <ChatWidget userProfile={userProfile} t={t} />
    </div>
  );
};

export default App;
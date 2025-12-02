import React, { useState } from 'react';
import { UtensilsCrossed, ArrowRight, Lock, Mail, User, Globe } from 'lucide-react';
import { Language } from '../types';

interface AuthScreenProps {
  onLogin: (email: string, name: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, language, setLanguage, t }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const displayName = name || email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
      onLogin(email, displayName);
    }
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className="min-h-screen flex bg-white animate-fade-in">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-emerald-800 relative overflow-hidden text-white p-12 flex-col justify-between">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-yellow-400/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
              <UtensilsCrossed className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">NutriVision AI</span>
          </div>
          
          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-bold leading-tight">
              Smart Nutrition <br/> for Peak Performance
            </h1>
            <p className="text-lg text-emerald-100 leading-relaxed">
              {t.startJourney}
            </p>
          </div>
        </div>

        <div className="relative z-10">
           <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 w-fit">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-600 bg-gray-200 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*123}`} alt="User" className="w-full h-full bg-white" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold">10,000+ Users</p>
                <p className="text-emerald-200">Join the community</p>
              </div>
           </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 relative">
        
        {/* Language Switcher */}
        <div className="absolute top-8 right-8 flex items-center gap-2 z-20">
           <Globe size={18} className="text-gray-400" />
           <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm flex-wrap justify-end gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    language === lang.code 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {lang.flag}
                </button>
              ))}
           </div>
        </div>

        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? t.welcome : t.createAccount}
            </h2>
            <p className="text-gray-500">
              {isLogin ? t.enterDetails : t.startJourney}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.fullName}</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 rtl:right-4 rtl:left-auto" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 rtl:right-4 rtl:left-auto" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 rtl:right-4 rtl:left-auto" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 group mt-2"
            >
              {isLogin ? t.signIn : t.signUp}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setName('');
                  setEmail('');
                  setPassword('');
                }}
                className="font-bold text-primary hover:text-emerald-700 transition-colors"
              >
                {isLogin ? t.signUp : t.signIn}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
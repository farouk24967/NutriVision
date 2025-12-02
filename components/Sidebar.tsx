import React from 'react';
import { ViewState, SubscriptionTier } from '../types';
import { LayoutDashboard, ScanLine, UtensilsCrossed, User, X, LogOut, Crown } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
  userSubscription?: SubscriptionTier;
  t: any;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, setIsOpen, user, onLogout, userSubscription = 'free', t }) => {
  
  const navItems: { id: ViewState; label: string; icon: React.ElementType; isPremium?: boolean }[] = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'scanner', label: t.foodVision, icon: ScanLine },
    { id: 'planner', label: t.mealPlanner, icon: UtensilsCrossed },
    { id: 'profile', label: t.profile, icon: User },
    { id: 'premium', label: t.premium, icon: Crown, isPremium: true },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">NutriVision</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                currentView === item.id
                  ? 'bg-primary/10 text-primary'
                  : item.isPremium
                    ? 'text-amber-600 hover:bg-amber-50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} className={item.isPremium ? 'text-amber-500 fill-amber-500' : ''} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border border-white shadow-sm ${
                    userSubscription === 'elite' ? 'bg-gradient-to-br from-amber-400 to-yellow-600' :
                    userSubscription === 'pro' ? 'bg-gradient-to-br from-blue-400 to-indigo-600' :
                    'bg-gray-400'
                }`}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 truncate">{user?.name || t.guest}</p>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        {userSubscription === 'elite' ? <Crown size={10} className="text-amber-500 fill-amber-500" /> : null}
                        {userSubscription.toUpperCase()}
                    </p>
                </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-all border border-transparent hover:border-red-100"
            >
              <LogOut size={18} />
              {t.signOut}
            </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
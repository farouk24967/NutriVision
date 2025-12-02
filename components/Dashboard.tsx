import React from 'react';
import { FoodItem, NutrientInfo, UserProfile } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Activity, Flame, Wheat, Droplet, UtensilsCrossed } from 'lucide-react';
import DailyChallenge from './DailyChallenge';

interface DashboardProps {
  dailyLog: FoodItem[];
  userTarget: NutrientInfo;
  userName?: string;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onChallengeComplete: (points: number) => void;
  t: any;
}

const Dashboard: React.FC<DashboardProps> = ({ dailyLog, userTarget, userName, userProfile, onChallengeComplete, t }) => {
  
  // Calculate totals
  const totals = dailyLog.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fats: acc.fats + item.fats
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const macroData = [
    { name: t.protein, value: totals.protein, color: '#3B82F6' },
    { name: t.carbs, value: totals.carbs, color: '#F59E0B' },
    { name: t.fats, value: totals.fats, color: '#EAB308' },
  ];

  // If no data, show empty state chart
  const isDataEmpty = totals.protein === 0 && totals.carbs === 0 && totals.fats === 0;
  const chartData = isDataEmpty 
    ? [{ name: 'Empty', value: 1, color: '#E5E7EB' }] 
    : macroData;

  // Mock Weekly Data - Resetting to 0 visually if no data for current day (to simulate fresh account)
  // In a real app, this would come from historical logs
  const baseValue = isDataEmpty ? 0 : 2000; 
  const weeklyData = [
    { name: 'Mon', calories: isDataEmpty ? 0 : baseValue * 0.9 },
    { name: 'Tue', calories: isDataEmpty ? 0 : baseValue * 1.1 },
    { name: 'Wed', calories: isDataEmpty ? 0 : baseValue * 0.8 },
    { name: 'Thu', calories: isDataEmpty ? 0 : baseValue },
    { name: 'Fri', calories: totals.calories }, 
    { name: 'Sat', calories: 0 },
    { name: 'Sun', calories: 0 },
  ];

  const StatCard = ({ icon: Icon, label, current, target, color, unit }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col transition-transform hover:scale-[1.02]">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <span className="text-gray-500 font-medium text-sm">{label}</span>
      </div>
      <div className="mt-auto">
        <div className="flex items-end gap-1 mb-2">
          <span className="text-3xl font-bold text-gray-900">{Math.round(current)}</span>
          <span className="text-gray-400 text-sm font-medium mb-1">/ {target}{unit}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${color.replace('bg-', 'bg-opacity-100 bg-')}`}
            style={{ width: `${Math.min((current / target) * 100, 100)}%`, backgroundColor: 'currentColor' }} 
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{t.hello}, {userName || t.guest}! 👋</h2>
          <p className="text-gray-500 mt-1">{t.dailyBreakdown}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm">
          <span className="text-gray-500">{t.today}:</span> <span className="font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
        </div>
      </header>

      {/* Daily Challenge Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <StatCard 
                icon={Flame} 
                label={t.calories} 
                current={totals.calories} 
                target={userTarget.calories} 
                color="bg-red-500" 
                unit="kcal"
                />
                <StatCard 
                icon={Activity} 
                label={t.protein} 
                current={totals.protein} 
                target={userTarget.protein} 
                color="bg-blue-500" 
                unit="g"
                />
                <StatCard 
                icon={Wheat} 
                label={t.carbs} 
                current={totals.carbs} 
                target={userTarget.carbs} 
                color="bg-orange-500" 
                unit="g"
                />
                <StatCard 
                icon={Droplet} 
                label={t.fats} 
                current={totals.fats} 
                target={userTarget.fats} 
                color="bg-yellow-500" 
                unit="g"
                />
            </div>
        </div>
        <div className="md:col-span-1 min-h-[300px]">
            <DailyChallenge userProfile={userProfile} onComplete={onChallengeComplete} t={t} />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Macro Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">{t.macroDist}</h3>
          <div className="h-64 w-full relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {!isDataEmpty && <Tooltip />}
                </PieChart>
             </ResponsiveContainer>
             {isDataEmpty && (
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium">
                 {t.noData}
               </div>
             )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {macroData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                <span className="text-sm text-gray-600 font-medium">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">{t.weeklyCals}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar 
                  dataKey="calories" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">{t.todaysHistory}</h3>
          {dailyLog.length > 0 && <span className="text-sm text-gray-500">{dailyLog.length} {t.items}</span>}
        </div>
        <div className="divide-y divide-gray-100">
          {dailyLog.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <UtensilsCrossed className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-900 font-medium mb-1">{t.emptyPlate}</p>
              <p className="text-gray-500 text-sm mb-4">{t.startTracking}</p>
            </div>
          ) : (
            dailyLog.map((food) => (
              <div key={food.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                   {food.imageUrl && (
                     <img src={food.imageUrl} alt={food.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-sm" />
                   )}
                   <div>
                     <p className="font-medium text-gray-900">{food.name}</p>
                     <p className="text-xs text-gray-500">{food.portionSize || '1 serving'}</p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{food.calories} kcal</p>
                  <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="text-blue-600 font-medium">P:{food.protein}</span>
                    <span className="text-orange-600 font-medium">C:{food.carbs}</span>
                    <span className="text-yellow-600 font-medium">F:{food.fats}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
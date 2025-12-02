import React, { useState } from 'react';
import { UserProfile, SubscriptionTier } from '../types';
import { Check, CreditCard, Building, Upload, Crown, X, Loader2 } from 'lucide-react';

interface PremiumProps {
  userProfile: UserProfile;
  onUpdateSubscription: (tier: SubscriptionTier) => void;
  t: any;
}

const Premium: React.FC<PremiumProps> = ({ userProfile, onUpdateSubscription, t }) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'edahabia' | 'ccp'>('edahabia');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const plans = [
    {
      id: 'free',
      name: t.free,
      price: '0 DZD',
      color: 'bg-gray-100',
      textColor: 'text-gray-900',
      btnColor: 'bg-gray-200 text-gray-800',
      features: [t.feature1, t.limited + " " + t.feature2],
      tier: 'free' as SubscriptionTier
    },
    {
      id: 'pro',
      name: t.pro,
      price: '2500 DZD',
      period: `/${t.month}`,
      color: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      btnColor: 'bg-blue-600 text-white hover:bg-blue-700',
      features: [t.feature1, t.unlimited + " " + t.feature2, t.feature3, t.feature6],
      tier: 'pro' as SubscriptionTier
    },
    {
      id: 'elite',
      name: t.elite,
      price: '5000 DZD',
      period: `/${t.month}`,
      color: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200',
      btnColor: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600',
      icon: <Crown className="w-6 h-6 text-amber-600" />,
      features: [t.feature1, t.unlimited + " " + t.feature2, t.feature3, t.feature6, t.feature4, t.feature5],
      tier: 'elite' as SubscriptionTier
    }
  ];

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (tier === 'free') {
      onUpdateSubscription('free');
      return;
    }
    setSelectedPlan(tier);
    setShowPaymentModal(true);
    setShowSuccess(false);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate API delay
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      if (selectedPlan) {
        onUpdateSubscription(selectedPlan);
      }
      setTimeout(() => {
        setShowPaymentModal(false);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.upgrade}</h2>
        <p className="text-gray-500 text-lg">Choose the perfect plan for your fitness journey.</p>
      </header>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = userProfile.subscription === plan.tier;
          return (
            <div 
              key={plan.id} 
              className={`relative flex flex-col p-6 rounded-3xl border transition-all duration-300 hover:shadow-xl ${
                plan.id === 'elite' ? 'border-amber-200 shadow-amber-100' : 'border-gray-200'
              } ${plan.color}`}
            >
              {plan.id === 'elite' && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    POPULAR
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-xl font-bold ${plan.textColor}`}>{plan.name}</h3>
                  {plan.icon}
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-green-500">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.tier)}
                disabled={isCurrent}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-md ${
                  isCurrent ? 'bg-gray-300 text-gray-500 cursor-default' : plan.btnColor
                }`}
              >
                {isCurrent ? t.currentPlan : t.selectPlan}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
            
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t.paymentMethod}</h3>
                <p className="text-sm text-gray-500">{selectedPlan === 'pro' ? 'Pro Plan - 2500 DZD' : 'Elite Plan - 5000 DZD'}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Payment Tabs */}
            <div className="flex p-2 bg-white gap-2 border-b border-gray-100">
              <button
                onClick={() => setPaymentMethod('edahabia')}
                className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'edahabia' 
                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <CreditCard size={18} />
                {t.edahabia}
              </button>
              <button
                onClick={() => setPaymentMethod('ccp')}
                className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'ccp' 
                    ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Building size={18} />
                {t.ccp}
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {showSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <Check size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{t.paymentSuccess}</h4>
                  <p className="text-gray-500">Welcome to {selectedPlan?.toUpperCase()}!</p>
                </div>
              ) : (
                <>
                  {paymentMethod === 'edahabia' && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-40 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="flex justify-between items-start mb-8">
                            <span className="font-bold tracking-wider opacity-80">EDAHABIA</span>
                            <div className="w-10 h-6 bg-white/20 rounded-md" />
                        </div>
                        <div className="mb-4">
                            <div className="text-lg tracking-[0.15em] font-mono">**** **** **** 1234</div>
                        </div>
                        <div className="flex justify-between text-xs opacity-80">
                            <span>CARD HOLDER</span>
                            <span>EXPIRES</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">{t.cardNumber}</label>
                          <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none font-mono text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-xs font-medium text-gray-700 mb-1">{t.expiryDate}</label>
                             <input type="text" placeholder="MM/YY" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none font-mono text-sm" />
                           </div>
                           <div>
                             <label className="block text-xs font-medium text-gray-700 mb-1">CVC</label>
                             <input type="text" placeholder="123" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none font-mono text-sm" />
                           </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'ccp' && (
                    <div className="space-y-6">
                      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm text-yellow-800">
                        <p className="font-medium mb-2">{t.ccpInstructions}</p>
                        <div className="space-y-1 font-mono">
                            <div className="flex justify-between border-b border-yellow-200 pb-1">
                                <span>{t.ccpNumber}:</span>
                                <span className="font-bold">12345678</span>
                            </div>
                            <div className="flex justify-between border-b border-yellow-200 pb-1 pt-1">
                                <span>{t.ripKey}:</span>
                                <span className="font-bold">99</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span>{t.ccpHolder}:</span>
                                <span className="font-bold">NutriVision SARL</span>
                            </div>
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                         <Upload size={24} className="mb-2" />
                         <span className="text-sm font-medium">{t.uploadReceipt}</span>
                         <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full mt-6 bg-primary text-white py-4 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {t.processing}
                      </>
                    ) : (
                       paymentMethod === 'ccp' ? t.confirmTransfer : t.payNow
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;

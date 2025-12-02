import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Check, AlertCircle, ScanLine } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import { FoodItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface FoodScannerProps {
  onAddFood: (food: FoodItem) => void;
  t: any;
}

const FoodScanner: React.FC<FoodScannerProps> = ({ onAddFood, t }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await analyzeFoodImage(imagePreview);
      setResult(data);
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (result && imagePreview) {
      const newFood: FoodItem = {
        id: uuidv4(),
        name: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        portionSize: result.portionSize,
        imageUrl: imagePreview,
        confidence: result.confidence,
        timestamp: new Date()
      };
      onAddFood(newFood);
      // Reset
      setImagePreview(null);
      setResult(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{t.foodVision}</h2>
        <p className="text-gray-500">Snap a photo or upload an image to instantly track nutrition.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Image Area */}
        <div className="relative h-64 md:h-80 bg-gray-100 flex flex-col items-center justify-center border-b border-gray-200">
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Camera size={32} />
              </div>
              <p className="text-gray-500 mb-4">No image selected</p>
              <div className="flex gap-3 justify-center">
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Upload size={16} /> {t.upload}
                </button>
                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
              <Loader2 className="w-10 h-10 animate-spin mb-2" />
              <p className="font-medium">Analyzing Composition...</p>
            </div>
          )}
        </div>

        {/* Controls / Results */}
        <div className="p-6">
          {error && (
             <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
               <AlertCircle size={20} />
               <p>{error}</p>
             </div>
          )}

          {!result && imagePreview && !isAnalyzing && (
            <button
              onClick={handleAnalyze}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
            >
              <ScanLine size={20} />
              {t.analyze}
            </button>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{result.name}</h3>
                  <p className="text-gray-500 text-sm">{result.portionSize} • {Math.round(result.confidence * 100)}% Confidence</p>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                  {result.calories} kcal
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.protein}</p>
                  <p className="text-xl font-bold text-blue-600">{result.protein}g</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.carbs}</p>
                  <p className="text-xl font-bold text-orange-600">{result.carbs}g</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.fats}</p>
                  <p className="text-xl font-bold text-yellow-600">{result.fats}g</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 italic">
                "{result.analysis}"
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {setResult(null); setImagePreview(null);}}
                  className="flex-1 py-3 rounded-xl border border-gray-300 font-medium text-gray-600 hover:bg-gray-50"
                >
                  {t.discard}
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl bg-secondary text-white font-medium hover:bg-blue-600 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <Check size={18} />
                  {t.logFood}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodScanner;
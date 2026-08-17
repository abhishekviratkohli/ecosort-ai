import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Sparkles, 
  Leaf, 
  RotateCcw, 
  Clock, 
  Lightbulb, 
  Award, 
  ShieldAlert, 
  Droplet, 
  Cpu 
} from 'lucide-react';

export default function PredictionResult({ 
  result, 
  onReset, 
  currentUser, 
  onConfirmDisposal, 
  onOpenAuth 
}) {
  const [isDisposing, setIsDisposing] = useState(false);
  const [disposalConfirmed, setDisposalConfirmed] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  if (!result) return null;

  const binColorMap = {
    'Green': { 
      bg: 'bg-emerald-50 dark:bg-emerald-500/10', 
      border: 'border-emerald-200 dark:border-emerald-500/30', 
      text: 'text-emerald-700 dark:text-emerald-400', 
      hex: '#059669' 
    },
    'Blue': { 
      bg: 'bg-blue-50 dark:bg-blue-500/10', 
      border: 'border-blue-200 dark:border-blue-500/30', 
      text: 'text-blue-700 dark:text-blue-400', 
      hex: '#2563EB' 
    },
    'Yellow': { 
      bg: 'bg-amber-50 dark:bg-amber-500/10', 
      border: 'border-amber-200 dark:border-amber-500/30', 
      text: 'text-amber-700 dark:text-amber-400', 
      hex: '#D97706' 
    },
    'Red': { 
      bg: 'bg-rose-50 dark:bg-rose-500/10', 
      border: 'border-rose-200 dark:border-rose-500/30', 
      text: 'text-rose-700 dark:text-rose-400', 
      hex: '#DC2626' 
    }
  };

  const currentBinStyle = binColorMap[result.binColor] || binColorMap['Blue'];

  // Handle Confetti & Confirm Disposal
  const handleConfirmDisposal = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsDisposing(true);
    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#06B6D4', '#F59E0B', '#8B5CF6']
      });

      const response = await onConfirmDisposal(result.predictionId);
      if (response && response.success) {
        setDisposalConfirmed(true);
        setEarnedPoints(response.pointsAwarded);
      }
    } catch (err) {
      console.error('Error confirming disposal:', err);
    } finally {
      setIsDisposing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16 animate-fadeIn">
      
      {/* Back Button & Confidence Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Scan Another Item
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Classification Confidence:</span>
          <div className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold font-mono">
            {Math.round(result.confidence * 1000) / 10}%
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Classification & Bin Guidance (5 cols) */}
        <div className="md:col-span-5 space-y-5">
          
          <div className="firm-card p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentBinStyle.bg} ${currentBinStyle.border} ${currentBinStyle.text}`}>
                {result.badge || result.category}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">AI Verified</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight mb-1">
              {result.subItem || result.category}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-medium">
              Primary Stream: <strong className="text-slate-800 dark:text-slate-200">{result.category}</strong>
            </p>

            {/* Visual Municipal Bin Box */}
            <div className={`rounded-xl p-4 border ${currentBinStyle.border} ${currentBinStyle.bg} flex items-center gap-3.5`}>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm text-white shrink-0"
                style={{ backgroundColor: currentBinStyle.hex }}
              >
                🗑️
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Dispose in:</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  {result.binGuidance ? result.binGuidance.binName : `${result.binColor} Bin`}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Standard Municipal Segregation
                </div>
              </div>
            </div>

            {/* Explainable AI Rationale */}
            {result.explainability && (
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Explainable AI (Reasoning)
                  </h4>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  {result.explainability.rationale}
                </p>
              </div>
            )}

          </div>

          {/* Probabilities Matrix */}
          {result.probabilities && (
            <div className="firm-card p-4">
              <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Top Probabilities Matrix
              </h4>
              <div className="space-y-2">
                {result.probabilities.slice(0, 3).map((prob, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                      <span>{prob.category}</span>
                      <span className="font-mono font-bold">{Math.round(prob.score * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.round(prob.score * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Preparation Steps & Environmental Metrics (7 cols) */}
        <div className="md:col-span-7 space-y-5">
          
          {/* Step-by-Step Preparation Protocol */}
          <div className="firm-card p-5">
            <div className="flex items-center gap-2 mb-3.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                Step-by-Step Handling Protocol
              </h3>
            </div>

            <div className="space-y-2.5">
              {(result.circularAction?.prepSteps || [
                '1. Empty and clean residues.',
                '2. Flatten or separate composite parts.',
                '3. Deposit into the correct bin.'
              ]).map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Upcycling Idea */}
            {result.circularAction?.upcyclingIdea && (
              <div className="mt-3.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-amber-800 dark:text-amber-300">Upcycling Tip: </strong>
                  <span className="text-slate-700 dark:text-slate-300">{result.circularAction.upcyclingIdea}</span>
                </div>
              </div>
            )}
          </div>

          {/* Environmental Impact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="firm-card p-3.5 text-center">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1.5">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                +{result.environmentalImpact?.co2SavedGrams || 75}g
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">CO₂ Prevented</div>
            </div>

            <div className="firm-card p-3.5 text-center">
              <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-1.5">
                <Droplet className="w-3.5 h-3.5" />
              </div>
              <div className="text-base font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                {result.environmentalImpact?.waterSavedLiters || 1.2} L
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Water Saved</div>
            </div>

            <div className="firm-card p-3.5 text-center">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-1.5">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-extrabold text-amber-700 dark:text-amber-400 truncate">
                {result.decompositionTimeline || '450 Years'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Decomposition</div>
            </div>

          </div>

          {/* E-Waste Urban Mining Yield */}
          {result.urbanMiningYield && (
            <div className="firm-card p-4 border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h4 className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  Urban Mining: Recoverable Metals
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {result.urbanMiningYield.metals.map((metal, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900/80 p-2 rounded-md border border-amber-200 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{metal.material}:</span>
                    <span className="text-amber-600 dark:text-amber-300 font-mono ml-1 font-semibold">{metal.amount}</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                💰 {result.urbanMiningYield.economicValueEstimate}
              </div>
            </div>
          )}

          {/* Hazardous Warning Box */}
          {result.hazardSafety && (
            <div className="firm-card p-4 border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  {result.hazardSafety.toxicityLevel}
                </h4>
              </div>
              <div className="space-y-1 mb-3 text-xs text-rose-800 dark:text-rose-200">
                {result.hazardSafety.warnings.map((warn, i) => (
                  <div key={i}>{warn}</div>
                ))}
              </div>
              <div className="text-xs font-bold text-rose-900 dark:text-white bg-rose-100 dark:bg-rose-600/30 p-2 rounded-md border border-rose-300 dark:border-rose-500/40">
                Action: {result.hazardSafety.safeAction}
              </div>
            </div>
          )}

          {/* Confirmation & Eco-Points Card */}
          <div className="firm-card p-5 border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                  {disposalConfirmed ? 'Disposal Verified & Recorded!' : 'Ready to Dispose in Correct Bin?'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {disposalConfirmed 
                  ? `Earned +${earnedPoints} Eco-Points toward your community rank.`
                  : `Earn +${result.ecoPointsEligible || 15} Eco-Points for verifying segregation.`
                }
              </p>
            </div>

            {disposalConfirmed ? (
              <div className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Logged (+{earnedPoints} pts)
              </div>
            ) : (
              <button
                onClick={handleConfirmDisposal}
                disabled={isDisposing}
                className="btn-primary text-xs !py-2.5 !px-5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {currentUser ? 'Confirm Proper Disposal' : 'Sign In to Earn Points'}
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

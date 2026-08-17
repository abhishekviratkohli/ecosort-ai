import React from 'react';
import { Camera, Sparkles, Leaf, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Hero({ onStartScan, onExploreMap }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 px-4">
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-56 bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center">
        
        {/* Track / Standard Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Waste Segregation & Circular Management Platform</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.2] mb-4 font-heading">
          AI-Powered Waste Segregation. <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
            Automated Circular Action.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Classify packaging instantly with computer vision, follow verified municipal bin protocols, 
          calculate avoided CO₂ emissions, and earn verifiable Eco-Points.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={onStartScan}
            className="btn-primary text-sm !py-3 !px-6"
          >
            <Camera className="w-4 h-4" />
            Launch AI Scanner
          </button>

          <button
            onClick={onExploreMap}
            className="btn-secondary text-sm !py-3 !px-5"
          >
            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Find Local Drop-offs
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          
          <div className="firm-card p-4 text-center">
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">
              183.4 kg
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">CO₂ Emissions Offset</div>
          </div>

          <div className="firm-card p-4 text-center">
            <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-heading">
              1,240+
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Items Sorted</div>
          </div>

          <div className="firm-card p-4 text-center">
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-heading">
              96.8%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Model Accuracy</div>
          </div>

          <div className="firm-card p-4 text-center">
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-heading">
              6 Hubs
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Verified Recyclers</div>
          </div>

        </div>

      </div>
    </section>
  );
}

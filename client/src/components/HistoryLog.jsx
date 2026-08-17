import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  Leaf, 
  Droplet, 
  Award, 
  Calendar, 
  CheckCircle2 
} from 'lucide-react';
import { api } from '../services/api';

export default function HistoryLog({ currentUser, onSelectScan }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Plastic', 'Organic', 'Paper', 'Metal', 'Glass', 'E-Waste', 'Hazardous'];

  useEffect(() => {
    loadHistory();
  }, [selectedCategory]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory({
        category: selectedCategory === 'All' ? null : selectedCategory,
        limit: 20
      });
      if (data.success) {
        setHistoryItems(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Remove this scan from your history?')) return;
    try {
      const res = await api.deleteHistory(id);
      if (res.success) {
        setHistoryItems(prev => prev.filter(item => item._id !== id && item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const stats = currentUser?.stats || {
    totalScans: 0,
    totalCo2SavedKg: 0,
    totalWaterSavedLiters: 0,
    totalPlasticDivertedKg: 0
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            Personal Waste Logbook
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Track your personal diversion metrics, cumulative carbon offsets, and past classification audits.
        </p>
      </div>

      {/* Impact Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        
        <div className="firm-card p-4 text-center">
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.totalCo2SavedKg} kg
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center justify-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> CO₂ Offset
          </div>
        </div>

        <div className="firm-card p-4 text-center">
          <div className="text-xl sm:text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
            {stats.totalWaterSavedLiters} L
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center justify-center gap-1">
            <Droplet className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Water Saved
          </div>
        </div>

        <div className="firm-card p-4 text-center">
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {stats.totalScans}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Items Sorted
          </div>
        </div>

        <div className="firm-card p-4 text-center">
          <div className="text-xl sm:text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            {currentUser?.ecoPoints || 0}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Eco-Points
          </div>
        </div>

      </div>

      {/* Filter Category Bar */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List of Logged Scans */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Loading personal waste records...
        </div>
      ) : historyItems.length === 0 ? (
        <div className="firm-card p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
          No records found in this category. Perform a new scan with the AI Scanner!
        </div>
      ) : (
        <div className="space-y-2.5">
          {historyItems.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={item._id || item.id}
                className="firm-card p-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-lg shrink-0">
                    {item.category === 'Plastic' ? '🍶' :
                     item.category === 'Organic' ? '🍌' :
                     item.category === 'E-Waste' ? '📱' :
                     item.category === 'Paper' ? '📦' :
                     item.category === 'Metal' ? '🥫' :
                     item.category === 'Glass' ? '🫙' : '🔋'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-heading">
                        {item.subItem || item.category}
                      </h4>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {dateStr}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                        +{item.co2SavedGrams}g CO₂
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-mono font-medium">
                        +{item.pointsAwarded} pts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                    {Math.round((item.confidence || 0.95) * 100)}% Match
                  </span>
                  
                  <button
                    onClick={(e) => handleDelete(item._id || item.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

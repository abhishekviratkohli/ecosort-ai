import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Leaf, 
  Clock, 
  Lightbulb, 
  CheckCircle2, 
  Search 
} from 'lucide-react';
import { api } from '../services/api';

export default function WasteCatalog() {
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await api.getCatalog();
      if (data.success) {
        setCategories(data.categories || []);
        if (data.categories.length > 0) setSelectedCatId(data.categories[0].id);
      }
    } catch (err) {
      console.error('Failed to load catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === selectedCatId) || categories[0];

  const filteredCategories = categories.filter(c =>
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subItems?.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              Universal Circular Waste Catalog
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Interactive guide to 7 waste streams, 28 sub-materials, decomposition timelines, and upcycling protocols.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="firm-input !py-1.5 !pl-9 text-xs"
          />
        </div>
      </div>

      {/* Grid: Sidebar (4 cols) + Detailed View (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredCategories.map((cat) => {
            const isSelected = selectedCategory?.id === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`firm-card p-3.5 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-slate-800/80'
                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.hexCode }}
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-heading line-clamp-1">
                      {cat.displayName}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {cat.subItems?.length || 0} sub-materials cataloged
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                  {cat.decompositionTimeline?.split(' ')[0]} {cat.decompositionTimeline?.split(' ')[1]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane (8 cols) */}
        {selectedCategory && (
          <div className="lg:col-span-8 space-y-5">
            
            {/* Master Overview Card */}
            <div className="firm-card p-5 relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  style={{ 
                    backgroundColor: `${selectedCategory.hexCode}15`,
                    borderColor: `${selectedCategory.hexCode}40`,
                    color: selectedCategory.hexCode
                  }}
                >
                  {selectedCategory.badge}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Decomposes in: <strong className="text-slate-800 dark:text-slate-200">{selectedCategory.decompositionTimeline}</strong>
                </div>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading mb-1.5">
                {selectedCategory.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                <strong className="text-emerald-600 dark:text-emerald-400">Primary Circular Action: </strong>
                {selectedCategory.primaryAction}
              </p>

              {/* Bin Guidance Callout */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Recommended Municipal Bin:</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedCategory.binGuidance?.binName || `${selectedCategory.binColor} Bin`}
                  </div>
                </div>

                <div 
                  className="px-3 py-1 rounded-lg text-xs font-bold text-white uppercase shadow-sm"
                  style={{ backgroundColor: selectedCategory.hexCode }}
                >
                  {selectedCategory.binColor} Bin
                </div>
              </div>
            </div>

            {/* Sub-Items List */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                Common Items & Specific Handling Protocol
              </h4>

              {selectedCategory.subItems?.map((item, idx) => (
                <div key={idx} className="firm-card p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-heading">
                      {item.name}
                    </h5>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                      Item #{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Handling:</strong> {item.prep}</span>
                    </div>

                    <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Upcycling Tip:</strong> {item.upcycling}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

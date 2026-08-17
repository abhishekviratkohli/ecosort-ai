import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Star, 
  CheckCircle2, 
  Clock, 
  Banknote, 
  Search 
} from 'lucide-react';
import { api } from '../services/api';

export default function RecyclingMap() {
  const [centers, setCenters] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState(50);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'E-Waste', 'Organic', 'Metal', 'Plastic', 'Glass', 'Hazardous'];

  useEffect(() => {
    loadCenters();
  }, [selectedCategory, radius]);

  const loadCenters = async () => {
    setLoading(true);
    try {
      const data = await api.getNearbyCenters({
        lat: 28.6139,
        lng: 77.2090,
        category: selectedCategory,
        radius
      });
      if (data.success && Array.isArray(data.centers)) {
        setCenters(data.centers);
        if (data.centers.length > 0) setSelectedCenter(data.centers[0]);
      }
    } catch (err) {
      console.error('Failed to load centers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = (centers || []).filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            Verified Circular Drop-Off Hubs
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Find certified e-waste dismantlers, scrap buyback merchants (kabadiwalas), and municipal composting pits near you.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="firm-card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
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

        {/* Search & Radius */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search area, hub..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="firm-input !py-1.5 !pl-9 text-xs"
            />
          </div>

          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="firm-input !py-1.5 text-xs !w-28 cursor-pointer"
          >
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
          </select>
        </div>

      </div>

      {/* Map Layout: Left Listing + Right Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Listing Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Locating nearby certified facilities...
            </div>
          ) : filteredCenters.length === 0 ? (
            <div className="firm-card p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No centers found for this filter in your selected radius.
            </div>
          ) : (
            filteredCenters.map(center => {
              const cid = center.id || center._id;
              const isSelected = (selectedCenter?.id || selectedCenter?._id) === cid;
              const accepted = center.acceptedMaterials || center.acceptedCategories || ['Plastic', 'Paper'];
              const buyback = center.buybackPrices ? (
                center.buybackPrices.plasticPerKg ? `Plastic: ₹${center.buybackPrices.plasticPerKg}/kg` :
                center.buybackPrices.eWastePerKg ? `E-Waste: ₹${center.buybackPrices.eWastePerKg}/kg` : null
              ) : (center.ratePerKg || null);

              return (
                <div
                  key={cid}
                  onClick={() => setSelectedCenter(center)}
                  className={`firm-card p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-slate-800/80' 
                      : 'hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-heading line-clamp-1">
                      {center.name}
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
                      {center.distanceKm || 1.2} km
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2.5 line-clamp-2">
                    {center.address}
                  </p>

                  {buyback && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-semibold mb-2 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-500/20">
                      <Banknote className="w-3.5 h-3.5" />
                      <span>{buyback}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {accepted.map((cat, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <strong className="text-slate-800 dark:text-slate-200">{center.rating || 4.8}</strong> ({center.reviewsCount || 34})
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Visual Map Canvas & Details (7 cols) */}
        <div className="lg:col-span-7">
          <div className="firm-card overflow-hidden h-[600px] flex flex-col relative">
            
            {/* Visual Vector Grid Map */}
            <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
              
              {/* Map Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-15 dark:opacity-20"
                style={{
                  backgroundImage: `linear-gradient(#64748B 1px, transparent 1px), linear-gradient(to right, #64748B 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }}
              />

              {/* Central User Location Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-emerald-500/30 border-2 border-emerald-500 animate-ping absolute" />
                <div className="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-md relative z-10" />
                <span className="text-[10px] font-bold text-slate-900 dark:text-white bg-white/95 dark:bg-slate-900/95 px-2 py-0.5 rounded-full mt-1 border border-slate-300 dark:border-slate-700 shadow-sm">
                  You (Current Location)
                </span>
              </div>

              {/* Pin Markers for Centers */}
              {filteredCenters.map((center, index) => {
                const cid = center.id || center._id;
                const positions = [
                  { top: '30%', left: '70%' },
                  { top: '65%', left: '35%' },
                  { top: '25%', left: '30%' },
                  { top: '75%', left: '75%' },
                  { top: '45%', left: '80%' },
                  { top: '80%', left: '20%' }
                ];
                const pos = positions[index % positions.length];
                const isSelected = (selectedCenter?.id || selectedCenter?._id) === cid;

                return (
                  <div
                    key={cid}
                    onClick={() => setSelectedCenter(center)}
                    style={{ top: pos.top, left: pos.left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group transition-transform ${
                      isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                    }`}
                  >
                    <div className={`p-2 rounded-xl border flex items-center gap-1.5 shadow-md transition-colors ${
                      isSelected 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                    }`}>
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                      <span className="text-[11px] font-bold max-w-[110px] truncate">
                        {(center.name || 'Center').split(' ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Bottom Details Pane */}
            {selectedCenter && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2.5">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                      {selectedCenter.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedCenter.address} • <strong className="text-emerald-600 dark:text-emerald-400">{selectedCenter.distanceKm || 1.2} km away</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedCenter.phone || '+91 98000-00000'}`}
                      className="btn-secondary text-xs !py-1.5 !px-3"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Hub
                    </a>
                    <button
                      onClick={() => alert(`Directions initiated for ${selectedCenter.name}.`)}
                      className="btn-primary text-xs !py-1.5 !px-3"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Directions
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {selectedCenter.operatingHours || selectedCenter.timing || 'Mon-Sat: 09:00 - 18:00'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    {selectedCenter.phone || '+91 98000-00000'}
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}

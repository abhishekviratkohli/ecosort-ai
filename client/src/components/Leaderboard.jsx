import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Award, 
  Target, 
  Users, 
  Building, 
  Clock 
} from 'lucide-react';
import { api } from '../services/api';

export default function Leaderboard({ currentUser }) {
  const [scope, setScope] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [institutionData, setInstitutionData] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [scope]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard(scope);
      if (data.success) {
        setLeaderboardData(data.leaderboard || []);
        setInstitutionData(data.institutionRankings || []);
        setChallenges(data.activeChallenges || []);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const allBadgesList = [
    { id: 'seedling_sorter', title: 'Seedling Sorter', icon: '🌱', desc: '1st scan completed' },
    { id: 'week_warrior', title: 'Week Warrior', icon: '⚡', desc: '7-day active streak' },
    { id: 'master_recycler', title: 'Master Recycler', icon: '♻️', desc: '20+ items sorted' },
    { id: 'urban_miner', title: 'Urban Miner', icon: '💎', desc: 'E-waste diverted' },
    { id: 'carbon_champion', title: 'Carbon Champion', icon: '🌍', desc: '10+ kg CO2 offset' },
    { id: 'zero_waste_hero', title: 'Zero Waste Hero', icon: '👑', desc: '1,000+ Eco-Points' }
  ];

  const userBadgeIds = new Set(currentUser?.badges?.map(b => b.id || b.badgeId) || []);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Eco-Champions Arena & Gamified League</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
          Community Leaderboard & Badges
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-1">
          Compete in zero-waste challenges, unlock sustainability milestones, and climb the campus leagues.
        </p>
      </div>

      {/* Active Campus & City Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {challenges.map(chal => {
          const progressPercent = Math.min(100, Math.round((chal.progress / chal.goal) * 100));
          return (
            <div key={chal.id} className="firm-card p-5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 inline-flex items-center gap-1">
                  <Target className="w-3 h-3" /> Active Challenge
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  <Clock className="w-3 h-3" /> {chal.daysLeft} days left
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading mb-1">
                {chal.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                {chal.target}
              </p>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">{chal.progress} / {chal.goal} {chal.unit}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
                🎁 Reward: {chal.reward}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Badges Showcase */}
      <div className="firm-card p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
              Achievement Badges
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {userBadgeIds.size} of {allBadgesList.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {allBadgesList.map(badge => {
            const isUnlocked = userBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/50 dark:bg-slate-900 border-amber-300 dark:border-amber-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 opacity-40 grayscale'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {badge.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  {badge.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitive Rankings Table */}
      <div className="firm-card overflow-hidden">
        
        {/* Toggle Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Rankings
          </h3>

          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                scope === 'all'
                  ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1" />
              Individual Sorters
            </button>

            <button
              onClick={() => setScope('institutions')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                scope === 'institutions'
                  ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5 inline mr-1" />
              Campus / Societies
            </button>
          </div>
        </div>

        {/* Table Content */}
        {scope === 'all' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Eco Champion</th>
                  <th className="py-3 px-4">Campus / Society</th>
                  <th className="py-3 px-4 text-center">Streak</th>
                  <th className="py-3 px-4 text-center">Scans</th>
                  <th className="py-3 px-4 text-center">CO₂ Offset</th>
                  <th className="py-3 px-4 text-right">Eco-Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {leaderboardData.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  const rankIcons = {
                    1: '🥇',
                    2: '🥈',
                    3: '🥉'
                  };

                  return (
                    <tr 
                      key={user.id} 
                      className={`transition-colors ${
                        isCurrent ? 'bg-emerald-50 dark:bg-emerald-500/10 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {rankIcons[user.rank] || `#${user.rank}`}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {user.name[0]}
                          </div>
                          <span>{user.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {user.institution || 'Independent'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-amber-600 dark:text-amber-400 font-bold">
                        🔥 {user.streak}d
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                        {user.scansCount}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-600 dark:text-emerald-400">
                        {user.co2SavedKg} kg
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        {user.ecoPoints} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Institution / Campus</th>
                  <th className="py-3 px-4 text-center">Active Members</th>
                  <th className="py-3 px-4 text-center">Total Scans</th>
                  <th className="py-3 px-4 text-center">Total CO₂ Saved</th>
                  <th className="py-3 px-4 text-right">Aggregate Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {institutionData.map((inst) => (
                  <tr key={inst.institution} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {inst.rank === 1 ? '🏆' : `#${inst.rank}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {inst.institution}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                      {inst.totalMembers}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                      {inst.totalScans}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {inst.totalCo2SavedKg} kg
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {inst.totalEcoPoints} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}

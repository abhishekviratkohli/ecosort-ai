import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Leaf, 
  Users, 
  BarChart3, 
  MapPin, 
  Activity, 
  Droplet,
  Plus,
  Trash2,
  Edit,
  Download,
  Lock,
  Crown,
  Bell,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminAnalytics({ currentUser, onOpenAuthModal }) {
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry', 'users', 'centers', 'alerts'
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [centersList, setCentersList] = useState([]);
  const [alertsList, setAlertsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms State
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterAddress, setNewCenterAddress] = useState('');
  const [newCenterPhone, setNewCenterPhone] = useState('+91 98000-00000');
  const [newCenterLat, setNewCenterLat] = useState('28.6139');
  const [newCenterLng, setNewCenterLng] = useState('77.2090');
  const [newCenterPlasticPrice, setNewCenterPlasticPrice] = useState('18');
  const [newCenterEWastePrice, setNewCenterEWastePrice] = useState('120');
  
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertMessage, setNewAlertMessage] = useState('');
  const [newAlertZone, setNewAlertZone] = useState('All Municipal Zones');
  const [newAlertSeverity, setNewAlertSeverity] = useState('info');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    loadAllData();
  }, [isAdmin]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const metricRes = await api.getAdminMetrics();
      if (metricRes.success) setMetrics(metricRes);

      const alertRes = await api.getMunicipalAlerts();
      if (alertRes.success) setAlertsList(alertRes.alerts || []);

      const centerRes = await api.getNearbyCenters();
      if (centerRes.success) setCentersList(centerRes.centers || []);

      if (isAdmin) {
        const userRes = await api.getAdminUsers();
        if (userRes.success) setUsersList(userRes.users || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteRole = async (userId, targetRole) => {
    try {
      const res = await api.updateUserRole(userId, targetRole);
      if (res.success) {
        setUsersList(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, role: targetRole } : u));
        alert(`User role updated to ${targetRole}!`);
      }
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleCreateCenter = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addRecyclingCenter({
        name: newCenterName,
        address: newCenterAddress,
        phone: newCenterPhone,
        lat: parseFloat(newCenterLat),
        lng: parseFloat(newCenterLng),
        acceptedMaterials: ['Plastic', 'E-Waste', 'Metal', 'Paper'],
        buybackPrices: {
          plasticPerKg: parseFloat(newCenterPlasticPrice) || 18,
          eWastePerKg: parseFloat(newCenterEWastePrice) || 120,
          metalPerKg: 35,
          paperPerKg: 12,
          glassPerKg: 6
        }
      });
      if (res.success) {
        setShowCenterModal(false);
        setNewCenterName('');
        setNewCenterAddress('');
        loadAllData();
        alert('Verified Recycling Hub Added Successfully!');
      }
    } catch (err) {
      alert('Error creating center');
    }
  };

  const handleDeleteCenter = async (id) => {
    if (!confirm('Are you sure you want to remove this recycling center?')) return;
    try {
      const res = await api.deleteRecyclingCenter(id);
      if (res.success) {
        setCentersList(prev => prev.filter(c => c.id !== id && c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addMunicipalAlert({
        title: newAlertTitle,
        message: newAlertMessage,
        zone: newAlertZone,
        severity: newAlertSeverity
      });
      if (res.success) {
        setShowAlertModal(false);
        setNewAlertTitle('');
        setNewAlertMessage('');
        loadAllData();
        alert('Municipal Alert Broadcasted!');
      }
    } catch (err) {
      alert('Error creating alert');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      const res = await api.deleteMunicipalAlert(id);
      if (res.success) {
        setAlertsList(prev => prev.filter(a => a.id !== id && a._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = async () => {
    try {
      await api.downloadAuditCSV();
    } catch (err) {
      alert('Failed to download audit logs.');
    }
  };

  // If user is not admin, show Access Gate
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn text-center">
        <div className="firm-card p-10 max-w-lg mx-auto bg-white dark:bg-slate-900 border-amber-500/30">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading mb-2">
            Municipal Administrator Access Required
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            The Waste Intelligence & Contamination Command Center is restricted to authorized municipal officers and the <strong>Super Administrator</strong>.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-left mb-6 text-xs space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" /> Super Admin Access:
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Sign in with <strong>abhisheksingh.gwl3@gmail.com</strong> or use the 1-click <strong>City Admin (MSW Officer)</strong> button to unlock full controls.
            </p>
          </div>

          <button
            onClick={onOpenAuthModal}
            className="btn-primary w-full text-xs font-bold !py-2.5"
          >
            Sign in with Super Admin Account
          </button>
        </div>
      </div>
    );
  }

  const summary = metrics?.summary || {};
  const streams = metrics?.wasteStreamBreakdown || [];
  const zones = metrics?.municipalZones || [];
  const trend = metrics?.recentActivityTrend || [];

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 animate-fadeIn">
      
      {/* Header Bar with Super Admin Crest & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isSuperAdmin ? (
              <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 text-[10px] font-bold font-mono flex items-center gap-1">
                <Crown className="w-3 h-3 text-purple-600 dark:text-purple-400" /> SUPER ADMIN MODE
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 text-[10px] font-bold font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-rose-600 dark:text-rose-400" /> CITY ADMIN
              </span>
            )}
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              Waste Intelligence & Control Center
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Welcome, <strong>{currentUser.name}</strong>. Full administrative permissions active across municipal solid waste telemetry.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit Logs (CSV)
          </button>
        </div>
      </div>

      {/* Control Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'telemetry'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Telemetry & Heatmaps
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Citizen User Roles ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('centers')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'centers'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Recycle Hubs ({centersList.length})
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Municipal Broadcasts ({alertsList.length})
        </button>
      </div>

      {/* TAB 1: TELEMETRY & HEATMAPS */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Top Stat Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="firm-card p-4">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-xs font-semibold">Registered Citizens</span>
                <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                {usersList.length || 4}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {summary.totalScansClassified || 448} total items sorted
              </div>
            </div>

            <div className="firm-card p-4">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-xs font-semibold">Gross Landfill Diverted</span>
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">
                {summary.totalLandfillDivertedKg || 220} kg
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                ~{summary.totalCo2SavedKg || 155} kg CO₂ offset
              </div>
            </div>

            <div className="firm-card p-4">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-xs font-semibold">Water Conserved</span>
                <Droplet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-heading">
                {summary.totalWaterSavedLiters || 3200} L
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Equivalent to 16 trees planted
              </div>
            </div>

            <div className="firm-card p-4">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-xs font-semibold">Segregation Accuracy</span>
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-heading">
                {summary.overallSegregationAccuracy || '96.4%'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Across 7 waste master streams
              </div>
            </div>
          </div>

          {/* Stream Breakdown & Velocity Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 firm-card p-5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Classified Waste Stream Volume
              </h3>
              <div className="space-y-3.5">
                {streams.map((stream) => (
                  <div key={stream.name}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-800 dark:text-slate-200">{stream.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">{stream.divertedKg} kg ({stream.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${stream.percentage}%`, backgroundColor: stream.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 firm-card p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  7-Day Citizen Sorting Velocity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Daily volume of validated waste segregation scans across all connected clients.
                </p>
              </div>

              <div className="grid grid-cols-7 gap-2 items-end h-36 pb-2 border-b border-slate-200 dark:border-slate-800">
                {trend.map((t) => {
                  const heightPercent = Math.min(100, Math.round((t.scans / 140) * 100));
                  return (
                    <div key={t.day} className="flex flex-col items-center gap-1 h-full justify-end group">
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {t.scans}
                      </div>
                      <div 
                        className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-teal-500 group-hover:brightness-110 transition-all"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.day}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2.5">
                <span>Peak Day: Sunday (130 scans)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+42% Growth</span>
              </div>
            </div>
          </div>

          {/* Municipal Ward Contamination Heatmap */}
          <div className="firm-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Municipal Zone Contamination Risk Heatmap
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                4 Municipal Zones Monitored
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Municipal Ward / Zone</th>
                    <th className="py-3 px-4 text-center">Compliance</th>
                    <th className="py-3 px-4 text-center">Contamination Risk</th>
                    <th className="py-3 px-4">Primary Waste Type</th>
                    <th className="py-3 px-4 text-right">Smart Bins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {zones.map((zone) => (
                    <tr key={zone.zone} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {zone.zone}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {zone.complianceRate}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          zone.contaminationRisk === 'Low'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                            : zone.contaminationRisk === 'Low-Med'
                            ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30'
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                        }`}>
                          {zone.contaminationRisk}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {zone.dominantWaste}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        {zone.activeBins} Bins
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CITIZEN USER ROLES MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="firm-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                Registered Citizen User Directory & RBAC Privileges
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant or revoke Municipal Administrator privileges for registered accounts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Institution / Society</th>
                  <th className="py-3 px-4 text-center">Eco-Points</th>
                  <th className="py-3 px-4 text-center">Role Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {usersList.map((user) => {
                  const uid = user.id || user._id;
                  const isUserSuper = user.role === 'super_admin' || user.email === 'abhisheksingh.gwl3@gmail.com';
                  return (
                    <tr key={uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {isUserSuper && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        {user.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {user.email}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {user.institution || 'Green Community'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {user.ecoPoints || 0} pts
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          user.role === 'super_admin'
                            ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                            : user.role === 'admin'
                            ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isUserSuper ? (
                          <span className="text-[10px] text-slate-400 font-semibold italic">Permanent Super Admin</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {user.role === 'admin' ? (
                              <button
                                onClick={() => handlePromoteRole(uid, 'citizen')}
                                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition-all"
                              >
                                Demote to Citizen
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePromoteRole(uid, 'admin')}
                                className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-[10px] font-bold border border-rose-300 dark:border-rose-500/30 transition-all"
                              >
                                Promote to Admin
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RECYCLING HUBS MANAGEMENT */}
      {activeTab === 'centers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                Municipal Verified Drop-Off & Buyback Centers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage verified scrap dealers, e-waste recyclers, and set current municipal buyback rates.
              </p>
            </div>

            <button
              onClick={() => setShowCenterModal(true)}
              className="btn-primary text-xs !py-1.5 !px-3 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Recycling Hub
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centersList.map((c) => {
              const cid = c.id || c._id;
              return (
                <div key={cid} className="firm-card p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-heading line-clamp-1">
                        {c.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold shrink-0">
                        Verified
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                      {c.address}
                    </p>

                    <div className="space-y-1 text-xs mb-4">
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        <strong>Buyback:</strong> Plastic: ₹{c.buybackPrices?.plasticPerKg || 18}/kg • E-Waste: ₹{c.buybackPrices?.eWastePerKg || 120}/kg
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Phone: {c.phone}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">Lat: {c.lat}, Lng: {c.lng}</span>
                    <button
                      onClick={() => handleDeleteCenter(cid)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                      title="Remove Hub"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MUNICIPAL BROADCASTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                Citizen Waste Segregation Broadcasts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publish city-wide announcements, collection delays, or specialized drive alerts.
              </p>
            </div>

            <button
              onClick={() => setShowAlertModal(true)}
              className="btn-primary text-xs !py-1.5 !px-3 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Broadcast New Alert
            </button>
          </div>

          <div className="space-y-3">
            {alertsList.map((a) => {
              const aid = a.id || a._id;
              return (
                <div key={aid} className="firm-card p-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-heading">
                          {a.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                          {a.zone}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {a.message}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAlert(aid)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD RECYCLING HUB */}
      {showCenterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="firm-card max-w-md w-full p-6 relative bg-white dark:bg-slate-900">
            <button
              onClick={() => setShowCenterModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading mb-4">
              Add Verified Recycling Hub
            </h3>
            <form onSubmit={handleCreateCenter} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Center Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GreenTech E-Waste Recovery"
                  value={newCenterName}
                  onChange={(e) => setNewCenterName(e.target.value)}
                  className="firm-input"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 15, Industrial Phase 1"
                  value={newCenterAddress}
                  onChange={(e) => setNewCenterAddress(e.target.value)}
                  className="firm-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Latitude</label>
                  <input
                    type="text"
                    required
                    value={newCenterLat}
                    onChange={(e) => setNewCenterLat(e.target.value)}
                    className="firm-input"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Longitude</label>
                  <input
                    type="text"
                    required
                    value={newCenterLng}
                    onChange={(e) => setNewCenterLng(e.target.value)}
                    className="firm-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Plastic Buyback (₹/kg)</label>
                  <input
                    type="number"
                    value={newCenterPlasticPrice}
                    onChange={(e) => setNewCenterPlasticPrice(e.target.value)}
                    className="firm-input"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">E-Waste Buyback (₹/kg)</label>
                  <input
                    type="number"
                    value={newCenterEWastePrice}
                    onChange={(e) => setNewCenterEWastePrice(e.target.value)}
                    className="firm-input"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full text-xs !py-2.5 mt-2">
                Save & Publish Recycling Hub
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST ALERT */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="firm-card max-w-md w-full p-6 relative bg-white dark:bg-slate-900">
            <button
              onClick={() => setShowAlertModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading mb-4">
              Broadcast Municipal Waste Announcement
            </h3>
            <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. E-Waste Drive This Sunday"
                  value={newAlertTitle}
                  onChange={(e) => setNewAlertTitle(e.target.value)}
                  className="firm-input"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Message Content</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details regarding collection times, materials accepted, and drop-off points."
                  value={newAlertMessage}
                  onChange={(e) => setNewAlertMessage(e.target.value)}
                  className="firm-input"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Target Zone</label>
                <select
                  value={newAlertZone}
                  onChange={(e) => setNewAlertZone(e.target.value)}
                  className="firm-input"
                >
                  <option value="All Municipal Zones">All Municipal Zones</option>
                  <option value="Ward 4 (Central & Tech Park)">Ward 4 (Central & Tech Park)</option>
                  <option value="Ward 7 (Residential Heights)">Ward 7 (Residential Heights)</option>
                  <option value="Ward 12 (Industrial Belt)">Ward 12 (Industrial Belt)</option>
                  <option value="Ward 2 (Market & Street Food)">Ward 2 (Market & Street Food)</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full text-xs !py-2.5 mt-2">
                Broadcast to All Citizens
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

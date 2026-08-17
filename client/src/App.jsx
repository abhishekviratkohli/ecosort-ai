import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Scanner from './components/Scanner';
import PredictionResult from './components/PredictionResult';
import RecyclingMap from './components/RecyclingMap';
import Leaderboard from './components/Leaderboard';
import HistoryLog from './components/HistoryLog';
import AdminAnalytics from './components/AdminAnalytics';
import WasteCatalog from './components/WasteCatalog';
import AuthModal from './components/AuthModal';
import { api, getAuthToken, removeAuthToken } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'map', 'leaderboard', 'catalog', 'history', 'admin'
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ecosort_theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ecosort_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Check auth on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then(res => {
          if (res.success && res.user) {
            setCurrentUser(res.user);
          } else {
            removeAuthToken();
          }
        })
        .catch(() => removeAuthToken());
    } else {
      // Default to Demo user Aarav on first load for a seamless out-of-the-box experience
      handleSelectDemoUser('usr_aarav_001');
    }
  }, []);

  // Quick Demo User Switcher
  const handleSelectDemoUser = async (userId) => {
    try {
      const res = await api.getDemoUsers();
      if (res.success) {
        const selected = res.demoUsers.find(u => u.id === userId) || res.demoUsers[0];
        const passwordMap = {
          'usr_aarav_001': 'Password123!',
          'usr_priya_002': 'Password123!',
          'usr_admin_003': 'AdminSecure2026!'
        };
        const loginRes = await api.login(selected.email, passwordMap[selected.id] || 'Password123!');
        if (loginRes.success) {
          const meRes = await api.getMe();
          if (meRes.success) {
            setCurrentUser(meRes.user);
          }
        }
      }
    } catch (err) {
      console.error('Failed to switch demo user:', err);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
  };

  const handleScanComplete = (resultData, capturedImage) => {
    setPredictionResult(resultData);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleConfirmDisposal = async (predictionId) => {
    const res = await api.confirmDisposal(predictionId);
    if (res.success) {
      const meRes = await api.getMe();
      if (meRes.success) {
        setCurrentUser(meRes.user);
      }
    }
    return res;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'scanner') setPredictionResult(null);
        }}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onSelectDemoUser={handleSelectDemoUser}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === 'scanner' && (
          <>
            <Hero 
              onStartScan={() => window.scrollTo({ top: 440, behavior: 'smooth' })}
              onExploreMap={() => setActiveTab('map')}
            />
            
            {predictionResult ? (
              <PredictionResult
                result={predictionResult}
                onReset={() => setPredictionResult(null)}
                currentUser={currentUser}
                onConfirmDisposal={handleConfirmDisposal}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            ) : (
              <Scanner
                onScanComplete={handleScanComplete}
                isProcessing={isProcessingScan}
                setIsProcessing={setIsProcessingScan}
              />
            )}
          </>
        )}

        {activeTab === 'map' && (
          <div className="pt-8">
            <RecyclingMap />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="pt-8">
            <Leaderboard currentUser={currentUser} />
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="pt-8">
            <WasteCatalog />
          </div>
        )}

        {activeTab === 'history' && currentUser && (
          <div className="pt-8">
            <HistoryLog 
              currentUser={currentUser} 
              onSelectScan={(item) => {
                setPredictionResult(item);
                setActiveTab('scanner');
              }}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="pt-8">
            <AdminAnalytics />
          </div>
        )}
      </main>

      {/* Enterprise Standard Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B0F19] py-8 px-4 text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200 font-heading">EcoSort AI Enterprise</span>
            <span>— Smart Waste Segregation & Circular Economy Management Platform</span>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <span>Sustainability Track</span>
            <span>•</span>
            <span>Zero-Waste Cities</span>
            <span>•</span>
            <span>ISO 14001 Compliant</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
        onSelectDemoUser={handleSelectDemoUser}
      />

    </div>
  );
}

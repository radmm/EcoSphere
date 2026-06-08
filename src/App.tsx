import { useState, useEffect, useRef } from 'react';
import { FootprintData, ChatMessage, LoggedActionInstance } from './types';
import {
  calculateCarbonFootprint,
  INITIAL_FOOTPRINT_DATA,
  ECO_ACTIONS,
} from './lib/carbonUtils';
import Dashboard from './components/Dashboard';
import {
  Leaf,
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Sparkles,
  MessageSquare,
  Settings,
  Activity,
  CheckCircle2,
  TrendingDown,
  Trees,
  Award,
  History,
  Send,
  Loader2,
  Trash2,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'actions' | 'coach'>('dashboard');

  // Footprint Input States (loaded from localStorage or default)
  const [footprintData, setFootprintData] = useState<FootprintData>(() => {
    const saved = localStorage.getItem('eco_footprint_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_FOOTPRINT_DATA;
  });

  // Green Points & Carbon Saved tracking
  const [greenPoints, setGreenPoints] = useState<number>(() => {
    const saved = localStorage.getItem('eco_green_points');
    return saved ? parseInt(saved, 10) : 150; // start with some welcoming points
  });

  const [totalSavedCo2, setTotalSavedCo2] = useState<number>(() => {
    const saved = localStorage.getItem('eco_saved_co2');
    return saved ? parseFloat(saved) : 12.4; // welcoming starting footprint saved metrics
  });

  // Logged actions list (for history tracking)
  const [loggedActions, setLoggedActions] = useState<LoggedActionInstance[]>(() => {
    const saved = localStorage.getItem('eco_logged_actions');
    return saved ? JSON.parse(saved) : [
      {
        id: 'starting_log_1',
        actionId: 'act_01',
        name: 'Meat-Free Day',
        co2SavedKg: 3.5,
        points: 30,
        category: 'food',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'starting_log_2',
        actionId: 'act_03',
        name: 'Line Dry Laundry',
        co2SavedKg: 1.8,
        points: 25,
        category: 'energy',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      }
    ];
  });

  // AI Chat Messages state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('eco_chat_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'msg_welcome',
        role: 'model',
        content: `Hello! I'm **Sustaina**, your personal AI Sustainability Coach. 🌿

I've analyzed your household carbon indicators! You are currently producing an estimated **${calculateCarbonFootprint(footprintData).totalYearlyTons} Metric Tons** of CO2e annually.

How can I assist you in hitting your sustainable target today?
* Ask me to design a carbon-friendly leftover recipe!
* Request a custom plan for your highest emissions category.
* Compare green commuter options.`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Synchronize layout-state changes to local storage on save
  useEffect(() => {
    localStorage.setItem('eco_footprint_data', JSON.stringify(footprintData));
  }, [footprintData]);

  useEffect(() => {
    localStorage.setItem('eco_green_points', greenPoints.toString());
  }, [greenPoints]);

  useEffect(() => {
    localStorage.setItem('eco_saved_co2', totalSavedCo2.toString());
  }, [totalSavedCo2]);

  useEffect(() => {
    localStorage.setItem('eco_logged_actions', JSON.stringify(loggedActions));
  }, [loggedActions]);

  useEffect(() => {
    localStorage.setItem('eco_chat_messages', JSON.stringify(messages));
    // Scroll to bottom on message updates
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Recalculated dynamic profile summary
  const summary = calculateCarbonFootprint(footprintData);

  // Handles updating input fields to footprint
  const updateFootprintField = (key: keyof FootprintData, value: any) => {
    setFootprintData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Eco-Actions interaction handlers
  const handleLogAction = (actionId: string) => {
    const targetAction = ECO_ACTIONS.find((act) => act.id === actionId);
    if (!targetAction) return;

    // Create instanced entry
    const newLog: LoggedActionInstance = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      actionId: targetAction.id,
      name: targetAction.name,
      co2SavedKg: targetAction.co2SavedKg,
      points: targetAction.points,
      category: targetAction.category,
      timestamp: new Date().toISOString(),
    };

    setLoggedActions((prev) => [newLog, ...prev]);
    setGreenPoints((prev) => prev + targetAction.points);
    setTotalSavedCo2((prev) => prev + targetAction.co2SavedKg);

    // Provide warm systemic chat injection notification
    const coachNotification: ChatMessage = {
      id: `msg_notif_${Date.now()}`,
      role: 'model',
      content: `🎉 **Action Logged successfully!**
You completed: *"${targetAction.name}"* and successfully eliminated **-${targetAction.co2SavedKg} kg CO2e** from your footprint today.
You accumulated **+${targetAction.points} Green Points**! Excellent job. Let's keep it up!`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, coachNotification]);
  };

  const handleRemoveLog = (logId: string) => {
    const targetLog = loggedActions.find((l) => l.id === logId);
    if (!targetLog) return;

    setLoggedActions((prev) => prev.filter((l) => l.id !== logId));
    setGreenPoints((prev) => Math.max(0, prev - targetLog.points));
    setTotalSavedCo2((prev) => Math.max(0, prev - targetLog.co2SavedKg));
  };

  // Carbon AI Coach communication proxy call
  const handleSendChatMessage = async (presetText?: string) => {
    const promptToSend = (presetText || chatInput).trim();
    if (!promptToSend) return;

    // Append raw user message locally
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.slice(-8), // Keep a compact chat context history limit
          footprintSummary: summary,
          latestPrompt: promptToSend,
        }),
      });

      if (!response.ok) {
        throw new Error('Coach API connection timed out.');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        content: data.content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'model',
        content: `⚠️ My apologies, my cognitive sustainability grids are flickering slightly.
Let's retry that shortly! I am fully equipped to guide you once connections restore.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      const resetWelcome: ChatMessage = {
        id: 'msg_welcome_reset',
        role: 'model',
        content: `Conversation reset! Ready for your sustainable inquiries. Let's tackle your current annual footprint of **${summary.totalYearlyTons} Metric Tons**!`,
        timestamp: new Date().toISOString(),
      };
      setMessages([resetWelcome]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Sleek Design Theme Header & Navigation bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Top Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-xs">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold font-display tracking-tight text-slate-800 block">EcoSphere</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase font-mono tracking-wider">Carbon Advisor</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500 items-center">
              <button
                id="btn-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 transition-all border-b-2 font-display ${
                  activeTab === 'dashboard'
                    ? 'text-emerald-600 border-emerald-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Overview
              </button>
              <button
                id="btn-tab-calculator"
                onClick={() => setActiveTab('calculator')}
                className={`py-2 px-1 transition-all border-b-2 font-display ${
                  activeTab === 'calculator'
                    ? 'text-emerald-600 border-emerald-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Setup Calculator
              </button>
              <button
                id="btn-tab-actions"
                onClick={() => setActiveTab('actions')}
                className={`py-2 px-1 transition-all border-b-2 font-display ${
                  activeTab === 'actions'
                    ? 'text-emerald-600 border-emerald-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Log Eco Actions
              </button>
              <button
                id="btn-tab-coach"
                onClick={() => setActiveTab('coach')}
                className={`py-2 px-1 transition-all border-b-2 font-display ${
                  activeTab === 'coach'
                    ? 'text-emerald-600 border-emerald-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                AI Carbon Coach
              </button>
            </nav>

            {/* Profile Statistics Indicator Badge */}
            <div className="flex items-center gap-3">
              <div id="badge-points-view" className="bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1.5 text-xs font-semibold">
                <Sparkles size={14} className="text-emerald-500" />
                <span>{greenPoints} pts</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100/50 px-3 py-1.5 rounded-xl hidden sm:flex items-center gap-1.5 text-xs font-medium text-indigo-700">
                <Trees size={14} className="text-indigo-500" />
                <span>{summary.totalYearlyTons} t/yr</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Sticky Tab switcher */}
      <div className="md:hidden bg-white border-b border-slate-200 grid grid-cols-4 sticky top-16 z-30 shadow-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 text-center text-xs font-semibold uppercase tracking-wider ${
            activeTab === 'dashboard' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`py-3 text-center text-xs font-semibold uppercase tracking-wider ${
            activeTab === 'calculator' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'
          }`}
        >
          Setup
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`py-3 text-center text-xs font-semibold uppercase tracking-wider ${
            activeTab === 'actions' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'
          }`}
        >
          Actions
        </button>
        <button
          onClick={() => setActiveTab('coach')}
          className={`py-3 text-center text-xs font-semibold uppercase tracking-wider ${
            activeTab === 'coach' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'
          }`}
        >
          Coach API
        </button>
      </div>

      {/* Main Structural Layout Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Dynamic Inner Tab Router Panel */}
        <div className="fade-in transition-all duration-300">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight">Environmental Dashboard</h1>
                  <p className="text-sm text-slate-500">
                    Real-time estimations of your environmental carbon load, offsets, and comparative performance indicators.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg self-start">
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="bg-white text-slate-800 px-3 py-1 text-xs rounded-md shadow-xs border border-slate-200/50 hover:bg-slate-50 transition font-medium"
                  >
                    Adjust Profile Constants
                  </button>
                </div>
              </div>

              {/* Renders Dashboard Component with interactive details */}
              <Dashboard
                footprintData={footprintData}
                summary={summary}
                greenPoints={greenPoints}
                totalSavedCo2={totalSavedCo2}
              />
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight">Setup Footprint Calculator</h1>
                <p className="text-sm text-slate-500">
                  Update your daily activities to recalculate your carbon ledger accurately. Changes persist locally instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Main Interactive Form with custom sliders & inputs */}
                <div className="lg:col-span-8 bg-white rounded-[32px] p-6 sm:p-8 shadow-xs border border-slate-100 space-y-8">
                  
                  {/* Transport Sector inputs */}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4 flex items-center gap-2">
                      <Car size={16} /> <span>1. Mobility & Travel Routine</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Primary Car Commuting Frequency
                        </label>
                        <div className="text-xs text-slate-400 mt-1">
                          Current weekly mileage: <span className="font-bold text-slate-700 font-mono text-sm">{footprintData.carKmWeekly} km</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="800"
                          step="20"
                          value={footprintData.carKmWeekly}
                          onChange={(e) => updateFootprintField('carKmWeekly', parseInt(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>0 km (No car commuting)</span>
                          <span>800 km / wk</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Vehicle Engine or Fuel Type
                        </label>
                        <select
                          value={footprintData.carType}
                          onChange={(e) => updateFootprintField('carType', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="gasoline">Gasoline or Diesel (High 0.22kg/km)</option>
                          <option value="hybrid">Standard Hybrid (Moderate 0.12kg/km)</option>
                          <option value="electric">Battery Electric EV (Eco 0.05kg/km)</option>
                          <option value="none">No Private Vehicle / Walk Only</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Weekly Public Transit Commuting Hours
                        </label>
                        <div className="text-xs text-slate-400 mt-1">
                          Bus, subway, train: <span className="font-bold text-slate-700 font-mono text-sm">{footprintData.publicTransitHoursWeekly} hours</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={footprintData.publicTransitHoursWeekly}
                          onChange={(e) => updateFootprintField('publicTransitHoursWeekly', parseInt(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>None</span>
                          <span>40 hours / wk</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Annual Commercial Aviation Hours
                        </label>
                        <div className="text-xs text-slate-400 mt-1">
                          Estimated flight length: <span className="font-bold text-slate-700 font-mono text-sm">{footprintData.flightsHoursYearly} hours</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="2"
                          value={footprintData.flightsHoursYearly}
                          onChange={(e) => updateFootprintField('flightsHoursYearly', parseInt(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>0 hrs (No planes)</span>
                          <span>100 hours / yr</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Utility Energy Sector inputs */}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-4 flex items-center gap-2">
                      <Zap size={16} /> <span>2. Household Energy Settings</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Electricity Consumed Monthly (kWh)
                        </label>
                        <div className="text-xs text-slate-400 mt-1">
                          Household billing metrics: <span className="font-bold text-slate-700 font-mono text-sm">{footprintData.electricityMonthlyKwh} kWh</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1200"
                          step="20"
                          value={footprintData.electricityMonthlyKwh}
                          onChange={(e) => updateFootprintField('electricityMonthlyKwh', parseInt(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>0 kWh</span>
                          <span>1200 kWh / mo</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Natural Gas Therms Billing
                        </label>
                        <div className="text-xs text-slate-400 mt-1">
                          Utility gas usage: <span className="font-bold text-slate-700 font-mono text-sm">{footprintData.gasMonthlyTherms} Therms</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={footprintData.gasMonthlyTherms}
                          onChange={(e) => updateFootprintField('gasMonthlyTherms', parseInt(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>0</span>
                          <span>100 Therms / mo</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Renewable Clean Energy Percentage
                        </label>
                        <div className="text-xs text-slate-400 mt-1">
                          Solar power or clean grid option: <span className="font-bold text-slate-700 font-mono text-sm">{footprintData.cleanEnergyPercentage}% option</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={footprintData.cleanEnergyPercentage}
                          onChange={(e) => updateFootprintField('cleanEnergyPercentage', parseInt(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Coal Standard Grid (0%)</span>
                          <span>100% Carbon Neutral Solar</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Household Co-Habitants Size
                        </label>
                        <select
                          value={footprintData.householdSize}
                          onChange={(e) => updateFootprintField('householdSize', parseInt(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                        >
                          <option value="1">1 Person (Solo Household emissions burden)</option>
                          <option value="2">2 Persons (Divided Shared household emissions)</option>
                          <option value="3">3 Persons</option>
                          <option value="4">4 Persons</option>
                          <option value="5">5+ Persons Roommates/Family</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Diet Sector inputs */}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4 flex items-center gap-2">
                      <Utensils size={16} /> <span>3. Diet Options & Food Waste Mitigation</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Typical Dietary Habit
                        </label>
                        <select
                          value={footprintData.dietType}
                          onChange={(e) => updateFootprintField('dietType', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="meat-heavy">Meat-Heavy (Beef/Lamb frequent - High Carbon)</option>
                          <option value="average">Standard Mixed / Omnivore (Moderate Carbon)</option>
                          <option value="vegetarian">Vegetarian (No meat - Low Carbon)</option>
                          <option value="vegan">Vegan / Plant-Based (Extreme Low Carbon)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Food Scrap / Waste Level
                        </label>
                        <select
                          value={footprintData.foodWasteLevel}
                          onChange={(e) => updateFootprintField('foodWasteLevel', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="high">High scraps left / frequently throw leftovers</option>
                          <option value="medium">Medium household scraps / standard leftovers</option>
                          <option value="low">Low waste / diligent meal planning</option>
                        </select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Seasonal or Organic/Local Crops Purchasing
                        </label>
                        <div className="text-xs text-slate-400 mt-1">
                          Percent of groceries sourced locally: <span className="font-bold text-slate-700 font-mono text-sm">{footprintData.localFoodPercentage}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={footprintData.localFoodPercentage}
                          onChange={(e) => updateFootprintField('localFoodPercentage', parseInt(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Imported off-season products (0%)</span>
                          <span>Farmers Market Enthusiast (100%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Shopping Waste Inputs */}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-500 mb-4 flex items-center gap-2">
                      <ShoppingBag size={16} /> <span>4. Consumption Goods & Waste Cycles</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Monthly Fashion / Clothing Purchases
                        </label>
                        <div className="text-xs text-slate-400 mt-1">
                          Estimated apparel items: <span className="font-bold text-slate-700 font-mono text-sm">{footprintData.clothingPurchasesMonthly} items per month</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={footprintData.clothingPurchasesMonthly}
                          onChange={(e) => updateFootprintField('clothingPurchasesMonthly', parseInt(e.target.value))}
                          className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>0 items</span>
                          <span>20 items</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Annual Major Technological Purchases
                        </label>
                        <div className="text-xs text-slate-400 mt-1">
                          Laptops, tablets, phones: <span className="font-bold text-slate-700 font-mono text-sm">{footprintData.devicePurchasesYearly} devices / year</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={footprintData.devicePurchasesYearly}
                          onChange={(e) => updateFootprintField('devicePurchasesYearly', parseInt(e.target.value))}
                          className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Solo reuse (0 devices)</span>
                          <span>Annual upgrades (10 items)</span>
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Household Recycling Rating
                        </label>
                        <select
                          value={footprintData.recyclingRating}
                          onChange={(e) => updateFootprintField('recyclingRating', parseInt(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                        >
                          <option value="1">Rating 1: Send all plastics and papers to direct landfills</option>
                          <option value="2">Rating 2: Sort occasionally, high container trash</option>
                          <option value="3">Rating 3: Moderate regular sorting and compost sorting</option>
                          <option value="4">Rating 4: Diligent sorting and avoidance of single use packs</option>
                          <option value="5">Rating 5: Certified Zero-Waste styling and total recycled loop</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Interactive Sidebar with Realtime Result */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Summary Metric Output Card */}
                  <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden shadow-xs">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                      Real-time Ledger Impact
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-6xl font-light tracking-tighter text-white font-display">
                          {summary.totalYearlyTons}
                        </span>
                        <span className="text-base text-slate-400 block mt-1">Tonnes CO₂e per annum</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pt-2">
                        Based on adjusted settings, your daily carbon emissions amount to <strong className="text-emerald-400">{summary.totalDailyKg} kg</strong>.
                      </p>

                      <div className="py-3 border-t border-slate-800 space-y-1">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Climate neutral goal:</span>
                          <span className="font-semibold text-emerald-400">2.0 Tonnes</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Regional average:</span>
                          <span className="text-slate-300 font-medium">16.0 Tonnes</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-xs italic text-slate-300 font-serif leading-relaxed">
                          "Your transport choices represent {Math.round((summary.transportDailyKg / summary.totalDailyKg) * 100)}% of your daily impact."
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-white transition shadow-xs flex items-center justify-center gap-1"
                      >
                        <span>View Analytics Dashboard</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Easy Action presets card */}
                  <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xs">
                    <h4 className="font-display font-semibold text-slate-800 text-sm mb-3">
                      Sustainable Quick Fix Tips
                    </h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Small parameters with massive carbon subtraction ratios:
                    </p>
                    <ul className="space-y-3.5 text-xs">
                      <li className="flex items-start gap-2 text-slate-600 leading-normal">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-1.5" />
                        <span>Sourcing <strong className="text-slate-800">50% local crops</strong> trims shipping mileage and can offset some food travel emissions.</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-600 leading-normal">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5" />
                        <span>Boosting your renewable clean grid to <strong className="text-slate-800">100%</strong> can reduce your utilities load to negligible.</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-600 leading-normal">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                        <span>Swapping a gasoline car to <strong className="text-slate-800">Battery EV (electric)</strong> saves ~0.17 kg CO2e per km.</span>
                      </li>
                    </ul>
                  </div>

                </div>

              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight">Active Eco Actions Logger</h1>
                  <p className="text-sm text-slate-500">
                    Log positive daily ecological modifications to track saved carbon and boost points!
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 text-slate-700 rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1 border border-slate-200">
                    <Award size={14} className="text-emerald-600" />
                    <span>Reward Factor: {loggedActions.length} recorded today</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* List of actions - Aligned with Next Best Actions in Theme */}
                <div className="lg:col-span-8 bg-white rounded-[32px] p-6 sm:p-8 shadow-xs border border-slate-100">
                  <h3 className="text-lg font-bold mb-6 text-slate-800">Aspirational Sustainable Challenge Presets</h3>
                  
                  <div className="space-y-4">
                    {ECO_ACTIONS.map((act) => {
                      // Check if already logged inside current history
                      const isLogged = loggedActions.some((l) => l.actionId === act.id);
                      
                      return (
                        <div
                          key={act.id}
                          className={`flex items-start md:items-center gap-4 p-4 rounded-2xl transition-all duration-200 border ${
                            isLogged
                              ? 'bg-emerald-50/55 border-emerald-100'
                              : 'border-slate-100 hover:bg-slate-50/70'
                          }`}
                        >
                          {/* Categorized Visual Avatar placeholder */}
                          <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm ${
                            act.category === 'transport'
                              ? 'bg-indigo-50 text-indigo-700'
                              : act.category === 'energy'
                              ? 'bg-amber-50 text-amber-700'
                              : act.category === 'food'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {act.category === 'transport' && <Car size={18} />}
                            {act.category === 'energy' && <Zap size={18} />}
                            {act.category === 'food' && <Utensils size={18} />}
                            {act.category === 'waste' && <ShoppingBag size={18} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-800 text-sm leading-snug">{act.name}</span>
                              <span className="text-[10px] uppercase font-semibold font-mono tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                {act.difficulty}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 md:line-clamp-none">
                              {act.description}
                            </p>
                            <div className="flex gap-4 mt-1.5 text-[11px] font-semibold text-emerald-600">
                              <span>Saves {act.co2SavedKg} kg CO₂e / day</span>
                              <span className="text-indigo-600">+{act.points} pts</span>
                            </div>
                          </div>

                          {/* Action logging Trigger button */}
                          <button
                            onClick={() => handleLogAction(act.id)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
                              isLogged
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700'
                            }`}
                          >
                            {isLogged ? 'Log Again' : 'Log Action'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: History logger column matching theme */}
                <div className="lg:col-span-4 bg-white rounded-[32px] p-6 border border-slate-100 shadow-xs space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-2">
                      <History size={16} className="text-indigo-600" />
                      <span>Today's Ecological Log</span>
                    </h3>
                    {loggedActions.length > 0 && (
                      <span className="font-mono text-[10px] text-slate-400">
                        {loggedActions.length} Actions
                      </span>
                    )}
                  </div>

                  {loggedActions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 space-y-2">
                      <CheckCircle2 size={32} className="mx-auto text-slate-300 stroke-1" />
                      <p className="text-xs leading-relaxed">
                        No eco-actions recorded for this session yet. Complete some high-impact swaps above to get logging!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                      {loggedActions.map((log) => (
                        <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{log.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 flex gap-2">
                              <span className="text-emerald-600">-{log.co2SavedKg} kg CO₂</span>
                              <span>+{log.points} pts</span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveLog(log.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 shrink-0 hover:bg-rose-50 rounded-lg transition"
                            title="Delete action"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary performance block inside ledger */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Activity points:</span>
                      <strong className="text-slate-800 font-mono font-bold">+{greenPoints} pts</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Verified carbon offset:</span>
                      <strong className="text-emerald-600 font-mono font-bold">-{totalSavedCo2.toFixed(1)} kg CO₂e</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 leading-normal flex items-start gap-1.5">
                      <span className="text-emerald-500">✓</span>
                      <span>Recorded offsets automatically decrease your daily footprint estimates during AI analysis consultations.</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {activeTab === 'coach' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight">AI Carbon Coach & Advisor</h1>
                  <p className="text-sm text-slate-500">
                    Get custom suggestions, carbon math, recipes, and action plans powered by server-side Gemini.
                  </p>
                </div>
                <button
                  onClick={clearChatHistory}
                  className="px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition self-start"
                >
                  Reset Conversation
                </button>
              </div>

              {/* Chat View Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Main Dialog Window */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[32px] h-[520px] flex flex-col overflow-hidden shadow-xs relative">
                  
                  {/* Persona Bio header banner */}
                  <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center">
                        <Sparkles size={14} className="text-emerald-400" />
                      </div>
                      <div>
                        <strong className="text-xs font-semibold block leading-snug">Sustaina - Climate Coach</strong>
                        <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-mono">Expert Carbon Advisor</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <span>grid profile alignment:</span>
                      <strong className="text-emerald-400 font-semibold">{summary.totalYearlyTons}t CO2e</strong>
                    </div>
                  </div>

                  {/* Messages Bubble Scroller */}
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar bg-slate-50/50">
                    {messages.map((m) => {
                      const isUser = m.role === 'user';
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'} transition-all`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                              isUser
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            {/* Author label */}
                            <span className={`block text-[9px] uppercase font-mono font-bold mb-1.5 tracking-wider ${
                              isUser ? 'text-indigo-200' : 'text-slate-400'
                            }`}>
                              {isUser ? 'You' : 'Sustaina (AI Analyst)'}
                            </span>
                            {/* Content markdown parsed helper style simulation */}
                            <div className="space-y-2 whitespace-pre-wrap">
                              {m.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-4 shadow-xs flex items-center gap-3 text-xs text-slate-500">
                          <Loader2 size={14} className="animate-spin text-emerald-600 shrink-0" />
                          <span>formulating localized carbon reduction strategies...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Send Chat input tool container */}
                  <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendChatMessage();
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask Sustaina anything: commuter models, food recipes, offsets formulas..."
                        className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                        disabled={isChatLoading}
                      />
                      <button
                        type="submit"
                        disabled={isChatLoading || !chatInput.trim()}
                        className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-100 disabled:text-slate-400 rounded-xl transition duration-150 shrink-0 flex items-center justify-center shadow-xs"
                      >
                        <Send size={15} />
                      </button>
                    </form>
                  </div>

                </div>

                {/* Left Quick Consult Pre-defined Suggestion sidebars */}
                <div className="lg:col-span-4 bg-white rounded-[32px] p-6 border border-slate-100 shadow-xs space-y-5">
                  <h3 className="font-display font-semibold text-slate-800 text-sm">
                    Prompt Quick Consultations
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click any quick-suggest action chip down below to consult Sustaina instantly with contextual profile values passed automatically:
                  </p>

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => handleSendChatMessage('Provide a custom 3-step action plan to tackle my absolute highest emissions category')}
                      className="text-left text-xs p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 text-slate-700 hover:text-indigo-900 transition rounded-xl font-medium"
                    >
                      💡 Category-Specific Reduction Plan
                    </button>
                    <button
                      onClick={() => handleSendChatMessage('Generate a green commute comparison table showing bus, train, hybrid, gas car emissions for daily trips')}
                      className="text-left text-xs p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 text-slate-700 hover:text-indigo-900 transition rounded-xl font-medium"
                    >
                      🚆 Compare Transport Alternatives
                    </button>
                    <button
                      onClick={() => handleSendChatMessage('Describe an eco-friendly weekday recipe based on leftover vegetable trims and simple cupboard supplies')}
                      className="text-left text-xs p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 text-slate-700 hover:text-emerald-950 transition rounded-xl font-medium"
                    >
                      🍲 Leftovers Recipe (Anti-Waste)
                    </button>
                    <button
                      onClick={() => handleSendChatMessage('What are major home electricity drains? Explain vampiric draw and how clean energy grids offset them')}
                      className="text-left text-xs p-3 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-100 text-slate-700 hover:text-amber-950 transition rounded-xl font-medium"
                    >
                      🔌 Vampire Draw & Household Grids
                    </button>
                  </div>

                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/40">
                    <p className="text-[11px] text-indigo-900 leading-normal italic">
                      "I automatically ingest your recalculated footprint metrics and registered daily eco-actions with each query to optimize personalized strategies."
                    </p>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>

      </main>

      {/* Sustainable footer and credential metrics */}
      <footer className="bg-slate-9 border-t border-slate-200 mt-auto py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-slate-400 font-medium">
            EcoSphere 🌱 Carbon Footprint Tracker & AI Advisor. Designed with Sleek Interface aesthetic principles.
          </p>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            All footprint coefficients derived from IPCC & EPA environmental guidelines.
          </p>
        </div>
      </footer>
    </div>
  );
}
